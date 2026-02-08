import { describe, it, expect } from 'vitest';
import { estimateExerciseCalories, calculateCalorieDifference } from '../../../shared/calorieEstimation.js';

describe('estimateExerciseCalories', () => {
  describe('duration-based calculations', () => {
    it('should calculate calories for walking with moderate intensity', () => {
      const result = estimateExerciseCalories({
        activity_type: 'walking',
        duration_minutes: 30,
        intensity: 'moderate',
      });
      expect(result).toBe(120); // 30 min * 4 cal/min
    });

    it('should calculate calories for running with intense intensity', () => {
      const result = estimateExerciseCalories({
        activity_type: 'running',
        duration_minutes: 20,
        intensity: 'intense',
      });
      expect(result).toBe(240); // 20 min * 12 cal/min
    });

    it('should use moderate intensity as default', () => {
      const result = estimateExerciseCalories({
        activity_type: 'yoga',
        duration_minutes: 45,
      });
      expect(result).toBe(180); // 45 min * 4 cal/min (moderate)
    });

    it('should calculate calories for boxing with light intensity', () => {
      const result = estimateExerciseCalories({
        activity_type: 'boxing',
        duration_minutes: 30,
        intensity: 'light',
      });
      expect(result).toBe(180); // 30 min * 6 cal/min
    });

    it('should calculate calories for ballet practice', () => {
      const result = estimateExerciseCalories({
        activity_type: 'ballet practice',
        duration_minutes: 60,
        intensity: 'moderate',
      });
      expect(result).toBe(360); // 60 min * 6 cal/min
    });
  });

  describe('distance-based calculations', () => {
    it('should calculate calories for walking with distance', () => {
      const result = estimateExerciseCalories({
        activity_type: 'walking',
        distance: 3.5,
      });
      expect(result).toBe(315); // 3.5 mi * 90 cal/mi
    });

    it('should calculate calories for running with distance', () => {
      const result = estimateExerciseCalories({
        activity_type: 'running',
        distance: 5,
      });
      expect(result).toBe(550); // 5 mi * 110 cal/mi
    });

    it('should prioritize distance over duration for running', () => {
      const result = estimateExerciseCalories({
        activity_type: 'running',
        distance: 3,
        duration_minutes: 60, // Should be ignored
      });
      expect(result).toBe(330); // 3 mi * 110 cal/mi
    });
  });

  describe('edge cases', () => {
    it('should handle unknown activity types with default rate', () => {
      const result = estimateExerciseCalories({
        activity_type: 'underwater basket weaving',
        duration_minutes: 20,
      });
      expect(result).toBe(100); // 20 min * 5 cal/min (default)
    });

    it('should handle missing duration with 30-minute default', () => {
      const result = estimateExerciseCalories({
        activity_type: 'cycling',
      });
      expect(result).toBe(240); // 30 min * 8 cal/min (moderate default)
    });

    it('should handle case-insensitive activity matching', () => {
      const upper = estimateExerciseCalories({
        activity_type: 'SWIMMING',
        duration_minutes: 30,
        intensity: 'intense',
      });
      const lower = estimateExerciseCalories({
        activity_type: 'swimming',
        duration_minutes: 30,
        intensity: 'intense',
      });
      expect(upper).toBe(lower);
      expect(upper).toBe(360); // 30 min * 12 cal/min
    });

    it('should handle floating point distance values', () => {
      const result = estimateExerciseCalories({
        activity_type: 'running',
        distance: 2.75,
      });
      expect(result).toBe(303); // 2.75 mi * 110 cal/mi (rounded)
    });
  });

  describe('all supported activities', () => {
    const activities = [
      { name: 'walking', light: 3, moderate: 4, intense: 5 },
      { name: 'running', light: 8, moderate: 10, intense: 12 },
      { name: 'boxing', light: 6, moderate: 9, intense: 12 },
      { name: 'ballet', light: 4, moderate: 6, intense: 8 },
    ];

    activities.forEach(({ name, light, moderate, intense }) => {
      it(`should calculate correct calories for ${name}`, () => {
        const duration = 30;

        expect(estimateExerciseCalories({
          activity_type: name,
          duration_minutes: duration,
          intensity: 'light',
        })).toBe(duration * light);

        expect(estimateExerciseCalories({
          activity_type: name,
          duration_minutes: duration,
          intensity: 'moderate',
        })).toBe(duration * moderate);

        expect(estimateExerciseCalories({
          activity_type: name,
          duration_minutes: duration,
          intensity: 'intense',
        })).toBe(duration * intense);
      });
    });
  });
});

describe('calculateCalorieDifference', () => {
  it('should calculate positive difference when new estimate is higher', () => {
    const original = {
      activity_type: 'walking',
      duration_minutes: 20,
      calories_burned: 80,
    };
    const updated = {
      activity_type: 'walking',
      duration_minutes: 30,
      intensity: 'moderate' as const,
    };

    const diff = calculateCalorieDifference(original, updated);
    expect(diff).toBe(40); // 120 - 80
  });

  it('should calculate negative difference when new estimate is lower', () => {
    const original = {
      activity_type: 'running',
      duration_minutes: 30,
      calories_burned: 300,
    };
    const updated = {
      activity_type: 'running',
      duration_minutes: 20,
      intensity: 'moderate' as const,
    };

    const diff = calculateCalorieDifference(original, updated);
    expect(diff).toBe(-100); // 200 - 300
  });

  it('should return zero when estimates are the same', () => {
    const original = {
      activity_type: 'yoga',
      duration_minutes: 45,
      calories_burned: 180,
    };
    const updated = {
      activity_type: 'yoga',
      duration_minutes: 45,
      intensity: 'moderate' as const,
    };

    const diff = calculateCalorieDifference(original, updated);
    expect(diff).toBe(0);
  });
});
