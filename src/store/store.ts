import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import glucoseReducer from './slices/glucoseSlice';
import settingsReducer from './slices/settingsSlice';
import authReducer from './slices/authSlice';
import notesReducer from './slices/notesSlice';
import { glucoseApi } from './api/glucoseApi';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const store = configureStore({
  reducer: {
    glucose: glucoseReducer,
    settings: settingsReducer,
    auth: authReducer,
    notes: notesReducer,
    [glucoseApi.reducerPath]: glucoseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    let middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['glucose/setCurrentReading'],
        ignoredPaths: ['glucose.currentReading.timestamp'],
      },
    }).concat(glucoseApi.middleware);

    if (isDevelopment) {
      middleware = middleware.concat(logger);
    }

    return middleware;
  },
  devTools: isDevelopment,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;