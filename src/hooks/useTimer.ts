import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: (newDuration?: number) => void;
}

export function useTimer(durationSeconds: number, onExpire: () => void): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const remainingRef = useRef<number>(durationSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  onExpireRef.current = onExpire;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, remainingRef.current - elapsed);
      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0) {
        clearTimer();
        setIsRunning(false);
        setTimeLeft(0);
        onExpireRef.current();
      }
    }, 100);
  }, [clearTimer]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback((newDuration?: number) => {
    clearTimer();
    const dur = newDuration ?? durationSeconds;
    remainingRef.current = dur;
    setTimeLeft(dur);
    setIsRunning(false);
  }, [clearTimer, durationSeconds]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return { timeLeft, isRunning, start, pause, reset };
}
