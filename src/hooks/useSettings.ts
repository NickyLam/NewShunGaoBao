import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import type { Settings } from '../types/sensor.types';
import {
  setAlarmsEnabled,
  setHighThreshold,
  setLowThreshold,
  setSignalLossAlarm,
  setHealthKitSync,
  addSharedUser,
  removeSharedUser,
} from '../store/slices/settingsSlice';
import { SettingsService } from '../services/SettingsService';

const settingsService = new SettingsService();

export const useSettings = () => {
  const settings = useSelector((state: RootState) => state.settings);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 当用户ID变化时，更新服务中的用户ID
  useEffect(() => {
    if (userId) {
      settingsService.setUserId(userId);
    }
  }, [userId]);

  // 加载设置
  const loadSettings = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const savedSettings = await settingsService.loadSettings();
      if (savedSettings) {
        // 更新 Redux store
        dispatch(setAlarmsEnabled(savedSettings.alarms.enabled));
        dispatch(setHighThreshold(savedSettings.alarms.highThreshold));
        dispatch(setLowThreshold(savedSettings.alarms.lowThreshold));
        dispatch(setSignalLossAlarm(savedSettings.alarms.signalLoss));
        dispatch(setHealthKitSync(savedSettings.healthKitSync));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载设置失败');
    } finally {
      setLoading(false);
    }
  }, [userId, dispatch]);

  // 保存设置
  const saveSettings = useCallback(async (newSettings: Settings) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      await settingsService.saveSettings(newSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存设置失败');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 更新单个设置项
  const updateSetting = useCallback(async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    if (!userId) return;

    setError(null);

    try {
      await settingsService.updateSetting(key, value);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新设置失败');
    }
  }, [userId]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    saveSettings,
    updateSetting,
  };
};
