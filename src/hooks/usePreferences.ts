import { useState, useCallback } from 'react';

const STORAGE_KEY = 'focus-preferences';

export interface Preferences {
  defaultTaskStatus: string;
  autoAssignToSelf: boolean;
  autoArchiveCompleted: boolean;
  showCompletedTasks: boolean;
  defaultProjectView: string;
  autoCloseCompletedProjects: boolean;
}

const defaults: Preferences = {
  defaultTaskStatus: "todo",
  autoAssignToSelf: true,
  autoArchiveCompleted: false,
  showCompletedTasks: true,
  defaultProjectView: "list",
  autoCloseCompletedProjects: false,
};

function loadPreferences(): Preferences {
  if (typeof window === 'undefined') return defaults;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaults, ...parsed };
    }
  } catch {
    /* empty — invalid stored preferences */
  }
  return defaults;
}

function savePreferences(prefs: Preferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);

  const updatePreference = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: value };
      savePreferences(next);
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaults);
    savePreferences(defaults);
  }, []);

  return { preferences, updatePreference, resetPreferences };
}
