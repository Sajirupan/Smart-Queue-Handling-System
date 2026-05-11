"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser, getProfile } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getProfile();
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (data.user.role === 'admin') router.push('/admin');
      else if (data.user.role === 'staff') router.push('/staff');
      else router.push('/');
      
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      throw err;
    }
  };

  const register = async (name, email, password, role, phone) => {
    try {
      const data = await registerUser({ name, email, password, role, phone });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      toast.success('Registration successful!');
      
      if (data.user.role === 'admin') router.push('/admin');
      else if (data.user.role === 'staff') router.push('/staff');
      else router.push('/');
      
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
