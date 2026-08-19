import { useEffect } from 'react';

/**
 * Shows the browser's native "leave site?" prompt while an attempt is running.
 *
 * Browsers ignore custom text and only display the prompt after a genuine user
 * interaction, which is exactly the restrained behaviour we want — no custom
 * modal that fights with normal in-app navigation.
 */
export function useBeforeUnload(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      // Legacy browsers require returnValue to be set to trigger the prompt.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled]);
}
