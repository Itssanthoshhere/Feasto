import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// ─── Service URLs ───────────────────────────────────────────────────────────
export const AUTH_SERVICE_URL = process.env.EXPO_PUBLIC_AUTH_URL || 'https://feasto-auth.onrender.com';
export const RESTAURANT_SERVICE_URL = process.env.EXPO_PUBLIC_RESTAURANT_URL || 'https://feasto-restaurant.onrender.com';
export const UTILS_SERVICE_URL = process.env.EXPO_PUBLIC_UTILS_URL || 'https://feasto-utils.onrender.com';
export const REALTIME_SERVICE_URL = process.env.EXPO_PUBLIC_REALTIME_URL || 'wss://feasto-realtime.onrender.com';

// ─── Token helpers ───────────────────────────────────────────────────────────
export const getToken = () => SecureStore.getItemAsync('token');
export const setToken = (t: string) => SecureStore.setItemAsync('token', t);
export const removeToken = () => SecureStore.deleteItemAsync('token');

// ─── Axios instances ─────────────────────────────────────────────────────────
const TIMEOUT = 15000;
export const authApi = axios.create({ baseURL: AUTH_SERVICE_URL, timeout: TIMEOUT });
export const restaurantApi = axios.create({ baseURL: RESTAURANT_SERVICE_URL, timeout: TIMEOUT });
export const utilsApi = axios.create({ baseURL: UTILS_SERVICE_URL, timeout: TIMEOUT });

// Attach token to every request
[authApi, restaurantApi, utilsApi].forEach((instance) => {
  instance.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
});
