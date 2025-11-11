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

/**
 * ✅ OPTIMIZED: Timer hook with 1-second precision
 * 
 * CHANGES:
 * - Reduced interval from 100ms to 1000ms (10x fewer updates)
 * - Added proper cleanup for all intervals
 * - Memoized all callbacks with useCallback
 * - Fixed potential memory leaks
 */
export function useTimer(): UseTimerReturn {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // ✅ Start the timer (memoized)
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
    setElapsedMs(0);
  }, []);

  // ✅ Pause the timer (memoized)
  const pauseTimer = useCallback(() => {
    if (!isRunning || isPaused) return;
    setIsPaused(true);
  }, [isRunning, isPaused]);

  // ✅ Resume the timer (memoized)
  const resumeTimer = useCallback(() => {
    if (!isRunning || !isPaused) return;
    
    // Calculate the time that was paused
    const pauseDuration = Date.now() - (startTimeRef.current! + pausedTimeRef.current + elapsedMs);
    pausedTimeRef.current += pauseDuration;
    
    setIsPaused(false);
  }, [isRunning, isPaused, elapsedMs]);

  // ✅ Stop the timer (memoized)
  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ✅ Reset the timer (memoized)
  const resetTimer = useCallback(() => {
    stopTimer();
    setElapsedMs(0);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, [stopTimer]);

  // ✅ OPTIMIZATION: Update elapsed time every 1 second (was 100ms)
  // This reduces state updates by 90%, dramatically improving performance
  useEffect(() => {
    if (isRunning && !isPaused) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = Date.now();
          const elapsed = now - startTimeRef.current - pausedTimeRef.current;
          setElapsedMs(elapsed);
        }
      }, 1000); // ✅ Changed from 100ms to 1000ms (10x fewer updates)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Clean up interval when stopped or paused
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