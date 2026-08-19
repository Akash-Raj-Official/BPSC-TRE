import { useEffect, useState } from 'react';

/** Subscribes to a CSS media query. Returns `false` during SSR/tests. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const media = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent): void => setMatches(event.matches);

    setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/** Matches Tailwind's `lg` breakpoint (1024px). */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
