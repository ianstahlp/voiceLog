import db from '../config/database.js';
import type {
  LogEntry,
  FoodItem,
  ExerciseActivity,
  DailySummary,
  LogFoodIntakeArgs,
  LogExerciseArgs,
} from '../shared/types.js';

/**
 * Create a new food log entry
 */
export function createFoodLog(
  transcript: string,
  foodData: LogFoodIntakeArgs,
  date?: string
): LogEntry {
  const logDate = date || new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  // Start a transaction
  const createLog = db.transaction(() => {
    // Insert log entry
    const logResult = db
      .prepare(
        `INSERT INTO log_entries (date, timestamp, type, meal_type, raw_transcript)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(logDate, timestamp, 'food', foodData.meal_type || null, transcript);

    const logEntryId = logResult.lastInsertRowid as number;

    // Insert food items
    const insertFoodItem = db.prepare(
      `INSERT INTO food_items (log_entry_id, name, quantity, unit, calories, protein, carbs, fat, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const items: FoodItem[] = foodData.items.map((item) => {
      const result = insertFoodItem.run(
        logEntryId,
        item.name,
        item.quantity || null,
        item.unit || null,
        item.calories,
        item.protein || null,
        item.carbs || null,
        item.fat || null,
        item.notes || null
      );

      return {
        id: result.lastInsertRowid as number,
        log_entry_id: logEntryId,
        name: item.name,
        quantity: item.quantity || null,
        unit: item.unit || null,
        calories: item.calories,
        protein: item.protein || null,
        carbs: item.carbs || null,
        fat: item.fat || null,
        notes: item.notes || null,
      };
    });

    // Get the log entry
    const entry = db
      .prepare('SELECT * FROM log_entries WHERE id = ?')
      .get(logEntryId) as any;

    return {
      ...entry,
      items,
    } as LogEntry;
  });

  return createLog();
}

/**
 * Create a new exercise log entry or merge with existing if merge is enabled
 */
export function createOrMergeExerciseLog(
  transcript: string,
  exerciseData: LogExerciseArgs,
  date?: string,
  mergeExercises?: boolean
): LogEntry {
  const logDate = date || new Date().toISOString().split('T')[0];

  // If merge is enabled, check for existing exercises of the same type
  if (mergeExercises && exerciseData.activities.length > 0) {
    const activity = exerciseData.activities[0];
    const activityType = activity.activity_type.toLowerCase();

    // Find existing exercise entry of the same type for this date
    const existingEntries = db
      .prepare('SELECT * FROM log_entries WHERE date = ? AND type = ? ORDER BY timestamp DESC')
      .all(logDate, 'exercise') as any[];

    for (const entry of existingEntries) {
      const activities = db
        .prepare('SELECT * FROM exercise_activities WHERE log_entry_id = ?')
        .all(entry.id) as ExerciseActivity[];

      // Check if any activity matches the type
      const matchingActivity = activities.find(
        (a) => a.activity_type.toLowerCase() === activityType
      );

      if (matchingActivity) {
        // Merge: update the existing activity
        const mergeLog = db.transaction(() => {
          const newDuration = (matchingActivity.duration_minutes || 0) + (activity.duration_minutes || 0);
          const newDistance = (matchingActivity.distance || 0) + (activity.distance || 0);
          const newCalories = matchingActivity.calories_burned + activity.calories_burned;

          db.prepare(
            `UPDATE exercise_activities
             SET duration_minutes = ?, distance = ?, calories_burned = ?
             WHERE id = ?`
          ).run(newDuration || null, newDistance || null, newCalories, matchingActivity.id);

          // Update the log entry transcript to include new info
          const updatedTranscript = `${entry.raw_transcript} + ${transcript}`;
          db.prepare('UPDATE log_entries SET raw_transcript = ?, updated_at = ? WHERE id = ?').run(
            updatedTranscript,
            new Date().toISOString(),
            entry.id
          );
        });

        mergeLog();
        return getLogById(entry.id)!;
      }
    }
  }

  // No merge needed or merge disabled - create new entry
  return createExerciseLog(transcript, exerciseData, date);
}

/**
 * Create a new exercise log entry
 */
export function createExerciseLog(
  transcript: string,
  exerciseData: LogExerciseArgs,
  date?: string
): LogEntry {
  const logDate = date || new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  // Start a transaction
  const createLog = db.transaction(() => {
    // Insert log entry
    const logResult = db
      .prepare(
        `INSERT INTO log_entries (date, timestamp, type, raw_transcript)
         VALUES (?, ?, ?, ?)`
      )
      .run(logDate, timestamp, 'exercise', transcript);

    const logEntryId = logResult.lastInsertRowid as number;

    // Insert exercise activities
    const insertActivity = db.prepare(
      `INSERT INTO exercise_activities (log_entry_id, activity_type, duration_minutes, intensity, calories_burned, distance, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const items: ExerciseActivity[] = exerciseData.activities.map((activity) => {
      const result = insertActivity.run(
        logEntryId,
        activity.activity_type,
        activity.duration_minutes || null,
        activity.intensity || null,
        activity.calories_burned,
        activity.distance || null,
        activity.notes || null
      );

      return {
        id: result.lastInsertRowid as number,
        log_entry_id: logEntryId,
        activity_type: activity.activity_type,
        duration_minutes: activity.duration_minutes || null,
        intensity: activity.intensity || null,
        calories_burned: activity.calories_burned,
        distance: activity.distance || null,
        notes: activity.notes || null,
      };
    });

    // Get the log entry
    const entry = db
      .prepare('SELECT * FROM log_entries WHERE id = ?')
      .get(logEntryId) as any;

    return {
      ...entry,
      items,
    } as LogEntry;
  });

  return createLog();
}

/**
 * Get all log entries for a specific date with daily summary
 */
export function getLogsByDate(date: string): DailySummary {
  // Get all log entries for the date
  const entries = db
    .prepare('SELECT * FROM log_entries WHERE date = ? ORDER BY timestamp DESC')
    .all(date) as any[];

  // Fetch items for each entry
  const entriesWithItems: LogEntry[] = entries.map((entry) => {
    if (entry.type === 'food') {
      const items = db
        .prepare('SELECT * FROM food_items WHERE log_entry_id = ?')
        .all(entry.id) as FoodItem[];
      return { ...entry, items };
    } else {
      const items = db
        .prepare('SELECT * FROM exercise_activities WHERE log_entry_id = ?')
        .all(entry.id) as ExerciseActivity[];
      return { ...entry, items };
    }
  });

  // Calculate totals
  let caloriesConsumed = 0;
  let caloriesBurned = 0;

  entriesWithItems.forEach((entry) => {
    if (entry.type === 'food') {
      (entry.items as FoodItem[]).forEach((item) => {
        caloriesConsumed += item.calories;
      });
    } else {
      (entry.items as ExerciseActivity[]).forEach((item) => {
        caloriesBurned += item.calories_burned;
      });
    }
  });

  return {
    date,
    entries: entriesWithItems,
    totals: {
      caloriesConsumed,
      caloriesBurned,
      netCalories: caloriesConsumed - caloriesBurned,
    },
  };
}

/**
 * Get a single log entry by ID
 */
export function getLogById(id: number): LogEntry | null {
  const entry = db.prepare('SELECT * FROM log_entries WHERE id = ?').get(id) as any;

  if (!entry) {
    return null;
  }

  if (entry.type === 'food') {
    const items = db
      .prepare('SELECT * FROM food_items WHERE log_entry_id = ?')
      .all(id) as FoodItem[];
    return { ...entry, items };
  } else {
    const items = db
      .prepare('SELECT * FROM exercise_activities WHERE log_entry_id = ?')
      .all(id) as ExerciseActivity[];
    return { ...entry, items };
  }
}

/**
 * Update a log entry (food items or exercise activities)
 */
export function updateLogEntry(
  id: number,
  updates: Partial<FoodItem>[] | Partial<ExerciseActivity>[]
): LogEntry | null {
  const entry = db.prepare('SELECT * FROM log_entries WHERE id = ?').get(id) as any;

  if (!entry) {
    return null;
  }

  const updateLog = db.transaction(() => {
    // Update timestamp
    db.prepare('UPDATE log_entries SET updated_at = ? WHERE id = ?').run(
      new Date().toISOString(),
      id
    );

    if (entry.type === 'food') {
      updates.forEach((update) => {
        const foodUpdate = update as Partial<FoodItem>;
        if (foodUpdate.id) {
          const fields = [];
          const values = [];

          if (foodUpdate.name !== undefined) {
            fields.push('name = ?');
            values.push(foodUpdate.name);
          }
          if (foodUpdate.quantity !== undefined) {
            fields.push('quantity = ?');
            values.push(foodUpdate.quantity);
          }
          if (foodUpdate.unit !== undefined) {
            fields.push('unit = ?');
            values.push(foodUpdate.unit);
          }
          if (foodUpdate.calories !== undefined) {
            fields.push('calories = ?');
            values.push(foodUpdate.calories);
          }
          if (foodUpdate.protein !== undefined) {
            fields.push('protein = ?');
            values.push(foodUpdate.protein);
          }
          if (foodUpdate.carbs !== undefined) {
            fields.push('carbs = ?');
            values.push(foodUpdate.carbs);
          }
          if (foodUpdate.fat !== undefined) {
            fields.push('fat = ?');
            values.push(foodUpdate.fat);
          }

          if (fields.length > 0) {
            db.prepare(`UPDATE food_items SET ${fields.join(', ')} WHERE id = ?`).run(
              ...values,
              foodUpdate.id
            );
          }
        }
      });
    } else {
      updates.forEach((update) => {
        const activity = update as Partial<ExerciseActivity>;
        if (activity.id) {
          const fields = [];
          const values = [];

          if (activity.activity_type !== undefined) {
            fields.push('activity_type = ?');
            values.push(activity.activity_type);
          }
          if (activity.duration_minutes !== undefined) {
            fields.push('duration_minutes = ?');
            values.push(activity.duration_minutes);
          }
          if (activity.intensity !== undefined) {
            fields.push('intensity = ?');
            values.push(activity.intensity);
          }
          if (activity.calories_burned !== undefined) {
            fields.push('calories_burned = ?');
            values.push(activity.calories_burned);
          }
          if (activity.distance !== undefined) {
            fields.push('distance = ?');
            values.push(activity.distance);
          }

          if (fields.length > 0) {
            db.prepare(`UPDATE exercise_activities SET ${fields.join(', ')} WHERE id = ?`).run(
              ...values,
              activity.id
            );
          }
        }
      });
    }
  });

  updateLog();

  return getLogById(id);
}

/**
 * Delete a log entry
 */
export function deleteLogEntry(id: number): boolean {
  const result = db.prepare('DELETE FROM log_entries WHERE id = ?').run(id);
  return result.changes > 0;
}
