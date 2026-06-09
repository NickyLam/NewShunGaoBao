import { describe, it, expect } from '@jest/globals';
import reducer, {
  setUser,
  setIsPremium,
  setLoading,
  logout,
} from '../../store/slices/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    isPremium: false,
    loading: false,
  };

  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle setUser', () => {
    const user = {
      uid: 'user-123',
      email: 'test@example.com',
      displayName: 'Test User',
    };
    const nextState = reducer(initialState, setUser(user));
    expect(nextState.user).toEqual(user);
  });

  it('should handle setIsPremium', () => {
    const nextState = reducer(initialState, setIsPremium(true));
    expect(nextState.isPremium).toBe(true);
  });

  it('should handle setLoading', () => {
    const nextState = reducer(initialState, setLoading(true));
    expect(nextState.loading).toBe(true);
  });

  it('should handle logout', () => {
    const stateWithUser = {
      user: {
        uid: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      },
      isPremium: true,
      loading: false,
    };
    const nextState = reducer(stateWithUser, logout());
    expect(nextState.user).toBeNull();
    expect(nextState.isPremium).toBe(false);
  });
});
