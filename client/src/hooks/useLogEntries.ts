import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import * as api from '../services/api';
import type { UpdateLogEntryRequest } from '../../../shared/types';

/**
 * Hook to fetch log entries for a specific date
 */
export function useLogEntries(date: Date) {
  const dateString = format(date, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['logs', dateString],
    queryFn: () => api.getLogsByDate(dateString),
  });
}

/**
 * Hook to process voice transcript and create log entries
 */
export function useProcessVoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transcript, date, mergeExercises }: { transcript: string; date?: string; mergeExercises?: boolean }) =>
      api.processVoice(transcript, date, mergeExercises),
    onSuccess: (data) => {
      // Invalidate and refetch logs for the date(s)
      // Get unique dates from all returned entries
      const dates = [...new Set(data.map((entry) => entry.date))];
      dates.forEach((date) => {
        queryClient.invalidateQueries({ queryKey: ['logs', date] });
      });
    },
  });
}

/**
 * Hook to update a log entry
 */
export function useUpdateLogEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: UpdateLogEntryRequest }) =>
      api.updateLogEntry(id, updates),
    onSuccess: (data) => {
      // Invalidate and refetch logs for the date
      queryClient.invalidateQueries({ queryKey: ['logs', data.date] });
      queryClient.invalidateQueries({ queryKey: ['log', data.id] });
    },
  });
}

/**
 * Hook to delete a log entry
 */
export function useDeleteLogEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteLogEntry(id),
    onSuccess: () => {
      // Invalidate all log queries
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}
