'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthFormState {
  isLogin: boolean;
  email: string;
  password: string;
  name: string;
  error: string;
}

interface AuthFormContextType extends AuthFormState {
  setIsLogin: (isLogin: boolean) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setName: (name: string) => void;
  setError: (error: string) => void;
  resetForm: () => void;
}

const AuthFormContext = createContext<AuthFormContextType | undefined>(undefined);

export function AuthFormProvider({ children }: { children: ReactNode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  return (
    <AuthFormContext.Provider
      value={{
        isLogin,
        email,
        password,
        name,
        error,
        setIsLogin,
        setEmail,
        setPassword,
        setName,
        setError,
        resetForm,
      }}
    >
      {children}
    </AuthFormContext.Provider>
  );
}

export function useAuthForm() {
  const context = useContext(AuthFormContext);
  if (context === undefined) {
    throw new Error('useAuthForm must be used within an AuthFormProvider');
  }
  return context;
}
