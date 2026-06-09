export type SensorType = 'libre1' | 'libre2' | 'libre3' | 'libre3Plus';

export type TrendArrow = '↑↑' | '↑' | '→' | '↓' | '↓↓';

export interface GlucoseReading {
  value: number;
  timestamp: number;
  trend: TrendArrow;
  sensorId: string;
}

export interface SensorSession {
  sensorId: string;
  sensorType: SensorType;
  startedAt: number;
  expiresAt: number;
  isActive: boolean;
}

export interface Note {
  id: string;
  timestamp: number;
  type: 'meal' | 'insulin' | 'exercise' | 'medication' | 'other';
  content: string;
  glucoseReadingId?: string;
}

export interface Settings {
  alarms: {
    enabled: boolean;
    highThreshold: number;
    lowThreshold: number;
    signalLoss: boolean;
  };
  healthKitSync: boolean;
  sharedWith: string[];
}