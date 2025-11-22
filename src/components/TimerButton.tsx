import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface TimerButtonProps {
  onPress: () => void;
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

export function TimerButton({ 
  onPress, 
  title, 
  icon, 
  variant = 'primary',
  disabled = false,
  style 
}: TimerButtonProps) {
  const getGradientColors = (): [string, string, ...string[]] => {
    if (disabled) return [theme.colors.background.tertiary, theme.colors.background.tertiary];
    
    switch (variant) {
      case 'primary':
        return [...theme.gradients.primary] as [string, string, ...string[]];
      case 'secondary':
        return [theme.colors.background.tertiary, theme.colors.background.secondary];
      case 'danger':
        return [theme.colors.danger, '#E85555'];
      default:
        return [...theme.gradients.primary] as [string, string, ...string[]];
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={style}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.button,
          variant === 'primary' && styles.primaryButton,
          disabled && styles.disabled,
        ]}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={24} 
            color={variant === 'secondary' ? theme.colors.primary.cyan : theme.colors.text.primary} 
            style={styles.icon}
          />
        )}
        <Text style={[
          styles.buttonText,
          variant === 'secondary' && styles.secondaryText
        ]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[4] + 2,
    paddingHorizontal: theme.spacing[6],
    borderRadius: theme.borderRadius.xl,
    minWidth: 120,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primaryButton: {
    ...theme.shadows.glowAqua,
    borderColor: theme.colors.primary.cyan + '30',
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.5,
  },
  secondaryText: {
    color: theme.colors.primary.cyan,
  },
  icon: {
    marginRight: theme.spacing[2],
  },
  disabled: {
    opacity: 0.4,
  },
});