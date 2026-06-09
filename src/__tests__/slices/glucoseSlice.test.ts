import { describe, it, expect } from '@jest/globals';
import reducer, {
  setCurrentReading,
  setConnectionStatus,
  setSensorType,
  setSensorSession,
  setLoading,
  setError,
  addReadingToHistory,
} from '../../store/slices/glucoseSlice';
import type { GlucoseReading } from '../../types/sensor.types';

describe('glucoseSlice', () => {
  const initialState = {
    currentReading: null,
    history: [],
    isConnected: false,
    sensorType: null,
    sensorSession: null,
    loading: false,
    error: null,
  };

  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle setCurrentReading', () => {
    const reading: GlucoseReading = {
      value: 100,
      timestamp: Date.now(),
      trend: '→',
      sensorId: 'sensor-123',
    };
    const nextState = reducer(initialState, setCurrentReading(reading));
    expect(nextState.currentReading).toEqual(reading);
    expect(nextState.history).toHaveLength(1);
    expect(nextState.history[0]).toEqual(reading);
  });

  it('should handle setConnectionStatus', () => {
    const nextState = reducer(initialState, setConnectionStatus(true));
    expect(nextState.isConnected).toBe(true);
  });

  it('should handle setSensorType', () => {
    const nextState = reducer(initialState, setSensorType('libre3'));
    expect(nextState.sensorType).toBe('libre3');
  });

  it('should handle setSensorSession', () => {
    const session = {
      sensorId: 'sensor-123',
      sensorType: 'libre3',
      startedAt: Date.now(),
      expiresAt: Date.now() + 86400000,
      isActive: true,
    };
    const nextState = reducer(initialState, setSensorSession(session));
    expect(nextState.sensorSession).toEqual(session);
  });

  it('should handle setLoading', () => {
    const nextState = reducer(initialState, setLoading(true));
    expect(nextState.loading).toBe(true);
  });

  it('should handle setError', () => {
    const nextState = reducer(initialState, setError('Test error'));
    expect(nextState.error).toBe('Test error');
  });

  it('should handle addReadingToHistory', () => {
    const reading1: GlucoseReading = {
      value: 100,
      timestamp: Date.now() - 60000,
      trend: '→',
      sensorId: 'sensor-123',
    };
    const reading2: GlucoseReading = {
      value: 105,
      timestamp: Date.now(),
      trend: '↑',
      sensorId: 'sensor-123',
    };

    let state = reducer(initialState, addReadingToHistory(reading1));
    expect(state.history).toHaveLength(1);

    state = reducer(state, addReadingToHistory(reading2));
    expect(state.history).toHaveLength(2);
    expect(state.history[0]).toEqual(reading2);
  });

  it('should limit history to 720 readings', () => {
    let state = initialState;
    for (let i = 0; i < 800; i++) {
      const reading: GlucoseReading = {
        value: 100 + i,
        timestamp: Date.now() - (800 - i) * 60000,
        trend: '→',
        sensorId: 'sensor-123',
      };
      state = reducer(state, addReadingToHistory(reading));
    }
    expect(state.history).toHaveLength(720);
  });
});
