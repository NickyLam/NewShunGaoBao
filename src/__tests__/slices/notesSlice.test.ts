import { describe, it, expect } from '@jest/globals';
import reducer, {
  addNote,
  updateNote,
  deleteNote,
  setNotes,
  setLoading,
  setError,
} from '../../store/slices/notesSlice';
import type { Note } from '../../types/sensor.types';

describe('notesSlice', () => {
  const initialState = {
    notes: [],
    loading: false,
    error: null,
  };

  const testNote1: Note = {
    id: 'note-1',
    timestamp: Date.now() - 86400000,
    type: 'meal',
    content: 'Lunch',
    glucoseReadingId: 'reading-1',
  };

  const testNote2: Note = {
    id: 'note-2',
    timestamp: Date.now(),
    type: 'insulin',
    content: 'Bolus',
  };

  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle addNote', () => {
    const nextState = reducer(initialState, addNote(testNote1));
    expect(nextState.notes).toEqual([testNote1]);
  });

  it('should handle setNotes', () => {
    const notes = [testNote1, testNote2];
    const nextState = reducer(initialState, setNotes(notes));
    expect(nextState.notes).toEqual(notes);
  });

  it('should handle updateNote', () => {
    let state = reducer(initialState, addNote(testNote1));
    const updatedNote = { ...testNote1, content: 'Updated Lunch' };
    state = reducer(state, updateNote(updatedNote));
    expect(state.notes[0].content).toBe('Updated Lunch');
  });

  it('should handle deleteNote', () => {
    let state = initialState;
    state = reducer(state, addNote(testNote1));
    state = reducer(state, addNote(testNote2));

    state = reducer(state, deleteNote('note-1'));
    expect(state.notes).toEqual([testNote2]);
  });

  it('should handle setLoading', () => {
    const nextState = reducer(initialState, setLoading(true));
    expect(nextState.loading).toBe(true);
  });

  it('should handle setError', () => {
    const nextState = reducer(initialState, setError('Test error'));
    expect(nextState.error).toBe('Test error');
  });

  it('should handle setError to null', () => {
    const stateWithError = { ...initialState, error: 'Error' };
    const nextState = reducer(stateWithError, setError(null));
    expect(nextState.error).toBeNull();
  });
});
