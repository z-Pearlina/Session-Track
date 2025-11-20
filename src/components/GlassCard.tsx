import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: number;
  withReflection?: boolean;
}

export function GlassCard({ 
  children, 
  style, 
  withReflection = false 
}: GlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.contentContainer}>
        {children}
        
        {withReflection && (
          <LinearGradient
            colors={theme.gradients.reflection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reflection}
            pointerEvents="none"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    backgroundColor: theme.colors.glass.background,
  },
  contentContainer: {
    position: 'relative',
  },
  reflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.borderRadius['2xl'],
  },
});