import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { addNote } from '../../store/slices/notesSlice';
import { useNavigation } from '@react-navigation/native';
import type { Note } from '../../types/sensor.types';

type NoteType = 'meal' | 'insulin' | 'exercise' | 'medication' | 'other';

const NOTE_TYPES: { type: NoteType; label: string; icon: string }[] = [
  { type: 'meal', label: '饮食', icon: '🍚' },
  { type: 'insulin', label: '胰岛素', icon: '💉' },
  { type: 'exercise', label: '运动', icon: '🏃' },
  { type: 'medication', label: '药物', icon: '💊' },
  { type: 'other', label: '其他', icon: '📝' },
];

export const AddNoteScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const glucose = useSelector((state: RootState) => state.glucose);

  const [selectedType, setSelectedType] = useState<NoteType>('meal');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('提示', '请输入备注内容');
      return;
    }

    setLoading(true);

    try {
      const note: Note = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: selectedType,
        content: content.trim(),
        glucoseReadingId: glucose.currentReading?.timestamp.toString(),
      };

      dispatch(addNote(note));
      navigation.goBack();
    } catch (error) {
      Alert.alert('错误', '保存备注失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (content.trim()) {
      Alert.alert(
        '放弃更改？',
        '您有未保存的更改，确定要放弃吗？',
        [
          { text: '继续编辑', style: 'cancel' },
          { text: '放弃', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButton}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>添加备注</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
              {loading ? '保存中...' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* 类型选择 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>类型</Text>
            <View style={styles.typeGrid}>
              {NOTE_TYPES.map(({ type, label, icon }) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedType === type && styles.typeButtonSelected,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={styles.typeIcon}>{icon}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      selectedType === type && styles.typeLabelSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 内容输入 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>内容</Text>
            <TextInput
              style={styles.textInput}
              value={content}
              onChangeText={setContent}
              placeholder="输入备注内容..."
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{content.length}/500</Text>
          </View>

          {/* 当前血糖读数（如果有） */}
          {glucose.currentReading && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>关联血糖读数</Text>
              <View style={styles.glucoseInfo}>
                <Text style={styles.glucoseValue}>
                  {glucose.currentReading.value} mg/dL
                </Text>
                <Text style={styles.glucoseTime}>
                  {new Date(glucose.currentReading.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  cancelButton: {
    fontSize: 16,
    color: '#757575',
  },
  saveButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#BDBDBD',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    color: '#424242',
  },
  typeLabelSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#FAFAFA',
  },
  charCount: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 4,
  },
  glucoseInfo: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  glucoseValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  glucoseTime: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
});
