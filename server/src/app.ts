import express, { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { syncDatabase, User, Room, Booking } from './models';
// import sequelize from './config/database'; // Цей рядок більше не потрібен
import { Op } from 'sequelize'; // Правильний імпорт операторів

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fgdhfjfjtfyutfjy';

app.use(json());
app.use(cors());

// --- Мідлвари для автентифікації та перевірки ролі ---
interface JwtPayload {
    id: number;
    email: string;
    role: 'Admin' | 'User';
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        (req as any).user = user as JwtPayload;
        next();
    });
};

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user && (req as any).user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admin role required.' });
    }
};

// --- Ендпоінти для автентифікації ---
app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userCount = await User.count();
        const role = userCount === 0 ? 'Admin' : 'User';

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Неправильна електронна пошта або пароль' });
        }

        if (!user.password) {
            console.error('Login error: Password field is null or undefined for user:', user.email);
            return res.status(500).json({ message: 'Внутрішня помилка сервера: неможливо перевірити пароль.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Неправильна електронна пошта або пароль' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Внутрішня помилка сервера' });
    }
});

// --- Ендпоінти для керування кімнатами ---
app.post('/api/rooms', authenticateToken, adminOnly, async (req: Request, res: Response) => {
    try {
        const { title, description } = req.body;
        const newRoom = await Room.create({ title, description });
        res.status(201).json(newRoom);
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ message: 'Server error during room creation.' });
    }
});

app.get('/api/rooms', authenticateToken, async (req: Request, res: Response) => {
    try {
        const rooms = await Room.findAll();
        res.status(200).json(rooms);
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({ message: 'Server error during getting rooms.' });
    }
});

app.put('/api/rooms/:id', authenticateToken, adminOnly, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const [updated] = await Room.update({ title, description }, { where: { id } });

        if (updated) {
            const updatedRoom = await Room.findByPk(id);
            return res.status(200).json(updatedRoom);
        }
        
        return res.status(404).json({ message: 'Room not found.' });

    } catch (error) {
        console.error('Update room error:', error);
        res.status(500).json({ message: 'Server error during room update.' });
    }
});

app.delete('/api/rooms/:id', authenticateToken, adminOnly, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Room.destroy({ where: { id } });

        if (deleted) {
            return res.status(204).send();
        }

        return res.status(404).json({ message: 'Room not found.' });

    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({ message: 'Server error during room deletion.' });
    }
});

// --- Ендпоінти для керування бронюваннями (Bookings) ---

// Допоміжна функція для перевірки конфліктів часу
const checkTimeConflict = async (roomId: number, startTime: Date, endTime: Date, bookingId: number | null = null): Promise<boolean> => {
    
    const whereConditions: any = {
        roomId,
        [Op.or]: [
            // Існуюче бронювання починається до того, як закінчується нове
            {
                startTime: { [Op.lt]: endTime },
                endTime: { [Op.gt]: startTime },
            },
        ],
    };

    // Якщо ми оновлюємо існуюче бронювання, виключаємо його з перевірки
    if (bookingId) {
        whereConditions.id = { [Op.ne]: bookingId };
    }

    const conflictingBookings = await Booking.findAll({
        where: whereConditions,
    });

    return conflictingBookings.length > 0;
};

// Створення бронювання
app.post('/api/bookings', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { roomId, startTime, endTime } = req.body;
        const creatorId = (req as any).user.id;

        const hasConflict = await checkTimeConflict(roomId, new Date(startTime), new Date(endTime));
        if (hasConflict) {
            return res.status(409).json({ message: 'Кімната вже заброньована на цей час.' });
        }

        const newBooking = await Booking.create({
            roomId,
            creatorId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
        });

        res.status(201).json(newBooking);
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: 'Server error during booking creation.' });
    }
});

app.get('/api/bookings', authenticateToken, async (req: Request, res: Response) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: Room },
                { model: User, as: 'Creator', attributes: ['id', 'name', 'email'] },
            ],
            order: [['startTime', 'ASC']],
        });
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ message: 'Server error during getting bookings.' });
    }
});

// Оновлення бронювання
app.put('/api/bookings/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { roomId, startTime, endTime } = req.body;
        const userId = (req as any).user.id;

        const booking = await Booking.findByPk(id);

        if (!booking) {
            return res.status(404).json({ message: 'Бронювання не знайдено.' });
        }

        if (booking.creatorId !== userId && (req as any).user.role !== 'Admin') {
            return res.status(403).json({ message: 'Недостатньо прав для оновлення цього бронювання.' });
        }

        const hasConflict = await checkTimeConflict(roomId, new Date(startTime), new Date(endTime), booking.id);
        if (hasConflict) {
            return res.status(409).json({ message: 'Кімната вже заброньована на цей час.' });
        }

        await booking.update({ roomId, startTime, endTime });
        res.status(200).json(booking);
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ message: 'Server error during booking update.' });
    }
});

// Скасування/видалення бронювання
app.delete('/api/bookings/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const booking = await Booking.findByPk(id);

        if (!booking) {
            return res.status(404).json({ message: 'Бронювання не знайдено.' });
        }

        if (booking.creatorId !== userId && (req as any).user.role !== 'Admin') {
            return res.status(403).json({ message: 'Недостатньо прав для скасування цього бронювання.' });
        }

        await booking.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({ message: 'Server error during booking deletion.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    syncDatabase();
});