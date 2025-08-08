import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { createBooking, updateBooking, deleteBooking } from '../store/bookingSlice';

interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  roomId: number;
  creatorId: number;
}

const toLocalISOString = (date: Date): string => {
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

const BookingManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { rooms } = useSelector((state: RootState) => state.rooms);
  const { bookings, isLoading: bookingsLoading, error: bookingsError } = useSelector((state: RootState) => state.bookings);

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [bookingStartTime, setBookingStartTime] = useState('');
  const [bookingEndTime, setBookingEndTime] = useState('');
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    if (selectedRoomId && bookingStartTime && bookingEndTime) {
      try {
        await dispatch(createBooking({
          roomId: selectedRoomId,
          startTime: bookingStartTime,
          endTime: bookingEndTime,
        })).unwrap();
        setSelectedRoomId(null);
        setBookingStartTime('');
        setBookingEndTime('');
      } catch (error: any) {
        setBookingError(error.message || 'Помилка при створенні бронювання.');
      }
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setBookingError(null);
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
        setBookingError(error.message || 'Помилка при оновленні бронювання.');
      }
    }
  };

  const handleDeleteBooking = (bookingId: number) => {
    if (window.confirm('Ви впевнені, що хочете скасувати це бронювання?')) {
      dispatch(deleteBooking(bookingId));
    }
  };

  return (
    <div>
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
  );
};

export default BookingManagement;