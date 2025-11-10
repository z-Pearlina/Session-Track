import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

interface FABButtonProps {
  onPress: () => void;
}

export function FABButton({ onPress }: FABButtonProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        {/* Outer glow effect */}
        <View style={styles.glowOuter} />
        
        {/* Button gradient */}
        <LinearGradient
          colors={['#67E8F9', '#34D399']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.text}>Start Session ⚡</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 96, // Above the glass navbar
    left: 24,
    right: 24,
    zIndex: 20,
  },
  touchable: {
    position: 'relative',
    borderRadius: theme.borderRadius.full,
  },
  glowOuter: {
    position: 'absolute',
    inset: 0,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'inherit',
    opacity: 0.7,
    ...theme.shadows.glowCyan,
  },
  gradient: {
    position: 'relative',
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[8],
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  text: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
    letterSpacing: 0.5,
  },
});