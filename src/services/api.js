import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For Android emulator use 10.0.2.2. Change this to your machine's local IP for real devices (e.g., 192.168.1.x)
const API_URL = Platform.OS === 'web' ? 'http://localhost:5000/api' : 'http://192.168.29.191:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
      } else {
        token = await SecureStore.getItemAsync('token');
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from SecureStore', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
