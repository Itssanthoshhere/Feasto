import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ─── Service URLs ───────────────────────────────────────────────────────────
export const AUTH_SERVICE_URL = 'https://feasto-auth.onrender.com';
export const RESTAURANT_SERVICE_URL = 'https://feasto-restaurant.onrender.com';
export const UTILS_SERVICE_URL = 'https://feasto-utils.onrender.com';
export const REALTIME_SERVICE_URL = 'wss://feasto-realtime.onrender.com';

// ─── Token helpers ───────────────────────────────────────────────────────────
export const getToken = () => AsyncStorage.getItem('token');
export const setToken = (t: string) => AsyncStorage.setItem('token', t);
export const removeToken = () => AsyncStorage.removeItem('token');

// ─── Axios instances ─────────────────────────────────────────────────────────
export const authApi = axios.create({ baseURL: AUTH_SERVICE_URL });
export const restaurantApi = axios.create({ baseURL: RESTAURANT_SERVICE_URL });
export const utilsApi = axios.create({ baseURL: UTILS_SERVICE_URL });

// Attach token to every request
[authApi, restaurantApi, utilsApi].forEach((instance) => {
  instance.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
});
