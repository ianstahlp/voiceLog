import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { VoiceInput } from '../components/VoiceInput';
import { LogEntry } from '../components/LogEntry';
import { EditModal } from '../components/EditModal';
import { useProcessVoice, useLogEntries, useUpdateLogEntry, useDeleteLogEntry } from '../hooks/useLogEntries';
import { useSettingsStore } from '../store/settingsStore';
import type { LogEntry as LogEntryType } from '../../../shared/types';

export function HomePage() {
  const [selectedEntry, setSelectedEntry] = useState<LogEntryType | null>(null);
  const today = new Date();

  const { data: summary, isLoading } = useLogEntries(today);
  const processVoice = useProcessVoice();
  const updateEntry = useUpdateLogEntry();
  const deleteEntry = useDeleteLogEntry();
  const { mergeExercises, setMergeExercises } = useSettingsStore();

  const handleTranscriptReady = async (transcript: string) => {
    try {
      const entries = await processVoice.mutateAsync({
        transcript,
        mergeExercises
      });
      const count = entries.length;
      if (count === 1) {
        toast.success('Entry logged successfully!');
      } else {
        toast.success(`${count} entries logged successfully!`);
      }
    } catch (error) {
      toast.error('Failed to process voice input. Please try again.');
      console.error(error);
    }
  };

  const handleEdit = (entry: LogEntryType) => {
    setSelectedEntry(entry);
  };

  const handleSave = async (id: number, updates: any) => {
    try {
      await updateEntry.mutateAsync({ id, updates });
      toast.success('Entry updated successfully!');
    } catch (error) {
      toast.error('Failed to update entry.');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await deleteEntry.mutateAsync(id);
      toast.success('Entry deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete entry.');
      console.error(error);
    }
  };

  const recentEntries = summary?.entries.slice(0, 5) || [];

  return (
    <div className="home-page">
      <header className="page-header">
        <h1>AI Voice Log</h1>
        <p>Track your food and exercise with your voice</p>
      </header>

      <div className="voice-section">
        <div className="voice-header">
          <div>
            <h2>Speak to Log</h2>
            <p className="hint">
              Tell me what you ate or what exercise you did. For example:<br />
              "I had two scrambled eggs and a banana" or "I ran for 30 minutes"
            </p>
          </div>
          <div className="settings-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={mergeExercises}
                onChange={(e) => setMergeExercises(e.target.checked)}
                className="toggle-checkbox"
              />
              <span className="toggle-text">Merge same exercises</span>
            </label>
          </div>
        </div>
        <VoiceInput
          onTranscriptReady={handleTranscriptReady}
          isProcessing={processVoice.isPending}
        />
      </div>

      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Entries</h2>
          <Link to="/daily" className="view-all-link">
            <Calendar size={20} />
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : recentEntries.length === 0 ? (
          <div className="empty-state">
            <p>No entries yet. Start by speaking into the microphone!</p>
          </div>
        ) : (
          <div className="entries-list">
            {recentEntries.map((entry) => (
              <LogEntry
                key={entry.id}
                entry={entry}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {selectedEntry && (
        <EditModal
          entry={selectedEntry}
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
