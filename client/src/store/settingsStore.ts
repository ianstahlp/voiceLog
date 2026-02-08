import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  mergeExercises: boolean;
  setMergeExercises: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      mergeExercises: false,
      setMergeExercises: (value: boolean) => set({ mergeExercises: value }),
    }),
    {
      name: 'voice-log-settings',
    }
  )
);
