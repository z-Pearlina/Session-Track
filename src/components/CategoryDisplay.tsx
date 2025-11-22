import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';

interface CategoryDisplayProps {
  category: Category;
  iconSize?: number;
  emojiSize?: number;
  showIcon?: boolean;
}

export const CategoryDisplay: React.FC<CategoryDisplayProps> = ({
  category,
  iconSize = 24,
  emojiSize = 24,
  showIcon = true,
}) => {
  // Priority: emoji > icon
  if (category.emoji) {
    return (
      <Text 
        style={[
          styles.emoji,
          { fontSize: emojiSize }
        ]}
        allowFontScaling={false}
      >
        {category.emoji}
      </Text>
    );
  }

  // Fallback to icon
  if (showIcon) {
    return (
      <Ionicons 
        name={category.icon as any} 
        size={iconSize} 
        color={category.color} 
      />
    );
  }

  return null;
};

const styles = StyleSheet.create({
  emoji: {
    textAlign: 'center',
    // Ensure emoji displays properly on all platforms
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});