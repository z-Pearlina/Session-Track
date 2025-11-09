import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface TimerDisplayProps {
  elapsedMs: number;
  size?: 'small' | 'large';
}

export function TimerDisplay({ elapsedMs, size = 'large' }: TimerDisplayProps) {
  // Format milliseconds to HH:MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isLarge = size === 'large';

  return (
    <View style={styles.container}>
      <Text style={[styles.time, isLarge ? styles.timeLarge : styles.timeSmall]}>
        {formatTime(elapsedMs)}
      </Text>
      <Text style={[styles.label, isLarge ? styles.labelLarge : styles.labelSmall]}>
        {elapsedMs < 3600000 ? 'MM:SS' : 'HH:MM:SS'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  time: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  timeLarge: {
    fontSize: 72,
    letterSpacing: -2,
  },
  timeSmall: {
    fontSize: 32,
  },
  label: {
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium,
    marginTop: theme.spacing.xs,
  },
  labelLarge: {
    fontSize: theme.fontSize.md,
  },
  labelSmall: {
    fontSize: theme.fontSize.sm,
  },
});