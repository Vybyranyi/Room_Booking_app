import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        {isLogin ? <LoginForm /> : <RegisterForm />}
        <div className="flex items-baseline justify-between mt-4">
          <p className="text-sm text-gray-600">
            {isLogin ? "Не маєте акаунту?" : "Вже маєте акаунт?"}
          </p>
          <button
            type="button"
            className="px-6 py-2 text-blue-600 hover:text-blue-900"
            onClick={toggleForm}
          >
            {isLogin ? 'Зареєструватися' : 'Увійти'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;