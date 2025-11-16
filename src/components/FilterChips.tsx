import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { useCategories } from '../stores/useCategoryStore';
import { useSessionFilter, useSetFilter, useClearFilter } from '../stores/useSessionStore';

export function FilterChips() {
  const categories = useCategories();
  const filter = useSessionFilter();
  const setFilter = useSetFilter();
  const clearFilter = useClearFilter();

  const handleCategoryPress = (categoryId: string) => {
    if (filter.categoryId === categoryId) {
      setFilter({ ...filter, categoryId: undefined });
    } else {
      setFilter({ ...filter, categoryId });
    }
  };

  const hasActiveFilters = filter.categoryId || filter.dateRange || filter.searchQuery;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hasActiveFilters && (
          <TouchableOpacity
            style={[styles.chip, styles.clearChip]}
            onPress={() => clearFilter()}
          >
            <Ionicons name="close-circle" size={16} color={theme.colors.danger} />
            <Text style={styles.clearChipText}>Clear</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.chip, !filter.categoryId && styles.chipActive]}
          onPress={() => setFilter({ ...filter, categoryId: undefined })}
        >
          <Text
            style={[
              styles.chipText,
              !filter.categoryId && styles.chipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.chip,
              filter.categoryId === category.id && styles.chipActive,
              { borderColor: category.color + '40' },
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={16}
              color={
                filter.categoryId === category.id
                  ? theme.colors.text.inverse
                  : category.color
              }
            />
            <Text
              style={[
                styles.chipText,
                filter.categoryId === category.id && styles.chipTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  scrollContent: {
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1.5],
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary.cyan,
    borderColor: theme.colors.primary.cyan,
  },
  chipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  chipTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.fontWeight.bold,
  },
  clearChip: {
    backgroundColor: theme.colors.danger + '20',
    borderColor: theme.colors.danger + '40',
  },
  clearChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.danger,
  },
});
