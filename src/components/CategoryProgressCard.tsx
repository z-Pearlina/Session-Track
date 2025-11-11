import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { theme } from '../theme/theme';

interface CategoryProgressCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  progress: number; // 0-100
  color: string;
  gradientColors: string[];
}

export function CategoryProgressCard({ 
  icon, 
  title, 
  progress, 
  color,
  gradientColors 
}: CategoryProgressCardProps) {
  return (
    <GlassCard style={styles.card} withReflection>
      <View style={styles.content}>
        {/* Icon container */}
        <View style={[styles.iconContainer, { backgroundColor: color + '33' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>

        {/* Title & Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={gradientColors as [string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill, 
                { width: `${progress}%` },
                { shadowColor: color, shadowOpacity: 0.7, shadowRadius: 8 }
              ]}
            />
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  content: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    width: '100%',
  },
  title: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});