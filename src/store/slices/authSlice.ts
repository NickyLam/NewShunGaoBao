import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null;
  isPremium: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isPremium: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
    },
    setIsPremium: (state, action: PayloadAction<boolean>) => {
      state.isPremium = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isPremium = false;
    },
  },
});

export const { setUser, setIsPremium, setLoading, logout } = authSlice.actions;

export default authSlice.reducer;