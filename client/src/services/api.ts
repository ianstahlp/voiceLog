import axios from 'axios';
import type {
  ProcessVoiceRequest,
  ProcessVoiceResponse,
  DailySummary,
  LogEntry,
  UpdateLogEntryRequest,
} from '../../../shared/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Process a voice transcript (can return multiple entries if both food and exercise mentioned)
 */
export async function processVoice(transcript: string, date?: string, mergeExercises?: boolean): Promise<LogEntry[]> {
  const request: ProcessVoiceRequest = { transcript, date, mergeExercises };
  const response = await api.post<{ logEntries: LogEntry[] }>('/voice/process', request);
  return response.data.logEntries;
}

/**
 * Get all logs for a specific date
 */
export async function getLogsByDate(date: string): Promise<DailySummary> {
  const response = await api.get<DailySummary>('/logs', {
    params: { date },
  });
  return response.data;
}

/**
 * Get a single log entry by ID
 */
export async function getLogById(id: number): Promise<LogEntry> {
  const response = await api.get<LogEntry>(`/logs/${id}`);
  return response.data;
}

/**
 * Update a log entry
 */
export async function updateLogEntry(
  id: number,
  updates: UpdateLogEntryRequest
): Promise<LogEntry> {
  const response = await api.put<LogEntry>(`/logs/${id}`, updates);
  return response.data;
}

/**
 * Delete a log entry
 */
export async function deleteLogEntry(id: number): Promise<void> {
  await api.delete(`/logs/${id}`);
}

export default api;
