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
  const pausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start the timer
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
    setElapsedMs(0);
  }, []);

  // Pause the timer
  const pauseTimer = useCallback(() => {
    if (!isRunning || isPaused) return;
    setIsPaused(true);
  }, [isRunning, isPaused]);

  // Resume the timer
  const resumeTimer = useCallback(() => {
    if (!isRunning || !isPaused) return;
    
    // Calculate the time that was paused
    const pauseDuration = Date.now() - (startTimeRef.current! + pausedTimeRef.current + elapsedMs);
    pausedTimeRef.current += pauseDuration;
    
    setIsPaused(false);
  }, [isRunning, isPaused, elapsedMs]);

  // Stop the timer
  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset the timer
  const resetTimer = useCallback(() => {
    stopTimer();
    setElapsedMs(0);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, [stopTimer]);

  // Update elapsed time
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = Date.now();
          const elapsed = now - startTimeRef.current - pausedTimeRef.current;
          setElapsedMs(elapsed);
        }
      }, 100); // Update every 100ms for smooth display

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
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