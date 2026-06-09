import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Settings } from '../../types/sensor.types';

const initialState: Settings = {
  alarms: {
    enabled: true,
    highThreshold: 180,
    lowThreshold: 70,
    signalLoss: true,
  },
  healthKitSync: false,
  sharedWith: [],
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setAlarmsEnabled: (state, action: PayloadAction<boolean>) => {
      state.alarms.enabled = action.payload;
    },
    setHighThreshold: (state, action: PayloadAction<number>) => {
      state.alarms.highThreshold = action.payload;
    },
    setLowThreshold: (state, action: PayloadAction<number>) => {
      state.alarms.lowThreshold = action.payload;
    },
    setSignalLossAlarm: (state, action: PayloadAction<boolean>) => {
      state.alarms.signalLoss = action.payload;
    },
    setHealthKitSync: (state, action: PayloadAction<boolean>) => {
      state.healthKitSync = action.payload;
    },
    addSharedUser: (state, action: PayloadAction<string>) => {
      if (!state.sharedWith.includes(action.payload)) {
        state.sharedWith.push(action.payload);
      }
    },
    removeSharedUser: (state, action: PayloadAction<string>) => {
      state.sharedWith = state.sharedWith.filter(id => id !== action.payload);
    },
  },
});

export const {
  setAlarmsEnabled,
  setHighThreshold,
  setLowThreshold,
  setSignalLossAlarm,
  setHealthKitSync,
  addSharedUser,
  removeSharedUser,
} = settingsSlice.actions;

export default settingsSlice.reducer;