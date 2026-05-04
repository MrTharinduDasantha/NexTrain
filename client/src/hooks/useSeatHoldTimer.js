import { useEffect, useState, useCallback } from "react";

/**
 * Countdown hook for the 10-minute seat hold.
 *
 * @param {string|Date|null} expiresAt — when the hold ends.
 * @param {Function} onExpire — called once when the timer reaches zero.
 *
 * Returns:
 *   { secondsLeft, mmss, percentage, isExpired }
 */
export const useSeatHoldTimer = (expiresAt, onExpire) => {
  const target = expiresAt ? new Date(expiresAt).getTime() : null;
  const initial = target
    ? Math.max(0, Math.floor((target - Date.now()) / 1000))
    : 0;
  const [secondsLeft, setSecondsLeft] = useState(initial);

  const compute = useCallback(() => {
    if (!target) return 0;
    return Math.max(0, Math.floor((target - Date.now()) / 1000));
  }, [target]);

  useEffect(() => {
    if (!target) return;
    setSecondsLeft(compute());
    const id = setInterval(() => {
      const left = compute();
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(id);
        if (onExpire) onExpire();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target, compute, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const mmss = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Used by progress bars; assumes a fresh 10-minute window
  const HOLD_TOTAL = 10 * 60;
  const percentage = target
    ? Math.max(0, Math.min(100, (secondsLeft / HOLD_TOTAL) * 100))
    : 0;

  return {
    secondsLeft,
    mmss,
    percentage,
    isExpired: target && secondsLeft <= 0,
  };
};

export default useSeatHoldTimer;
