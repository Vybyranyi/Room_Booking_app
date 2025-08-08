import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { logout } from '../store/authSlice';

const MainPage: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // Додаємо useEffect для відстеження змін
  useEffect(() => {
    console.log('Current user state:', user);
    console.log('Current token state:', token);
  }, [user, token]);


  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) {
    return <div>Користувач не авторизований.</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Вітаю, {user.name}!</h1>
      <p>ID: {user.id}</p>
      <p>Email: {user.email}</p>
      <p>Роль: {user.role}</p>
      <p>Токен: {token}</p>
      <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
        Вийти
      </button>
    </div>
  );
};

export default MainPage;