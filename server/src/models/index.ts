import { User } from './User';
import Room from './Room';
import Booking from './Booking';
import sequelize from '../config/database';

// Зв'язок між Room та Booking (один до багатьох)
Room.hasMany(Booking, { foreignKey: 'roomId' });
Booking.belongsTo(Room, { foreignKey: 'roomId' });

// Зв'язок між User та Booking (один до багатьох - автор бронювання)
User.hasMany(Booking, { foreignKey: 'creatorId', as: 'CreatedBookings' });
Booking.belongsTo(User, { foreignKey: 'creatorId', as: 'Creator' });

// Функція для синхронізації всіх моделей з базою даних
async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

export { User, Room, Booking, syncDatabase };