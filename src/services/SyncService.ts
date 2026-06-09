import firestore from '@react-native-firebase/firestore';
import type { GlucoseReading, Note } from '../types/sensor.types';

export class SyncService {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  async syncReading(reading: GlucoseReading) {
    if (!this.userId) return;

    await firestore()
      .collection('users')
      .doc(this.userId)
      .collection('glucoseReadings')
      .doc(reading.timestamp.toString())
      .set({
        value: reading.value,
        timestamp: firestore.Timestamp.fromMillis(reading.timestamp),
        trend: reading.trend,
        sensorId: reading.sensorId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  }

  async syncReadingsBatch(readings: GlucoseReading[]) {
    if (!this.userId) return;

    const batch = firestore().batch();

    readings.forEach(reading => {
      const docRef = firestore()
        .collection('users')
        .doc(this.userId)
        .collection('glucoseReadings')
        .doc(reading.timestamp.toString());

      batch.set(docRef, {
        value: reading.value,
        timestamp: firestore.Timestamp.fromMillis(reading.timestamp),
        trend: reading.trend,
        sensorId: reading.sensorId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
  }

  async fetchReadings(days: number = 7): Promise<GlucoseReading[]> {
    if (!this.userId) return [];

    const since = Date.now() - (days * 24 * 60 * 60 * 1000);

    const snapshot = await firestore()
      .collection('users')
      .doc(this.userId)
      .collection('glucoseReadings')
      .where('timestamp', '>=', firestore.Timestamp.fromMillis(since))
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        value: data.value,
        timestamp: data.timestamp?.toMillis() || 0,
        trend: data.trend,
        sensorId: data.sensorId,
      };
    });
  }

  async addNote(note: Note) {
    if (!this.userId) return;

    await firestore()
      .collection('users')
      .doc(this.userId)
      .collection('notes')
      .doc(note.id)
      .set({
        id: note.id,
        timestamp: firestore.Timestamp.fromMillis(note.timestamp),
        type: note.type,
        content: note.content,
        glucoseReadingId: note.glucoseReadingId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  }

  async fetchNotes(): Promise<Note[]> {
    if (!this.userId) return [];

    const snapshot = await firestore()
      .collection('users')
      .doc(this.userId)
      .collection('notes')
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        timestamp: data.timestamp?.toMillis() || 0,
        type: data.type,
        content: data.content,
        glucoseReadingId: data.glucoseReadingId,
      };
    });
  }

  async updateSettings(settings: any) {
    if (!this.userId) return;

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

  async fetchSettings() {
    if (!this.userId) return null;

    const doc = await firestore()
      .collection('users')
      .doc(this.userId)
      .collection('settings')
      .doc('main')
      .get();

    return doc.exists ? doc.data() : null;
  }
}