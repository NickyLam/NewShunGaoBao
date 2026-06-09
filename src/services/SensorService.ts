import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import type { GlucoseReading, TrendArrow, SensorType } from '../types/sensor.types';

// FreeStyle Libre BLE UUIDs
const GLUCOSE_SERVICE_UUID = '1808';
const GLUCOSE_MEASUREMENT_CHARACTERISTIC_UUID = '2A18';
const DEVICE_INFORMATION_SERVICE_UUID = '180A';

// FreeStyle Libre 传感器类型识别
const SENSOR_NAMES = {
  libre1: ['FreeStyle Libre'],
  libre2: ['FreeStyle Libre 2'],
  libre3: ['FreeStyle Libre 3'],
  libre3Plus: ['FreeStyle Libre 3 Plus'],
};

export class SensorService {
  private manager: BleManager;
  private sensorDevice: Device | null = null;
  private scanSubscription: Subscription | null = null;
  private monitoringSubscription: Subscription | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  /**
   * 扫描并连接 FreeStyle Libre 传感器
   * 扫描超时时间: 30秒
   */
  async scanAndConnect(): Promise<Device | null> {
    return new Promise((resolve, reject) => {
      this.scanSubscription = this.manager.startDeviceScan(
        null,
        null,
        async (error, device) => {
          if (error) {
            this.manager.stopDeviceScan();
            this.scanSubscription?.remove();
            reject(error);
            return;
          }

          if (device && device.name && this.isFreeStyleLibreSensor(device.name)) {
            this.manager.stopDeviceScan();
            this.scanSubscription?.remove();

            try {
              // 连接设备
              const connectedDevice = await device.connect();
              // 发现所有服务和特征
              const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
              this.sensorDevice = discoveredDevice;
              resolve(discoveredDevice);
            } catch (connectError) {
              reject(connectError);
            }
          }
        }
      );

      // 30秒扫描超时
      setTimeout(() => {
        this.manager.stopDeviceScan();
        this.scanSubscription?.remove();
        resolve(null);
      }, 30000);
    });
  }

  /**
   * 开始监听血糖数据
   */
  async startMonitoring(onReading: (reading: GlucoseReading) => void): Promise<void> {
    if (!this.sensorDevice) {
      throw new Error('No sensor connected');
    }

    const services = await this.sensorDevice.services();
    const glucoseService = services.find(s => s.uuid === GLUCOSE_SERVICE_UUID);

    if (!glucoseService) {
      throw new Error('Glucose service not found');
    }

    const characteristics = await glucoseService.characteristics();
    const measurementChar = characteristics.find(
      c => c.uuid === GLUCOSE_MEASUREMENT_CHARACTERISTIC_UUID
    );

    if (!measurementChar) {
      throw new Error('Glucose measurement characteristic not found');
    }

    // 监听特征值变化
    this.monitoringSubscription = measurementChar.monitor((error, characteristic) => {
      if (error) {
        console.error('Monitoring error:', error);
        return;
      }

      if (characteristic?.value) {
        const reading = this.parseGlucoseMeasurement(characteristic.value);
        if (reading) {
          onReading(reading);
        }
      }
    });
  }

  /**
   * 断开传感器连接
   */
  async disconnect(): Promise<void> {
    this.monitoringSubscription?.remove();
    this.scanSubscription?.remove();
    this.monitoringSubscription = null;
    this.scanSubscription = null;

    if (this.sensorDevice) {
      await this.sensorDevice.cancelConnection();
      this.sensorDevice = null;
    }
  }

  /**
   * 检查设备是否为 FreeStyle Libre 传感器
   */
  private isFreeStyleLibreSensor(deviceName: string): boolean {
    const lowerName = deviceName.toLowerCase();
    return Object.values(SENSOR_NAMES).flat().some(name =>
      lowerName.includes(name.toLowerCase())
    );
  }

  /**
   * 解析血糖测量数据
   * 
   * FreeStyle Libre 数据格式（简化版）:
   * - 字节 0-1: 血糖值 (SFLOAT, 小端序)
   * - 字节 2: 趋势箭头
   * - 字节 3-6: 时间戳 (可选)
   * 
   * 注意: 这是简化实现，实际解析需要参考 FreeStyle Libre BLE 协议文档
   */
  private parseGlucoseMeasurement(base64Value: string): GlucoseReading | null {
    try {
      // 将 Base64 转换为字节数组
      const rawBytes = this.base64ToBytes(base64Value);
      
      if (rawBytes.length < 4) {
        console.warn('Invalid glucose measurement data length');
        return null;
      }

      // 解析血糖值 (SFLOAT 格式简化处理)
      // 实际实现需要完整的 SFLOAT 解码
      const glucoseValue = this.parseSFloat(rawBytes.slice(0, 2));
      
      // 解析趋势箭头
      const trendByte = rawBytes[2];
      const trend = this.parseTrendArrow(trendByte);

      return {
        value: Math.round(glucoseValue),
        timestamp: Date.now(),
        trend,
        sensorId: this.sensorDevice?.id || 'unknown',
      };
    } catch (error) {
      console.error('Failed to parse glucose measurement:', error);
      return null;
    }
  }

  /**
   * Base64 转字节数组
   */
  private base64ToBytes(base64: string): number[] {
    const binaryString = atob(base64);
    const bytes: number[] = [];
    for (let i = 0; i < binaryString.length; i++) {
      bytes.push(binaryString.charCodeAt(i));
    }
    return bytes;
  }

  /**
   * 解析 SFLOAT (IEEE 11073 SFLOAT)
   * 简化实现，实际需要完整实现标准
   */
  private parseSFloat(bytes: number[]): number {
    if (bytes.length !== 2) return 0;
    
    const value = (bytes[1] << 8) | bytes[0];
    const mantissa = value & 0x0FFF;
    const exponent = (value >> 12) & 0x0F;
    
    // 处理有符号指数
    const signedExponent = exponent > 7 ? exponent - 16 : exponent;
    
    // 处理有符号尾数
    const signedMantissa = mantissa > 2047 ? mantissa - 4096 : mantissa;
    
    return signedMantissa * Math.pow(10, signedExponent);
  }

  /**
   * 解析趋势箭头
   */
  private parseTrendArrow(byte: number): TrendArrow {
    const trendMap: Record<number, TrendArrow> = {
      0x01: '↓↓',
      0x02: '↓',
      0x03: '→',
      0x04: '↑',
      0x05: '↑↑',
    };
    return trendMap[byte] || '→';
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.sensorDevice !== null;
  }
}
