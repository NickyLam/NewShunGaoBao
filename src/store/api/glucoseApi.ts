import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { GlucoseReading, Note } from '../../types/sensor.types';
import { SyncService } from '../../services/SyncService';

const syncService = new SyncService();

export const glucoseApi = createApi({
  reducerPath: 'glucoseApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['GlucoseReadings', 'Notes'],
  endpoints: (builder) => ({
    syncReading: builder.mutation<void, GlucoseReading>({
      async queryFn(reading) {
        try {
          await syncService.syncReading(reading);
          return { data: undefined };
        } catch (error) {
          return { error: { message: 'Failed to sync reading' } };
        }
      },
      invalidatesTags: ['GlucoseReadings'],
    }),
    syncReadingsBatch: builder.mutation<void, GlucoseReading[]>({
      async queryFn(readings) {
        try {
          await syncService.syncReadingsBatch(readings);
          return { data: undefined };
        } catch (error) {
          return { error: { message: 'Failed to sync readings' } };
        }
      },
      invalidatesTags: ['GlucoseReadings'],
    }),
    fetchHistory: builder.query<GlucoseReading[], { userId: string; days: number }>({
      async queryFn({ userId, days }) {
        try {
          syncService.setUserId(userId);
          const readings = await syncService.fetchReadings(days);
          return { data: readings };
        } catch (error) {
          return { error: { message: 'Failed to fetch history' } };
        }
      },
      providesTags: ['GlucoseReadings'],
    }),
    addNote: builder.mutation<void, Note>({
      async queryFn(note) {
        try {
          await syncService.addNote(note);
          return { data: undefined };
        } catch (error) {
          return { error: { message: 'Failed to add note' } };
        }
      },
      invalidatesTags: ['Notes'],
    }),
    fetchNotes: builder.query<Note[], void>({
      async queryFn() {
        try {
          const notes = await syncService.fetchNotes();
          return { data: notes };
        } catch (error) {
          return { error: { message: 'Failed to fetch notes' } };
        }
      },
      providesTags: ['Notes'],
    }),
  }),
});

export const {
  useSyncReadingMutation,
  useSyncReadingsBatchMutation,
  useFetchHistoryQuery,
  useAddNoteMutation,
  useFetchNotesQuery,
} = glucoseApi;