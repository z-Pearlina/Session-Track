import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { theme } from '../theme/theme';

interface EnergyRingCardProps {
  hours: number;
  minutes: number;
  percentageChange: number;
}

export function EnergyRingCard({ hours, minutes, percentageChange }: EnergyRingCardProps) {
  const isPositive = percentageChange >= 0;

  return (
    <View style={styles.container}>
      {/* Energy ring glow */}
      <View style={styles.energyRing} />
      
      <GlassCard style={styles.card} intensity={30}>
        <View style={styles.content}>
          {/* Background pattern overlay */}
          <View style={styles.patternOverlay} />

          <Text style={styles.label}>Focus Time Today</Text>
          <Text style={styles.time}>{hours}h {minutes}m</Text>
          
          <View style={[styles.badge, isPositive && styles.badgePositive]}>
            <Text style={[styles.badgeText, isPositive && styles.badgeTextPositive]}>
              {isPositive ? '+' : ''}{percentageChange}% vs yesterday
            </Text>
          </View>
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: theme.spacing[4], // Reduced from [8] to [4]
    marginTop: theme.spacing[4], // Added top margin
  },
  energyRing: {
    position: 'absolute',
    top: -16,
    left: 0,
    right: 0,
    height: 220, // Reduced from 300
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(103, 232, 249, 0.1)',
    ...theme.shadows.glowEnergyRing,
    opacity: 0.4,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: theme.spacing[5], // Reduced from [6]
    paddingHorizontal: theme.spacing[4],
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[2],
  },
  time: {
    fontSize: theme.fontSize['3xl'], // Reduced from ['4xl']
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -2,
    marginBottom: theme.spacing[2],
  },
  badge: {
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[0.5],
    borderRadius: theme.borderRadius.full,
  },
  badgePositive: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.danger,
  },
  badgeTextPositive: {
    color: theme.colors.primary.mint,
  },
});