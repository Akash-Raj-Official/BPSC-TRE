import { examConfig } from '@/config/examConfig';
import type { Language, LocalizedText } from '@/types/exam';

/** Renders marks at the configured precision, normalising `-0` to `0.00`. */
export function formatMarks(value: number): string {
  const normalised = Object.is(value, -0) ? 0 : value;
  return normalised.toFixed(examConfig.scorePrecision);
}

/** Renders marks with an explicit sign, e.g. `+1.00` / `-0.33`. */
export function formatSignedMarks(value: number): string {
  const normalised = Object.is(value, -0) ? 0 : value;
  const sign = normalised > 0 ? '+' : '';
  return `${sign}${normalised.toFixed(examConfig.scorePrecision)}`;
}

export function formatPercent(value: number, precision = 2): string {
  return `${(Object.is(value, -0) ? 0 : value).toFixed(precision)}%`;
}

/**
 * Picks the best available translation.
 * Falls back to the other configured language rather than rendering nothing,
 * because a partially translated question must still be answerable.
 */
export function localized(text: LocalizedText | undefined, language: Language): string {
  if (!text) return '';
  const preferred = text[language];
  if (preferred) return preferred;
  for (const fallback of examConfig.languages) {
    const value = text[fallback];
    if (value) return value;
  }
  return '';
}

/** True when a translation for the requested language is genuinely missing. */
export function isTranslationMissing(text: LocalizedText | undefined, language: Language): boolean {
  return Boolean(text) && !text?.[language];
}

export function formatDateTime(epochMs: number, language: Language): string {
  const locale = language === 'hindi' ? 'hi-IN' : 'en-IN';
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(epochMs));
  } catch {
    return new Date(epochMs).toLocaleString();
  }
}

/** `1,234` grouping for counts. */
export function formatCount(value: number, language: Language): string {
  const locale = language === 'hindi' ? 'hi-IN' : 'en-IN';
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return String(value);
  }
}
