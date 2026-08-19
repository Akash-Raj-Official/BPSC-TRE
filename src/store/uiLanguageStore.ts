import { create } from 'zustand';
import { examConfig } from '@/config/examConfig';
import type { Language } from '@/types/exam';
import { readJSON, STORAGE_KEYS, writeJSON } from '@/utils/storage';

/**
 * Interface language — the language of the *website*: navigation, buttons,
 * headings, instructions, result labels.
 *
 * This is deliberately a separate store from the exam session. A candidate may
 * well want an English interface while attempting the Hindi question paper (or
 * the other way round), so the two settings must never move together. The
 * medium of the question paper lives in `examStore.language` and is exposed by
 * `useQuestionLanguage()`.
 */

function isLanguage(value: unknown): value is Language {
  return value === 'hindi' || value === 'english';
}

function applyDocumentLanguage(language: Language): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = language === 'hindi' ? 'hi' : 'en';
}

interface UiLanguageStore {
  uiLanguage: Language;
  setUiLanguage: (language: Language) => void;
}

const initialUiLanguage = readJSON<Language>(STORAGE_KEYS.uiLanguage, isLanguage) ?? examConfig.defaultUiLanguage;

export const useUiLanguageStore = create<UiLanguageStore>((set) => ({
  uiLanguage: initialUiLanguage,

  setUiLanguage: (uiLanguage) => {
    writeJSON(STORAGE_KEYS.uiLanguage, uiLanguage);
    applyDocumentLanguage(uiLanguage);
    set({ uiLanguage });
  },
}));

/** Reads the interface language. Use this for every label the app itself owns. */
export const useUiLanguage = (): Language => useUiLanguageStore((state) => state.uiLanguage);

export const useSetUiLanguage = (): ((language: Language) => void) =>
  useUiLanguageStore((state) => state.setUiLanguage);

/** Called once from `main.tsx` so `<html lang>` matches the stored preference. */
export function initialiseUiLanguage(): void {
  applyDocumentLanguage(useUiLanguageStore.getState().uiLanguage);
}
