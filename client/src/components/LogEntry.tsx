import { Edit2, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { LogEntry as LogEntryType, FoodItem, ExerciseActivity } from '../shared/types';

interface LogEntryProps {
  entry: LogEntryType;
  onEdit: (entry: LogEntryType) => void;
  onDelete: (id: number) => void;
}

export function LogEntry({ entry, onEdit, onDelete }: LogEntryProps) {
  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  const formatRelativeTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const renderFoodItems = (items: FoodItem[]) => {
    const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
    const mealType = entry.meal_type;

    return (
      <div className="log-entry-content">
        <div className="entry-header">
          {mealType && <div className="meal-type">🍽️ {mealType}</div>}
          <div className="entry-time">
            <span className="time-absolute">{formatTime(entry.timestamp)}</span>
            <span className="time-relative">{formatRelativeTime(entry.timestamp)}</span>
          </div>
        </div>
        <div className="food-items-grid">
          {items.map((item) => (
            <div key={item.id} className="food-item-card">
              <div className="food-card-name">
                {item.quantity && item.unit ? (
                  <>
                    <span className="food-quantity">{item.quantity} {item.unit}</span>
                    <span className="food-name-text">{item.name}</span>
                  </>
                ) : (
                  <span className="food-name-text">{item.name}</span>
                )}
              </div>
              <div className="food-card-calories">{item.calories} cal</div>
            </div>
          ))}
        </div>
        <div className="entry-total">Total: {totalCalories} calories</div>
      </div>
    );
  };

  const renderExerciseActivities = (items: ExerciseActivity[]) => {
    const totalCalories = items.reduce((sum, item) => sum + item.calories_burned, 0);

    return (
      <div className="log-entry-content">
        <div className="entry-type exercise">💪 Exercise</div>
        <div className="entry-time">
          <span className="time-absolute">{formatTime(entry.timestamp)}</span>
          <span className="time-relative">{formatRelativeTime(entry.timestamp)}</span>
        </div>
        <div className="entry-items">
          {items.map((item) => (
            <div key={item.id} className="exercise-item">
              <span className="item-name">{item.activity_type}</span>
              <span className="item-details">
                {item.duration_minutes && `${item.duration_minutes} min`}
                {item.intensity && ` • ${item.intensity}`}
                {item.distance && ` • ${item.distance} mi`}
              </span>
              <span className="item-calories">{item.calories_burned} cal burned</span>
            </div>
          ))}
        </div>
        <div className="entry-total">Total: {totalCalories} calories burned</div>
      </div>
    );
  };

  return (
    <div className="log-entry-card">
      {entry.type === 'food'
        ? renderFoodItems(entry.items as FoodItem[])
        : renderExerciseActivities(entry.items as ExerciseActivity[])}

      <div className="entry-actions">
        <button
          className="action-button edit"
          onClick={() => onEdit(entry)}
          aria-label="Edit entry"
        >
          <Edit2 size={18} />
        </button>
        <button
          className="action-button delete"
          onClick={() => onDelete(entry.id)}
          aria-label="Delete entry"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
