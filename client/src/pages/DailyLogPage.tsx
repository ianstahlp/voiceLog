import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import toast from 'react-hot-toast';
import { DailySummary } from '../components/DailySummary';
import { LogEntry } from '../components/LogEntry';
import { EditModal } from '../components/EditModal';
import { useLogEntries, useUpdateLogEntry, useDeleteLogEntry } from '../hooks/useLogEntries';
import type { LogEntry as LogEntryType, UpdateLogEntryRequest } from '../shared/types';

export function DailyLogPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<LogEntryType | null>(null);

  const { data: summary, isLoading } = useLogEntries(selectedDate);
  const updateEntry = useUpdateLogEntry();
  const deleteEntry = useDeleteLogEntry();

  const handlePreviousDay = () => {
    setSelectedDate((date) => subDays(date, 1));
  };

  const handleNextDay = () => {
    setSelectedDate((date) => addDays(date, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleEdit = (entry: LogEntryType) => {
    setSelectedEntry(entry);
  };

  const handleSave = async (id: number, updates: UpdateLogEntryRequest) => {
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

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="daily-log-page">
      <header className="page-header">
        <Link to="/" className="back-link">
          <Home size={24} />
        </Link>
        <h1>Daily Log</h1>
      </header>

      <div className="date-navigation">
        <button className="nav-button" onClick={handlePreviousDay}>
          <ChevronLeft size={24} />
        </button>
        <div className="date-display">
          <h2>{format(selectedDate, 'MMMM d, yyyy')}</h2>
          {!isToday && (
            <button className="today-button" onClick={handleToday}>
              Today
            </button>
          )}
        </div>
        <button
          className="nav-button"
          onClick={handleNextDay}
          disabled={isToday}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : summary ? (
        <>
          <DailySummary summary={summary} />

          <div className="entries-section">
            <h3>All Entries</h3>
            {summary.entries.length === 0 ? (
              <div className="empty-state">
                <p>No entries for this date.</p>
              </div>
            ) : (
              <div className="entries-list">
                {summary.entries.map((entry) => (
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
        </>
      ) : null}

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
