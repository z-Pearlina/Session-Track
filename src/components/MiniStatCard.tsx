import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { theme } from '../theme/theme';

interface MiniStatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}

export function MiniStatCard({ icon, value, label }: MiniStatCardProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.content}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={theme.colors.primary.cyan} 
          style={styles.icon}
        />
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 100,
    marginRight: theme.spacing[3],
  },
  content: {
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
  },
  icon: {
    marginBottom: theme.spacing[1.5],
  },
  value: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});