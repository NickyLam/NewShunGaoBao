import { Platform, Alert, Vibration } from 'react-native';
import type { GlucoseReading } from '../types/sensor.types';

export interface AlarmConfig {
  highThreshold: number;
  lowThreshold: number;
  enabled: boolean;
  signalLossEnabled: boolean;
}

export class AlarmService {
  private lastAlarmTime: number = 0;
  private alarmCooldown: number = 5 * 60 * 1000; // 5分钟冷却时间，避免重复报警
  private lastReadingTime: number = 0;

  /**
   * 检查血糖是否超出阈值
   */
  checkGlucoseAlarm(
    reading: GlucoseReading,
    config: AlarmConfig
  ): boolean {
    if (!config.enabled) return false;
    
    const { highThreshold, lowThreshold } = config;
    const isAlarm = reading.value > highThreshold || reading.value < lowThreshold;
    
    if (isAlarm) {
      this.lastReadingTime = reading.timestamp;
    }
    
    return isAlarm;
  }

  /**
   * 检查信号丢失
   */
  checkSignalLoss(config: AlarmConfig): boolean {
    if (!config.signalLossEnabled || !config.enabled) return false;
    
    const now = Date.now();
    const timeSinceLastReading = now - this.lastReadingTime;
    
    // 如果超过15分钟没有新数据，触发信号丢失报警
    const signalLossThreshold = 15 * 60 * 1000;
    
    if (this.lastReadingTime > 0 && timeSinceLastReading > signalLossThreshold) {
      return true;
    }
    
    return false;
  }

  /**
   * 触发报警
   */
  triggerAlarm(type: 'high' | 'low' | 'signalLoss', value?: number): void {
    const now = Date.now();
    
    // 检查冷却时间
    if (now - this.lastAlarmTime < this.alarmCooldown) {
      return;
    }
    
    this.lastAlarmTime = now;
    
    // 触发振动
    this.triggerVibration();
    
    // 显示报警
    this.showAlarmAlert(type, value);
  }

  /**
   * 触发振动
   */
  private triggerVibration(): void {
    if (Platform.OS === 'ios') {
      // iOS 振动模式
      Vibration.vibrate([500, 200, 500, 200, 500]);
    } else {
      // Android 振动模式
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);
    }
  }

  /**
   * 显示报警弹窗
   */
  private showAlarmAlert(type: 'high' | 'low' | 'signalLoss', value?: number): void {
    let title = '';
    let message = '';
    
    switch (type) {
      case 'high':
        title = '⚠️ 高血糖警告';
        message = `血糖值 ${value} mg/dL 超过高阈值！请及时处理。`;
        break;
      case 'low':
        title = '🚨 低血糖警告';
        message = `血糖值 ${value} mg/dL 低于低阈值！请立即补充糖分。`;
        break;
      case 'signalLoss':
        title = '📡 信号丢失';
        message = '传感器连接中断，请检查传感器状态。';
        break;
    }
    
    Alert.alert(title, message, [
      { text: '知道了', style: 'default' },
      { text: '查看详情', onPress: () => console.log('Navigate to glucose detail') },
    ]);
  }

  /**
   * 重置报警状态
   */
  reset(): void {
    this.lastAlarmTime = 0;
    this.lastReadingTime = 0;
  }

  /**
   * 更新最后读数时间
   */
  updateLastReadingTime(timestamp: number): void {
    this.lastReadingTime = timestamp;
  }
}
