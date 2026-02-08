// Shared calorie estimation utilities for exercise activities

export interface ExerciseEstimateInput {
  activity_type: string;
  duration_minutes?: number;
  distance?: number;
  intensity?: 'light' | 'moderate' | 'intense';
}

/**
 * Estimate calories burned for an exercise activity
 * Based on average 70kg (154lb) adult
 */
export function estimateExerciseCalories(input: ExerciseEstimateInput): number {
  const { activity_type, duration_minutes, distance, intensity } = input;

  // Normalize activity type for matching
  const activityLower = activity_type.toLowerCase();

  // Base calorie rates per minute for 70kg adult
  const calorieRates: Record<string, { light: number; moderate: number; intense: number }> = {
    walking: { light: 3, moderate: 4, intense: 5 },
    running: { light: 8, moderate: 10, intense: 12 },
    jogging: { light: 7, moderate: 9, intense: 11 },
    cycling: { light: 6, moderate: 8, intense: 10 },
    swimming: { light: 8, moderate: 10, intense: 12 },
    yoga: { light: 3, moderate: 4, intense: 5 },
    hiking: { light: 4, moderate: 6, intense: 8 },
    dancing: { light: 4, moderate: 6, intense: 8 },
    basketball: { light: 6, moderate: 8, intense: 10 },
    soccer: { light: 6, moderate: 8, intense: 10 },
    tennis: { light: 5, moderate: 7, intense: 9 },
    weightlifting: { light: 3, moderate: 5, intense: 6 },
    'weight lifting': { light: 3, moderate: 5, intense: 6 },
    elliptical: { light: 6, moderate: 8, intense: 10 },
    rowing: { light: 6, moderate: 8, intense: 10 },
    climbing: { light: 7, moderate: 9, intense: 11 },
    boxing: { light: 6, moderate: 9, intense: 12 },
    ballet: { light: 4, moderate: 6, intense: 8 },
    'ballet practice': { light: 4, moderate: 6, intense: 8 },
  };

  // Find matching activity
  let caloriesPerMinute = 5; // Default moderate activity rate

  for (const [key, rates] of Object.entries(calorieRates)) {
    if (activityLower.includes(key) || key.includes(activityLower)) {
      const level = intensity || 'moderate';
      caloriesPerMinute = rates[level];
      break;
    }
  }

  // If distance is provided for running/walking, use distance-based calculation
  if (distance && (activityLower.includes('run') || activityLower.includes('walk'))) {
    // Walking: ~80-100 cal/mile, Running: ~100-120 cal/mile
    const caloriesPerMile = activityLower.includes('run') ? 110 : 90;
    return Math.round(distance * caloriesPerMile);
  }

  // Use duration-based calculation
  if (duration_minutes) {
    return Math.round(duration_minutes * caloriesPerMinute);
  }

  // Fallback: assume 30 minutes of moderate activity
  return Math.round(30 * caloriesPerMinute);
}

/**
 * Calculate calorie difference when exercise is updated
 */
export function calculateCalorieDifference(
  original: ExerciseEstimateInput & { calories_burned: number },
  updated: ExerciseEstimateInput
): number {
  const newCalories = estimateExerciseCalories(updated);
  return newCalories - original.calories_burned;
}
