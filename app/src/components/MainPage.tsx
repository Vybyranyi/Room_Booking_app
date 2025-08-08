import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { logout } from '../store/authSlice';
import { fetchRooms } from '../store/roomSlice';
import { fetchBookings } from '../store/bookingSlice';
import RoomManagement from './RoomManagement';
import BookingManagement from './BookingManagement';

const MainPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchRooms());
      dispatch(fetchBookings());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) {
    return null;
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
      
      {user.role === 'Admin' && <RoomManagement />}

      <hr className="my-6" />

      <BookingManagement />
    </div>
  );
};

export default MainPage;