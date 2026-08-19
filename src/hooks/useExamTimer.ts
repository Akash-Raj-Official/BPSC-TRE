import { useEffect, useRef, useState } from 'react';
import { getRemainingSeconds, getTimerSeverity } from '@/utils/timer';
import type { TimerSeverity } from '@/utils/timer';

interface UseExamTimerOptions {
  /** Wall-clock timestamp at which the attempt must end. */
  examEndTime: number | null;
  /** Pause ticking once the paper has been submitted. */
  active: boolean;
  /** Fired exactly once when the clock reaches zero. */
  onExpire?: () => void;
}

interface ExamTimer {
  remainingSeconds: number;
  severity: TimerSeverity;
  expired: boolean;
}

/**
 * Countdown driven by `Date.now()` against a stored end timestamp.
 *
 * Never accumulates elapsed ticks: if the tab is suspended, the device sleeps
 * or the page is refreshed, the next tick still reports the true remaining
 * time. A `visibilitychange` listener refreshes the value the instant the tab
 * comes back into view instead of waiting up to a second.
 */
export function useExamTimer({ examEndTime, active, onExpire }: UseExamTimerOptions): ExamTimer {
  const [remainingSeconds, setRemainingSeconds] = useState(() => getRemainingSeconds(examEndTime));
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    expiredRef.current = false;
  }, [examEndTime]);

  useEffect(() => {
    if (!examEndTime) {
      setRemainingSeconds(0);
      return;
    }

    const tick = (): void => {
      const remaining = getRemainingSeconds(examEndTime);
      setRemainingSeconds(remaining);

      if (remaining <= 0 && active && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
      }
    };

    tick();
    if (!active) return;

    const intervalId = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [examEndTime, active]);

  return {
    remainingSeconds,
    severity: getTimerSeverity(remainingSeconds),
    expired: remainingSeconds <= 0,
  };
}
