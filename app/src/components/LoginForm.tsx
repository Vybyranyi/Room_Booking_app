import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';
import type { AppDispatch, RootState } from '../store/store';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <>
      <h3 className="text-2xl font-bold text-center">Вхід</h3>
      <form onSubmit={handleSubmit}>
        <div className="mt-4">
          <div>
            <label className="block" htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="password">Пароль</label>
            <input
              type="password"
              placeholder="Пароль"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="mt-4 text-red-500">{error}</p>}
          <div className="flex items-baseline justify-between mt-4">
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
              disabled={isLoading}
            >
              {isLoading ? 'Завантаження...' : 'Увійти'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default LoginForm;