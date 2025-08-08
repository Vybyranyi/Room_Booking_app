import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { logout } from '../store/authSlice';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '../store/roomSlice';
import { fetchBookings, createBooking, updateBooking, deleteBooking } from '../store/bookingSlice';

// Визначення інтерфейсів для коректної роботи TypeScript
interface Room {
  id: number;
  title: string;
  description: string;
}

interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  roomId: number;
  creatorId: number;
  // Додаткові поля, якщо вони будуть потрібні
}

const MainPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { rooms, isLoading: roomsLoading, error: roomsError } = useSelector((state: RootState) => state.rooms);
  const { bookings, isLoading: bookingsLoading, error: bookingsError } = useSelector((state: RootState) => state.bookings);

  // Стан для керування кімнатами
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editingRoomTitle, setEditingRoomTitle] = useState('');
  const [editingRoomDescription, setEditingRoomDescription] = useState('');

  // Стан для керування бронюваннями
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [bookingStartTime, setBookingStartTime] = useState('');
  const [bookingEndTime, setBookingEndTime] = useState('');
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);

  // Стан для відображення помилок бронювання
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchRooms());
      dispatch(fetchBookings());
    }
  }, [dispatch, user]);

  const handleLogout = () => { dispatch(logout()); };

  // Логіка для кімнат
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomTitle && newRoomDescription) {
      dispatch(createRoom({ title: newRoomTitle, description: newRoomDescription }));
      setNewRoomTitle('');
      setNewRoomDescription('');
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoomId(room.id);
    setEditingRoomTitle(room.title);
    setEditingRoomDescription(room.description);
  };

  const handleUpdateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoomId && editingRoomTitle && editingRoomDescription) {
      dispatch(updateRoom({
        id: editingRoomId,
        title: editingRoomTitle,
        description: editingRoomDescription,
      }));
      setEditingRoomId(null);
      setEditingRoomTitle('');
      setEditingRoomDescription('');
    }
  };

  const handleDeleteRoom = (roomId: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю кімнату? Всі пов\'язані бронювання будуть видалені.')) {
      dispatch(deleteRoom(roomId));
    }
  };

  // --- Логіка для бронювань (виправлено) ---
  
  // Допоміжна функція для конвертації UTC в локальний час
  const toLocalISOString = (date: Date): string => {
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null); // Очищаємо попередні помилки
    if (selectedRoomId && bookingStartTime && bookingEndTime) {
      try {
        await dispatch(createBooking({
          roomId: selectedRoomId,
          startTime: bookingStartTime,
          endTime: bookingEndTime,
        })).unwrap(); // Використовуємо unwrap для обробки помилок
        setSelectedRoomId(null);
        setBookingStartTime('');
        setBookingEndTime('');
      } catch (error: any) {
        setBookingError(error); // Зберігаємо помилку в стані
      }
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setBookingError(null); // Очищаємо помилки при редагуванні
    setEditingBookingId(booking.id);
    setSelectedRoomId(booking.roomId);
    setBookingStartTime(toLocalISOString(new Date(booking.startTime)));
    setBookingEndTime(toLocalISOString(new Date(booking.endTime)));
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    if (editingBookingId && selectedRoomId && bookingStartTime && bookingEndTime) {
      try {
        await dispatch(updateBooking({
          id: editingBookingId,
          roomId: selectedRoomId,
          startTime: bookingStartTime,
          endTime: bookingEndTime,
        })).unwrap();
        setEditingBookingId(null);
        setSelectedRoomId(null);
        setBookingStartTime('');
        setBookingEndTime('');
      } catch (error: any) {
        setBookingError(error);
      }
    }
  };

  const handleDeleteBooking = (bookingId: number) => {
    if (window.confirm('Ви впевнені, що хочете скасувати це бронювання?')) {
      dispatch(deleteBooking(bookingId));
    }
  };

  return (
    <div className="p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Вітаю, {user?.name}!</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Вийти
        </button>
      </div>

      <p className="mb-4 text-gray-700">Ваша роль: <span className="font-semibold">{user?.role}</span></p>

      {/* Форма для створення кімнат (лише для адмінів) */}
      {user?.role === 'Admin' && (
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Керування кімнатами</h2>
          <form onSubmit={editingRoomId ? handleUpdateRoom : handleCreateRoom} className="flex flex-col gap-4 mb-4">
            <input
              type="text"
              placeholder="Назва кімнати"
              value={editingRoomId ? editingRoomTitle : newRoomTitle}
              onChange={(e) => (editingRoomId ? setEditingRoomTitle(e.target.value) : setNewRoomTitle(e.target.value))}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Опис кімнати"
              value={editingRoomId ? editingRoomDescription : newRoomDescription}
              onChange={(e) => (editingRoomId ? setEditingRoomDescription(e.target.value) : setNewRoomDescription(e.target.value))}
              className="px-3 py-2 border rounded"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={roomsLoading}
              >
                {roomsLoading ? 'Завантаження...' : (editingRoomId ? 'Оновити кімнату' : 'Створити кімнату')}
              </button>
              {editingRoomId && (
                <button
                  type="button"
                  onClick={() => setEditingRoomId(null)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Скасувати
                </button>
              )}
            </div>
          </form>
          {roomsLoading && <p>Завантаження кімнат...</p>}
          {roomsError && <p className="text-red-500">Помилка: {roomsError}</p>}
          {rooms.length > 0 && (
            <ul className="space-y-2">
              {rooms.map(room => (
                <li key={room.id} className="bg-white p-3 rounded-md flex justify-between items-center shadow-sm">
                  <span>{room.title}</span>
                  <div>
                    <button onClick={() => handleEditRoom(room)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2">
                      Редагувати
                    </button>
                    <button onClick={() => handleDeleteRoom(room.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                      Видалити
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Форма для створення/редагування бронювання */}
      <div className="bg-blue-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingBookingId ? 'Редагувати бронювання' : 'Забронювати кімнату'}</h2>
        <form onSubmit={editingBookingId ? handleUpdateBooking : handleCreateBooking} className="flex flex-col gap-4">
          <select
            value={selectedRoomId || ''}
            onChange={(e) => setSelectedRoomId(Number(e.target.value))}
            className="px-3 py-2 border rounded"
            required
          >
            <option value="">Виберіть кімнату</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.title}</option>
            ))}
          </select>
          <label>
            Початок:
            <input
              type="datetime-local"
              value={bookingStartTime}
              onChange={(e) => setBookingStartTime(e.target.value)}
              className="px-3 py-2 border rounded w-full"
              required
            />
          </label>
          <label>
            Кінець:
            <input
              type="datetime-local"
              value={bookingEndTime}
              onChange={(e) => setBookingEndTime(e.target.value)}
              className="px-3 py-2 border rounded w-full"
              required
            />
          </label>
          {bookingError && <p className="text-red-500">{bookingError}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={bookingsLoading}
          >
            {bookingsLoading ? 'Завантаження...' : editingBookingId ? 'Оновити бронювання' : 'Забронювати'}
          </button>
          {editingBookingId && (
            <button
              type="button"
              onClick={() => {
                setEditingBookingId(null);
                setSelectedRoomId(null);
                setBookingStartTime('');
                setBookingEndTime('');
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Скасувати редагування
            </button>
          )}
        </form>
      </div>

      <hr className="my-6" />

      {/* Список поточних бронювань */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Актуальні бронювання</h2>
        {bookingsLoading && <p>Завантаження бронювань...</p>}
        {bookingsError && <p className="text-red-500">Помилка: {bookingsError}</p>}
        {bookings.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => {
              const room = rooms.find(r => r.id === booking.roomId);
              const isCreator = booking.creatorId === user?.id;
              const canEditOrDelete = isCreator || user?.role === 'Admin';
              return (
                <li key={booking.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  <h3 className="text-xl font-bold">Кімната: {room?.title || 'Невідомо'}</h3>
                  <p>Початок: {new Date(booking.startTime).toLocaleString()}</p>
                  <p>Кінець: {new Date(booking.endTime).toLocaleString()}</p>
                  {canEditOrDelete && (
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleEditBooking(booking)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Редагувати</button>
                      <button onClick={() => handleDeleteBooking(booking.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Скасувати</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          !bookingsLoading && <p className="text-gray-500">Бронювань поки що немає.</p>
        )}
      </div>
    </div>
  );
};

export default MainPage;