import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    try {
      let token, storedUser;
      
      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
        storedUser = localStorage.getItem('user');
      } else {
        token = await SecureStore.getItemAsync('token');
        storedUser = await SecureStore.getItemAsync('user');
      }
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to restore token', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      if (Platform.OS === 'web') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
      }
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      const { token, ...userData } = response.data;
      
      if (Platform.OS === 'web') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
      }
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
      }
      setUser(null);
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
