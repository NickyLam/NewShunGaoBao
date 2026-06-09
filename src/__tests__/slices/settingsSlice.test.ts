import { describe, it, expect } from '@jest/globals';
import reducer, {
  setAlarmsEnabled,
  setHighThreshold,
  setLowThreshold,
  setSignalLossAlarm,
  setHealthKitSync,
  addSharedUser,
  removeSharedUser,
} from '../../store/slices/settingsSlice';

describe('settingsSlice', () => {
  const initialState = {
    alarms: {
      enabled: true,
      highThreshold: 180,
      lowThreshold: 70,
      signalLoss: true,
    },
    healthKitSync: false,
    sharedWith: [],
  };

  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle setAlarmsEnabled', () => {
    const nextState = reducer(initialState, setAlarmsEnabled(false));
    expect(nextState.alarms.enabled).toBe(false);
  });

  it('should handle setHighThreshold', () => {
    const nextState = reducer(initialState, setHighThreshold(200));
    expect(nextState.alarms.highThreshold).toBe(200);
  });

  it('should handle setLowThreshold', () => {
    const nextState = reducer(initialState, setLowThreshold(60));
    expect(nextState.alarms.lowThreshold).toBe(60);
  });

  it('should handle setSignalLossAlarm', () => {
    const nextState = reducer(initialState, setSignalLossAlarm(false));
    expect(nextState.alarms.signalLoss).toBe(false);
  });

  it('should handle setHealthKitSync', () => {
    const nextState = reducer(initialState, setHealthKitSync(true));
    expect(nextState.healthKitSync).toBe(true);
  });

  it('should handle addSharedUser', () => {
    let state = reducer(initialState, addSharedUser('user1'));
    expect(state.sharedWith).toEqual(['user1']);

    state = reducer(state, addSharedUser('user2'));
    expect(state.sharedWith).toEqual(['user1', 'user2']);
  });

  it('should not add duplicate shared users', () => {
    let state = reducer(initialState, addSharedUser('user1'));
    state = reducer(state, addSharedUser('user1'));
    expect(state.sharedWith).toEqual(['user1']);
  });

  it('should handle removeSharedUser', () => {
    let state = initialState;
    state = reducer(state, addSharedUser('user1'));
    state = reducer(state, addSharedUser('user2'));
    state = reducer(state, addSharedUser('user3'));

    state = reducer(state, removeSharedUser('user2'));
    expect(state.sharedWith).toEqual(['user1', 'user3']);
  });
});
