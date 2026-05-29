import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  username: string;
  role: string;
  studentId?: number | null;
  mustChangePassword?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const rawUser = localStorage.getItem('user');
let parsedUser: User | null = null;

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return true;
    // exp is in seconds since epoch
    return Date.now() / 1000 >= payload.exp;
  } catch (e) {
    return true;
  }
}

try {
  const token = localStorage.getItem('token');
  if (rawUser && token && !isTokenExpired(token)) {
    const parsed = JSON.parse(rawUser);
    if (parsed && typeof parsed === 'object' && parsed.username && parsed.role) {
      parsedUser = parsed;
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  } else {
    // remove stale/expired data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
} catch (e) {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

const initialState: AuthState = {
  user: parsedUser,
  token: parsedUser ? localStorage.getItem('token') : null,
  isAuthenticated: !!parsedUser && !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
