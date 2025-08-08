import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { logout } from '../store/authSlice';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '../store/roomSlice';

interface Room {
  id: number;
  title: string;
  description: string;
}

const MainPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { rooms, isLoading, error } = useSelector((state: RootState) => state.rooms);

  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');

  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editingRoomTitle, setEditingRoomTitle] = useState('');
  const [editingRoomDescription, setEditingRoomDescription] = useState('');

  useEffect(() => {
    if (user) {
      dispatch(fetchRooms());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomTitle) {
      dispatch(createRoom({ title: newRoomTitle, description: newRoomDescription }));
      setNewRoomTitle('');
      setNewRoomDescription('');
    }
  };

  const handleEditClick = (room: Room) => {
    setEditingRoomId(room.id);
    setEditingRoomTitle(room.title);
    setEditingRoomDescription(room.description);
  };

  const handleUpdateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoomId) {
      dispatch(updateRoom({
        id: editingRoomId,
        title: editingRoomTitle,
        description: editingRoomDescription
      }));
      setEditingRoomId(null);
    }
  };

  const handleDeleteRoom = (roomId: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю кімнату?')) {
      dispatch(deleteRoom(roomId));
    }
  };

  if (!user) {
    return <div>Користувач не авторизований.</div>;
  }

  return (
    <div className="p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Вітаю, {user.name}!</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Вийти
        </button>
      </div>

      <p className="mb-4 text-gray-700">Ваша роль: <span className="font-semibold">{user.role}</span></p>

      {user.role === 'Admin' && (
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Створити нову кімнату</h2>
          <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Назва кімнати"
              value={newRoomTitle}
              onChange={(e) => setNewRoomTitle(e.target.value)}
              required
              className="px-3 py-2 border rounded"
            />
            <textarea
              placeholder="Опис кімнати"
              value={newRoomDescription}
              onChange={(e) => setNewRoomDescription(e.target.value)}
              rows={3}
              className="px-3 py-2 border rounded"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Створення...' : 'Створити кімнату'}
            </button>
          </form>
        </div>
      )}

      <hr className="my-6" />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Список переговорних кімнат</h2>
        {isLoading && <p>Завантаження кімнат...</p>}
        {error && <p className="text-red-500">Помилка: {error}</p>}
        {rooms.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <li key={room.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                {editingRoomId === room.id ? (
                  <form onSubmit={handleUpdateRoom} className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editingRoomTitle}
                      onChange={(e) => setEditingRoomTitle(e.target.value)}
                      className="px-2 py-1 border rounded"
                      required
                    />
                    <textarea
                      value={editingRoomDescription}
                      onChange={(e) => setEditingRoomDescription(e.target.value)}
                      className="px-2 py-1 border rounded"
                      rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                      <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Зберегти</button>
                      <button type="button" onClick={() => setEditingRoomId(null)} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500">Скасувати</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="text-xl font-bold">{room.title}</h3>
                    <p className="text-gray-600 mt-2 flex-grow">{room.description}</p>
                    {user.role === 'Admin' && (
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => handleEditClick(room)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Редагувати</button>
                        <button onClick={() => handleDeleteRoom(room.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Видалити</button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          !isLoading && <p className="text-gray-500">Кімнат поки що немає.</p>
        )}
      </div>
    </div>
  );
};

export default MainPage;