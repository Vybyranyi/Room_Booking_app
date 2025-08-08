import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';

import AuthPage from './components/AuthPage';
import MainPage from './components/MainPage';

const App: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/" element={user ? <MainPage /> : <Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;