import EncryptedStorage from 'react-native-encrypted-storage';
import type { GlucoseReading, Note } from '../types/sensor.types';

const READINGS_KEY = 'cached_readings';
const NOTES_KEY = 'cached_notes';
const MAX_CACHED_READINGS = 1000;

export class StorageService {
  /**
   * 保存血糖读数到本地加密存储
   */
  async saveReading(reading: GlucoseReading): Promise<void> {
    try {
      const existingReadings = await this.getCachedReadings();
      
      // 添加新读数到开头
      const updatedReadings = [reading, ...existingReadings].slice(0, MAX_CACHED_READINGS);
      
      await EncryptedStorage.setItem(READINGS_KEY, JSON.stringify(updatedReadings));
    } catch (error) {
      console.error('Failed to save reading:', error);
      throw error;
    }
  }

  /**
   * 批量保存血糖读数
   */
  async saveReadings(readings: GlucoseReading[]): Promise<void> {
    try {
      const existingReadings = await this.getCachedReadings();
      
      // 合并并去重
      const allReadings = [...readings, ...existingReadings];
      const uniqueReadings = this.deduplicateReadings(allReadings);
      const sortedReadings = uniqueReadings
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_CACHED_READINGS);
      
      await EncryptedStorage.setItem(READINGS_KEY, JSON.stringify(sortedReadings));
    } catch (error) {
      console.error('Failed to save readings:', error);
      throw error;
    }
  }

  /**
   * 获取缓存的血糖读数
   */
  async getCachedReadings(): Promise<GlucoseReading[]> {
    try {
      const data = await EncryptedStorage.getItem(READINGS_KEY);
      if (!data) return [];
      
      const readings: GlucoseReading[] = JSON.parse(data);
      return readings;
    } catch (error) {
      console.error('Failed to get cached readings:', error);
      return [];
    }
  }

  /**
   * 获取指定时间范围内的读数
   */
  async getReadingsByTimeRange(startTime: number, endTime: number): Promise<GlucoseReading[]> {
    const allReadings = await this.getCachedReadings();
    return allReadings.filter(
      reading => reading.timestamp >= startTime && reading.timestamp <= endTime
    );
  }

  /**
   * 获取最近N天的读数
   */
  async getRecentReadings(days: number): Promise<GlucoseReading[]> {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const allReadings = await this.getCachedReadings();
    return allReadings.filter(reading => reading.timestamp >= cutoffTime);
  }

  /**
   * 保存备注
   */
  async saveNote(note: Note): Promise<void> {
    try {
      const existingNotes = await this.getCachedNotes();
      const updatedNotes = [note, ...existingNotes];
      
      await EncryptedStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Failed to save note:', error);
      throw error;
    }
  }

  /**
   * 获取缓存的备注
   */
  async getCachedNotes(): Promise<Note[]> {
    try {
      const data = await EncryptedStorage.getItem(NOTES_KEY);
      if (!data) return [];
      
      const notes: Note[] = JSON.parse(data);
      return notes;
    } catch (error) {
      console.error('Failed to get cached notes:', error);
      return [];
    }
  }

  /**
   * 删除备注
   */
  async deleteNote(noteId: string): Promise<void> {
    try {
      const existingNotes = await this.getCachedNotes();
      const filteredNotes = existingNotes.filter(note => note.id !== noteId);
      
      await EncryptedStorage.setItem(NOTES_KEY, JSON.stringify(filteredNotes));
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  }

  /**
   * 清除所有缓存数据
   */
  async clearAll(): Promise<void> {
    try {
      await EncryptedStorage.removeItem(READINGS_KEY);
      await EncryptedStorage.removeItem(NOTES_KEY);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * 去重读数（基于时间戳）
   */
  private deduplicateReadings(readings: GlucoseReading[]): GlucoseReading[] {
    const seen = new Map<number, GlucoseReading>();
    
    for (const reading of readings) {
      const existing = seen.get(reading.timestamp);
      if (!existing || reading.timestamp > existing.timestamp) {
        seen.set(reading.timestamp, reading);
      }
    }
    
    return Array.from(seen.values());
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats(): Promise<{
    readingsCount: number;
    notesCount: number;
    oldestReading: number | null;
    newestReading: number | null;
  }> {
    const readings = await this.getCachedReadings();
    const notes = await this.getCachedNotes();
    
    return {
      readingsCount: readings.length,
      notesCount: notes.length,
      oldestReading: readings.length > 0 
        ? readings[readings.length - 1].timestamp 
        : null,
      newestReading: readings.length > 0 
        ? readings[0].timestamp 
        : null,
    };
  }
}
