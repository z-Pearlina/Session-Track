import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search sessions...',
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value]);

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.containerFocused,
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? theme.colors.primary.cyan : theme.colors.text.tertiary}
        style={styles.searchIcon}
      />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.quaternary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {value.length > 0 && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing[4],
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  containerFocused: {
    borderColor: theme.colors.primary.cyan,
    backgroundColor: theme.colors.background.tertiary,
  },
  searchIcon: {
    marginRight: theme.spacing[2],
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.text.primary,
    padding: 0,
  },
  clearButton: {
    padding: theme.spacing[1],
  },
});