import React from 'react';
import AuthForm from '../components/login/AuthForm';

const LoginPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-[70vh] py-20 flex items-center justify-center px-4">
      <AuthForm />
    </div>
  );
};

export default LoginPage;
