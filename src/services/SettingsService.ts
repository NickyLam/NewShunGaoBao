import firestore from '@react-native-firebase/firestore';
import type { Settings } from '../types/sensor.types';

export class SettingsService {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * 保存设置到 Firestore
   */
  async saveSettings(settings: Settings): Promise<void> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    await firestore()
      .collection('users')
      .doc(this.userId)
      .collection('settings')
      .doc('main')
      .set({
        ...settings,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
  }

  /**
   * 从 Firestore 加载设置
   */
  async loadSettings(): Promise<Settings | null> {
    if (!this.userId) {
      return null;
    }

    const doc = await firestore()
      .collection('users')
      .doc(this.userId)
      .collection('settings')
      .doc('main')
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return {
      alarms: {
        enabled: data?.alarms?.enabled ?? true,
        highThreshold: data?.alarms?.highThreshold ?? 180,
        lowThreshold: data?.alarms?.lowThreshold ?? 70,
        signalLoss: data?.alarms?.signalLoss ?? true,
      },
      healthKitSync: data?.healthKitSync ?? false,
      sharedWith: data?.sharedWith ?? [],
    };
  }

  /**
   * 更新单个设置项
   */
  async updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ): Promise<void> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    await firestore()
      .collection('users')
      .doc(this.userId)
      .collection('settings')
      .doc('main')
      .set(
        { [key]: value, updatedAt: firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
  }
}
