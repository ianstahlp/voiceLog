import { useState } from 'react';
import { X } from 'lucide-react';
import { estimateExerciseCalories } from '../shared/calorieEstimation';
import type { LogEntry, FoodItem, ExerciseActivity } from '../shared/types';

interface EditModalProps {
  entry: LogEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updates: any) => void;
}

export function EditModal({ entry, isOpen, onClose, onSave }: EditModalProps) {
  const [items, setItems] = useState(entry.items);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(entry.id, { items });
    onClose();
  };

  const updateFoodItem = (index: number, field: keyof FoodItem, value: any) => {
    const newItems = [...items] as FoodItem[];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const updateExerciseItem = (index: number, field: keyof ExerciseActivity, value: any) => {
    const newItems = [...items] as ExerciseActivity[];
    const updatedItem = { ...newItems[index], [field]: value };

    // Auto-recalculate calories if duration, distance, or intensity changes
    if (field === 'duration_minutes' || field === 'distance' || field === 'intensity') {
      const estimatedCalories = estimateExerciseCalories({
        activity_type: updatedItem.activity_type,
        duration_minutes: updatedItem.duration_minutes || undefined,
        distance: updatedItem.distance || undefined,
        intensity: updatedItem.intensity || undefined,
      });
      updatedItem.calories_burned = estimatedCalories;
    }

    newItems[index] = updatedItem;
    setItems(newItems);
  };

  const renderFoodEditor = () => {
    const foodItems = items as FoodItem[];
    return foodItems.map((item, index) => (
      <div key={item.id} className="edit-item">
        <h4>{item.name}</h4>
        <div className="edit-field">
          <label>Calories:</label>
          <input
            type="number"
            value={item.calories}
            onChange={(e) => updateFoodItem(index, 'calories', parseInt(e.target.value))}
            min="0"
          />
        </div>
        <div className="edit-field">
          <label>Quantity:</label>
          <input
            type="number"
            value={item.quantity || ''}
            onChange={(e) => updateFoodItem(index, 'quantity', parseFloat(e.target.value) || null)}
            step="0.1"
            min="0"
          />
        </div>
        <div className="edit-field">
          <label>Unit:</label>
          <input
            type="text"
            value={item.unit || ''}
            onChange={(e) => updateFoodItem(index, 'unit', e.target.value || null)}
          />
        </div>
        <div className="edit-field">
          <label>Protein (g):</label>
          <input
            type="number"
            value={item.protein || ''}
            onChange={(e) => updateFoodItem(index, 'protein', parseFloat(e.target.value) || null)}
            step="0.1"
            min="0"
          />
        </div>
        <div className="edit-field">
          <label>Carbs (g):</label>
          <input
            type="number"
            value={item.carbs || ''}
            onChange={(e) => updateFoodItem(index, 'carbs', parseFloat(e.target.value) || null)}
            step="0.1"
            min="0"
          />
        </div>
        <div className="edit-field">
          <label>Fat (g):</label>
          <input
            type="number"
            value={item.fat || ''}
            onChange={(e) => updateFoodItem(index, 'fat', parseFloat(e.target.value) || null)}
            step="0.1"
            min="0"
          />
        </div>
      </div>
    ));
  };

  const renderExerciseEditor = () => {
    const exerciseItems = items as ExerciseActivity[];
    return exerciseItems.map((item, index) => (
      <div key={item.id} className="edit-item">
        <h4>{item.activity_type}</h4>
        <div className="edit-field">
          <label>Calories Burned:</label>
          <input
            type="number"
            value={item.calories_burned}
            onChange={(e) => updateExerciseItem(index, 'calories_burned', parseInt(e.target.value))}
            min="0"
          />
        </div>
        <div className="edit-field">
          <label>Duration (minutes):</label>
          <input
            type="number"
            value={item.duration_minutes || ''}
            onChange={(e) => updateExerciseItem(index, 'duration_minutes', parseInt(e.target.value) || null)}
            min="0"
          />
        </div>
        <div className="edit-field">
          <label>Intensity:</label>
          <select
            value={item.intensity || ''}
            onChange={(e) => updateExerciseItem(index, 'intensity', e.target.value || null)}
          >
            <option value="">Select...</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="intense">Intense</option>
          </select>
        </div>
        <div className="edit-field">
          <label>Distance (mi):</label>
          <input
            type="number"
            value={item.distance || ''}
            onChange={(e) => updateExerciseItem(index, 'distance', parseFloat(e.target.value) || null)}
            step="0.01"
            min="0"
          />
        </div>
      </div>
    ));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Entry</h3>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          {entry.type === 'food' ? renderFoodEditor() : renderExerciseEditor()}
        </div>
        <div className="modal-footer">
          <button className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
