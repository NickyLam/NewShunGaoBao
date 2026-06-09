import { describe, it, expect } from '@jest/globals';
import { store } from '../store/store';

describe('Store Configuration', () => {
  it('should create store with all reducers', () => {
    const state = store.getState();
    expect(state.glucose).toBeDefined();
    expect(state.settings).toBeDefined();
    expect(state.auth).toBeDefined();
    expect(state.notes).toBeDefined();
  });

  it('should have initial glucose state', () => {
    const state = store.getState();
    expect(state.glucose.currentReading).toBeNull();
    expect(state.glucose.history).toEqual([]);
    expect(state.glucose.isConnected).toBe(false);
    expect(state.glucose.sensorType).toBeNull();
  });

  it('should have initial settings state', () => {
    const state = store.getState();
    expect(state.settings.alarms.enabled).toBe(true);
    expect(state.settings.alarms.highThreshold).toBe(180);
    expect(state.settings.alarms.lowThreshold).toBe(70);
  });

  it('should have initial auth state', () => {
    const state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.auth.isPremium).toBe(false);
    expect(state.auth.loading).toBe(false);
  });

  it('should have initial notes state', () => {
    const state = store.getState();
    expect(state.notes.notes).toEqual([]);
    expect(state.notes.loading).toBe(false);
    expect(state.notes.error).toBeNull();
  });
});
