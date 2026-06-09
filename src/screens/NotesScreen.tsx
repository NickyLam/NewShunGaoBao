import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { RootState } from '../store/store';

export const NotesScreen = () => {
  const notes = useSelector((state: RootState) => state.notes.notes);
  const navigation = useNavigation();

  const noteIcons: Record<string, string> = {
    meal: '🍚',
    insulin: '💉',
    exercise: '🏃',
    medication: '💊',
    other: '📝',
  };

  const handleAddNote = () => {
    navigation.navigate('AddNote' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>备注</Text>
      </View>
      <ScrollView style={styles.content}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无备注</Text>
            <Text style={styles.emptySubtext}>添加备注来记录饮食、胰岛素等信息</Text>
          </View>
        ) : (
          notes.map(note => (
            <View key={note.id} style={styles.noteCard}>
              <Text style={styles.noteIcon}>{noteIcons[note.type]}</Text>
              <View style={styles.noteContent}>
                <Text style={styles.noteText}>{note.content}</Text>
                <Text style={styles.noteTime}>
                  {new Date(note.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleAddNote}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#757575',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  noteIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteText: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 4,
  },
  noteTime: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: 'white',
    fontWeight: '300',
  },
});
