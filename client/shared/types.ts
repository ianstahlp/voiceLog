// Shared types between frontend and backend

export type LogEntryType = 'food' | 'exercise';

export interface FoodItem {
  id: number;
  log_entry_id: number;
  name: string;
  quantity: number | null;
  unit: string | null;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  notes: string | null;
}

export interface ExerciseActivity {
  id: number;
  log_entry_id: number;
  activity_type: string;
  duration_minutes: number | null;
  intensity: 'light' | 'moderate' | 'intense' | null;
  calories_burned: number;
  distance: number | null;
  notes: string | null;
}

export interface LogEntry {
  id: number;
  date: string; // ISO date string (YYYY-MM-DD)
  timestamp: string; // ISO datetime string
  type: LogEntryType;
  meal_type: string | null; // breakfast, lunch, dinner, snack
  raw_transcript: string | null;
  created_at: string;
  updated_at: string;
  items: FoodItem[] | ExerciseActivity[];
}

export interface DailySummary {
  date: string;
  entries: LogEntry[];
  totals: {
    caloriesConsumed: number;
    caloriesBurned: number;
    netCalories: number;
  };
}

// API Request/Response types
export interface ProcessVoiceRequest {
  transcript: string;
  date?: string; // Optional date override
  mergeExercises?: boolean; // Whether to merge duplicate exercises
}

export interface ProcessVoiceResponse {
  logEntry: LogEntry;
}

export interface UpdateLogEntryRequest {
  items: Partial<FoodItem>[] | Partial<ExerciseActivity>[];
}

// OpenAI Function Calling types
export interface LogFoodIntakeArgs {
  meal_type?: string; // breakfast, lunch, dinner, snack
  items: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    notes?: string;
  }>;
}

export interface LogExerciseArgs {
  activities: Array<{
    activity_type: string;
    duration_minutes?: number;
    intensity?: 'light' | 'moderate' | 'intense';
    calories_burned: number;
    distance?: number;
    notes?: string;
  }>;
}
