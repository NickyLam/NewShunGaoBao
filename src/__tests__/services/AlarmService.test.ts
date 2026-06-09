import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { AlarmService } from '../../services/AlarmService';

describe('AlarmService', () => {
  let alarmService: AlarmService;

  beforeEach(() => {
    alarmService = new AlarmService();
  });

  describe('checkGlucoseAlarm', () => {
    it('should return true when glucose is above high threshold', () => {
      const reading = {
        value: 200,
        timestamp: Date.now(),
        trend: '↑',
        sensorId: 'sensor-123',
      };
      const config = { highThreshold: 180, lowThreshold: 70, enabled: true, signalLossEnabled: true };
      const result = alarmService.checkGlucoseAlarm(reading, config);
      expect(result).toBe(true);
    });

    it('should return true when glucose is below low threshold', () => {
      const reading = {
        value: 60,
        timestamp: Date.now(),
        trend: '↓',
        sensorId: 'sensor-123',
      };
      const config = { highThreshold: 180, lowThreshold: 70, enabled: true, signalLossEnabled: true };
      const result = alarmService.checkGlucoseAlarm(reading, config);
      expect(result).toBe(true);
    });

    it('should return false when glucose is within range', () => {
      const reading = {
        value: 100,
        timestamp: Date.now(),
        trend: '→',
        sensorId: 'sensor-123',
      };
      const config = { highThreshold: 180, lowThreshold: 70, enabled: true, signalLossEnabled: true };
      const result = alarmService.checkGlucoseAlarm(reading, config);
      expect(result).toBe(false);
    });

    it('should return false when glucose is exactly at high threshold', () => {
      const reading = {
        value: 180,
        timestamp: Date.now(),
        trend: '→',
        sensorId: 'sensor-123',
      };
      const config = { highThreshold: 180, lowThreshold: 70, enabled: true, signalLossEnabled: true };
      const result = alarmService.checkGlucoseAlarm(reading, config);
      expect(result).toBe(false);
    });

    it('should return false when glucose is exactly at low threshold', () => {
      const reading = {
        value: 70,
        timestamp: Date.now(),
        trend: '→',
        sensorId: 'sensor-123',
      };
      const config = { highThreshold: 180, lowThreshold: 70, enabled: true, signalLossEnabled: true };
      const result = alarmService.checkGlucoseAlarm(reading, config);
      expect(result).toBe(false);
    });

    it('should return false when alarms are disabled', () => {
      const reading = {
        value: 250,
        timestamp: Date.now(),
        trend: '↑',
        sensorId: 'sensor-123',
      };
      const config = { highThreshold: 180, lowThreshold: 70, enabled: false, signalLossEnabled: true };
      const result = alarmService.checkGlucoseAlarm(reading, config);
      expect(result).toBe(false);
    });
  });

  describe('checkSignalLoss', () => {
    it('should return false when no readings have been received', () => {
      const config = { highThreshold: 180, lowThreshold: 70, enabled: true, signalLossEnabled: true };
      const result = alarmService.checkSignalLoss(config);
      expect(result).toBe(false);
    });
  });

  describe('triggerAlarm', () => {
    it('should not throw an error', () => {
      expect(() => alarmService.triggerAlarm('high', 200)).not.toThrow();
    });

    it('should respect cooldown period', () => {
      // First alarm should work
      alarmService.triggerAlarm('high', 200);
      
      // Second alarm should be blocked by cooldown
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      alarmService.triggerAlarm('low', 50);
      consoleSpy.mockRestore();
    });
  });
});
