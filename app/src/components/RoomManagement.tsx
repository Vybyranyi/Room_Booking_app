import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { createRoom, updateRoom, deleteRoom } from '../store/roomSlice';

interface Room {
  id: number;
  title: string;
  description: string;
}

const RoomManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rooms, isLoading: roomsLoading, error: roomsError } = useSelector((state: RootState) => state.rooms);

  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editingRoomTitle, setEditingRoomTitle] = useState('');
  const [editingRoomDescription, setEditingRoomDescription] = useState('');

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

  return (
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
  );
};

export default RoomManagement;