import { create } from 'zustand';
import { readJSON, STORAGE_KEYS, writeJSON } from '@/utils/storage';

/**
 * Light / dark theme.
 *
 * Tailwind is configured with `darkMode: 'class'`, so the only thing this
 * store has to do is keep the `dark` class on <html> in sync with the user's
 * choice. "System" follows the OS setting live via a media query listener.
 */

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const MEDIA_QUERY = '(prefers-color-scheme: dark)';

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

function resolve(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? systemTheme() : preference;
}

function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

function isPreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

function readStoredPreference(): ThemePreference {
  const stored = readJSON<ThemePreference>(STORAGE_KEYS.theme, isPreference);
  return stored ?? 'system';
}

interface ThemeStore {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /** Cycles light -> dark -> system, used by the header toggle. */
  cyclePreference: () => void;
}

const initialPreference = readStoredPreference();
const initialResolved = resolve(initialPreference);

export const useThemeStore = create<ThemeStore>((set, get) => ({
  preference: initialPreference,
  resolved: initialResolved,

  setPreference: (preference) => {
    const resolved = resolve(preference);
    writeJSON(STORAGE_KEYS.theme, preference);
    applyTheme(resolved);
    set({ preference, resolved });
  },

  cyclePreference: () => {
    const order: ThemePreference[] = ['light', 'dark', 'system'];
    const index = order.indexOf(get().preference);
    const next = order[(index + 1) % order.length] ?? 'system';
    get().setPreference(next);
  },
}));

/**
 * Applies the stored theme before React renders and keeps "system" in sync.
 * Called once from `main.tsx`; returns a cleanup function for completeness.
 */
export function initialiseTheme(): () => void {
  applyTheme(useThemeStore.getState().resolved);

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined;
  }

  const media = window.matchMedia(MEDIA_QUERY);
  const listener = (event: MediaQueryListEvent): void => {
    if (useThemeStore.getState().preference !== 'system') return;
    const resolved: ResolvedTheme = event.matches ? 'dark' : 'light';
    applyTheme(resolved);
    useThemeStore.setState({ resolved });
  };

  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}
