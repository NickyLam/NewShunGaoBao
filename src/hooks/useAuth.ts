import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AuthService } from '../services/AuthService';
import { SyncService } from '../services/SyncService';
import { setUser, setIsPremium, setLoading } from '../store/slices/authSlice';
import { setNotes } from '../store/slices/notesSlice';
import type { AppDispatch } from '../store/store';

const authService = new AuthService();
const syncService = new SyncService();

export const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user) {
        syncService.setUserId(user.uid);
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }));
        loadUserData();
      } else {
        dispatch(setUser(null));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  const loadUserData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const notes = await syncService.fetchNotes();
      dispatch(setNotes(notes));
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      dispatch(setLoading(true));
      const user = await authService.signInWithEmail(email, password);
      if (user) {
        syncService.setUserId(user.uid);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      dispatch(setLoading(true));
      const user = await authService.signUpWithEmail(email, password, displayName);
      if (user) {
        syncService.setUserId(user.uid);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : '退出失败');
    }
  }, []);

  return {
    error,
    signIn,
    signUp,
    signOut,
  };
};