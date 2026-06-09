import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { GlucoseReading, SensorSession, SensorType } from '../../types/sensor.types';

interface GlucoseState {
  currentReading: GlucoseReading | null;
  history: GlucoseReading[];
  isConnected: boolean;
  sensorType: SensorType | null;
  sensorSession: SensorSession | null;
  loading: boolean;
  error: string | null;
}

const initialState: GlucoseState = {
  currentReading: null,
  history: [],
  isConnected: false,
  sensorType: null,
  sensorSession: null,
  loading: false,
  error: null,
};

const glucoseSlice = createSlice({
  name: 'glucose',
  initialState,
  reducers: {
    setCurrentReading: (state, action: PayloadAction<GlucoseReading>) => {
      state.currentReading = action.payload;
      state.history = [action.payload, ...state.history].slice(0, 720);
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setSensorType: (state, action: PayloadAction<SensorType>) => {
      state.sensorType = action.payload;
    },
    setSensorSession: (state, action: PayloadAction<SensorSession>) => {
      state.sensorSession = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addReadingToHistory: (state, action: PayloadAction<GlucoseReading>) => {
      state.history = [action.payload, ...state.history].slice(0, 720);
    },
  },
});

export const {
  setCurrentReading,
  setConnectionStatus,
  setSensorType,
  setSensorSession,
  setLoading,
  setError,
  addReadingToHistory,
} = glucoseSlice.actions;

export default glucoseSlice.reducer;