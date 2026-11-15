

baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ||
    'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('resqmap_access');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function registerUser(formData) {
  const { data } = await api.post('/auth/register/', formData);
  return data;
}

export async function login(username, password) {
  logout();

  try {
    const { data } = await api.post('/auth/login/', {
      username,
      password,
    });

    sessionStorage.setItem('resqmap_access', data.access);
    sessionStorage.setItem('resqmap_refresh', data.refresh);

    const profile = await api.get('/auth/profile/');
    const user = profile.data;

    if (
      user.role === 'RESCUE_TEAM' &&
      !user.is_verified
    ) {
      throw new Error('Rescue team account not verified.');
    }

    if (
      !['SURVIVOR', 'RESCUE_TEAM', 'ADMIN'].includes(user.role)
    ) {
      throw new Error('Invalid account role.');
    }

    sessionStorage.setItem('resqmap_user', JSON.stringify(user));

    return user;

  } catch (error) {
    logout();
    throw error;
  }
}

export function getSavedUser() {
  try {
    return JSON.parse(
      sessionStorage.getItem('resqmap_user') || 'null'
    );
  } catch {
    return null;
  }
}

export function logout() {
  sessionStorage.removeItem('resqmap_access');
  sessionStorage.removeItem('resqmap_refresh');
  sessionStorage.removeItem('resqmap_user');
}

export default api;
