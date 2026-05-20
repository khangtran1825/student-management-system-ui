import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  username: string;
  role: string;
  studentId?: number | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const rawUser = localStorage.getItem('user');
let parsedUser = null;
try {
  if (rawUser) {
    const parsed = JSON.parse(rawUser);
    // Ensure the object has required fields, otherwise discard it
    if (parsed && typeof parsed === 'object' && parsed.username && parsed.role) {
      parsedUser = parsed;
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
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
