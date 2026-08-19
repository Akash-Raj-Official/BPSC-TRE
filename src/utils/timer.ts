import { examConfig } from '@/config/examConfig';

/**
 * Timer helpers.
 *
 * The exam clock is *never* derived from a tick counter. A wall-clock end
 * timestamp (`examEndTime`) is persisted at start and the remaining time is
 * recomputed from `Date.now()` on every render, so refreshing, sleeping the
 * device or switching tabs cannot add time to the exam.
 */

export type TimerSeverity = 'normal' | 'warning' | 'danger' | 'expired';

export function getRemainingSeconds(examEndTime: number | null, now: number = Date.now()): number {
  if (!examEndTime) return 0;
  return Math.max(0, Math.ceil((examEndTime - now) / 1000));
}

export function getElapsedSeconds(examStartTime: number | null, now: number = Date.now()): number {
  if (!examStartTime) return 0;
  return Math.max(0, Math.floor((now - examStartTime) / 1000));
}

export function getTimerSeverity(remainingSeconds: number): TimerSeverity {
  if (remainingSeconds <= 0) return 'expired';
  if (remainingSeconds <= examConfig.timerDangerSeconds) return 'danger';
  if (remainingSeconds <= examConfig.timerWarningSeconds) return 'warning';
  return 'normal';
}

const pad = (value: number): string => String(value).padStart(2, '0');

/** `02:00:00` style clock used by the exam header. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** `1h 23m 04s` style summary used on the result page. */
export function formatDurationLabel(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (hours > 0 || minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${pad(seconds)}s`);
  return parts.join(' ');
}

/** Announced to screen readers, so it must read as words rather than digits. */
export function formatClockForScreenReader(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  return `${parts.join(' ')} remaining`;
}
