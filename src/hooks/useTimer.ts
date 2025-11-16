import { useState, useRef, useEffect, useCallback } from 'react';

interface UseTimerReturn {
  elapsedMs: number;
  isRunning: boolean;
  isPaused: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export function useTimer(): UseTimerReturn {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const pausedTotalRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    pausedTotalRef.current = 0;
    pauseStartRef.current = null;
    setIsRunning(true);
    setIsPaused(false);
    setElapsedMs(0);
  }, []);

  const pauseTimer = useCallback(() => {
    if (!isRunning || isPaused) return;
    pauseStartRef.current = Date.now();
    setIsPaused(true);
  }, [isRunning, isPaused]);

  const resumeTimer = useCallback(() => {
    if (!isRunning || !isPaused || !pauseStartRef.current) return;

    const pauseDuration = Date.now() - pauseStartRef.current;
    pausedTotalRef.current += pauseDuration;
    pauseStartRef.current = null;

    setIsPaused(false);
  }, [isRunning, isPaused]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    pauseStartRef.current = null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setElapsedMs(0);
    startTimeRef.current = null;
    pausedTotalRef.current = 0;
    pauseStartRef.current = null;
  }, [stopTimer]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = Date.now();
          const elapsed = now - startTimeRef.current - pausedTotalRef.current;
          setElapsedMs(elapsed);
        }
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isRunning, isPaused]);

  return {
    elapsedMs,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
  };
}