import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SensorService } from '../services/SensorService';
import { SyncService } from '../services/SyncService';
import { StorageService } from '../services/StorageService';
import { AlarmService } from '../services/AlarmService';
import {
  setCurrentReading,
  setConnectionStatus,
  setSensorType,
  setSensorSession,
  addReadingToHistory,
} from '../store/slices/glucoseSlice';
import type { AppDispatch } from '../store/store';
import type { GlucoseReading, SensorType, Settings } from '../types/sensor.types';
import { useSelector as useReduxSelector } from 'react-redux';
import type { RootState } from '../store/store';

export const useSensor = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const sensorServiceRef = useRef<SensorService | null>(null);
  const syncServiceRef = useRef<SyncService>(new SyncService());
  const storageServiceRef = useRef<StorageService>(new StorageService());
  const alarmServiceRef = useRef<AlarmService>(new AlarmService());
  
  const userId = useSelector((state: RootState) => state.auth.user?.uid);
  const settings = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    sensorServiceRef.current = new SensorService();
    
    // 设置用户ID到同步服务
    if (userId) {
      syncServiceRef.current.setUserId(userId);
    }

    return () => {
      sensorServiceRef.current?.disconnect();
    };
  }, [userId]);

  // 处理新血糖读数
  const handleNewReading = useCallback(async (reading: GlucoseReading) => {
    // 更新 Redux store
    dispatch(setCurrentReading(reading));
    dispatch(addReadingToHistory(reading));
    
    // 更新报警服务的最后读数时间
    alarmServiceRef.current.updateLastReadingTime(reading.timestamp);
    
    // 保存到本地存储
    try {
      await storageServiceRef.current.saveReading(reading);
    } catch (error) {
      console.error('Failed to save reading locally:', error);
    }
    
    // 同步到云端
    if (userId) {
      setIsSyncing(true);
      try {
        await syncServiceRef.current.syncReading(reading);
      } catch (error) {
        console.error('Failed to sync reading:', error);
      } finally {
        setIsSyncing(false);
      }
    }
    
    // 检查报警
    const alarmConfig = {
      highThreshold: settings.alarms.highThreshold,
      lowThreshold: settings.alarms.lowThreshold,
      enabled: settings.alarms.enabled,
      signalLossEnabled: settings.alarms.signalLoss,
    };
    
    const isAlarm = alarmServiceRef.current.checkGlucoseAlarm(reading, alarmConfig);
    if (isAlarm) {
      const alarmType = reading.value > settings.alarms.highThreshold ? 'high' : 'low';
      alarmServiceRef.current.triggerAlarm(alarmType, reading.value);
    }
  }, [dispatch, userId, settings]);

  // 扫描并连接传感器
  const scanAndConnect = useCallback(async () => {
    if (!sensorServiceRef.current) return;

    setIsScanning(true);
    setError(null);

    try {
      const device = await sensorServiceRef.current.scanAndConnect();

      if (device) {
        dispatch(setConnectionStatus(true));
        dispatch(setSensorType('libre3' as SensorType));
        dispatch(setSensorSession({
          sensorId: device.id,
          sensorType: 'libre3' as SensorType,
          startedAt: Date.now(),
          expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
          isActive: true,
        }));

        await sensorServiceRef.current.startMonitoring(handleNewReading);
      } else {
        setError('未找到传感器');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败');
    } finally {
      setIsScanning(false);
    }
  }, [dispatch, handleNewReading]);

  // 断开连接
  const disconnect = useCallback(async () => {
    if (!sensorServiceRef.current) return;

    try {
      await sensorServiceRef.current.disconnect();
      dispatch(setConnectionStatus(false));
      dispatch(setSensorType(null));
      dispatch(setSensorSession(null));
    } catch (err) {
      setError(err instanceof Error ? err.message : '断开连接失败');
    }
  }, [dispatch]);

  // 添加模拟数据（用于测试）
  const addMockReading = useCallback(() => {
    const trendValues = ['↑↑', '↑', '→', '↓', '↓↓'] as const;
    const trend = trendValues[Math.floor(Math.random() * trendValues.length)];
    const value = 80 + Math.floor(Math.random() * 80);

    const reading: GlucoseReading = {
      value,
      timestamp: Date.now(),
      trend,
      sensorId: 'mock-sensor-001',
    };

    handleNewReading(reading);
  }, [handleNewReading]);

  // 加载历史数据
  const loadHistoryData = useCallback(async (days: number = 7) => {
    if (!userId) return;
    
    setIsSyncing(true);
    try {
      const readings = await syncServiceRef.current.fetchReadings(days);
      readings.forEach(reading => {
        dispatch(addReadingToHistory(reading));
      });
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [dispatch, userId]);

  // 加载本地缓存数据
  const loadCachedData = useCallback(async () => {
    try {
      const readings = await storageServiceRef.current.getRecentReadings(7);
      readings.forEach(reading => {
        dispatch(addReadingToHistory(reading));
      });
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  }, [dispatch]);

  return {
    isScanning,
    isSyncing,
    error,
    scanAndConnect,
    disconnect,
    addMockReading,
    loadHistoryData,
    loadCachedData,
  };
};
