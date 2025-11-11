import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useCategoryStore } from '../stores/useCategoryStore';
import { useDashboardStore } from '../stores/useDashboardStore';
import { GlassCard } from '../components/GlassCard';

export default function CustomizeDashboardScreen() {
  const navigation = useNavigation();
  const { categories, loadCategories } = useCategoryStore();
  const { preferences, loadPreferences, toggleCategoryVisibility, isCategoryVisible } = useDashboardStore();
  const [localVisible, setLocalVisible] = useState<string[]>([]);

  useEffect(() => {
    loadCategories();
    loadPreferences();
  }, []);

  useEffect(() => {
    setLocalVisible(preferences.visibleCategoryIds);
  }, [preferences]);

  const handleToggle = async (categoryId: string) => {
    await toggleCategoryVisibility(categoryId);
  };

  return (
    <LinearGradient colors={theme.gradients.backgroundAnimated} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customize Dashboard</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <GlassCard style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Ionicons name="information-circle" size={24} color={theme.colors.primary.cyan} />
              <Text style={styles.infoText}>
                Select which category cards you want to see on your home screen. Cards will show your progress for each category.
              </Text>
            </View>
          </GlassCard>

          {/* Preview Section */}
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>
              Selected Categories ({localVisible.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              These cards will appear on your home screen
            </Text>
          </View>

          {/* Categories List */}
          <View style={styles.categoriesList}>
            {categories.map((category) => {
              const isVisible = isCategoryVisible(category.id);
              return (
                <GlassCard key={category.id} style={styles.categoryCard}>
                  <View style={styles.categoryContent}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                        <Ionicons name={category.icon as any} size={24} color={category.color} />
                      </View>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryDescription}>
                          {isVisible ? 'Visible on dashboard' : 'Hidden from dashboard'}
                        </Text>
                      </View>
                    </View>

                    <Switch
                      value={isVisible}
                      onValueChange={() => handleToggle(category.id)}
                      trackColor={{ 
                        false: theme.colors.background.tertiary, 
                        true: category.color + '80' 
                      }}
                      thumbColor={isVisible ? category.color : theme.colors.text.quaternary}
                      ios_backgroundColor={theme.colors.background.tertiary}
                    />
                  </View>
                </GlassCard>
              );
            })}
          </View>

          {/* Tips Card */}
          <GlassCard style={styles.tipsCard}>
            <View style={styles.tipsContent}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb" size={20} color={theme.colors.primary.mint} />
                <Text style={styles.tipsTitle}>Tips</Text>
              </View>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.tipText}>Cards update in real-time as you track sessions</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.tipText}>Show only the categories you use most often</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.tipText}>You can change this anytime from Settings</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
  },
  infoCard: {
    marginBottom: theme.spacing[6],
  },
  infoContent: {
    flexDirection: 'row',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  previewSection: {
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  categoriesList: {
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  categoryCard: {
    // Single style object, no array
  } as ViewStyle,
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[4],
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  categoryDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  tipsCard: {
    // Single style object
  } as ViewStyle,
  tipsContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  tipsTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  tipsList: {
    gap: theme.spacing[2],
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[2],
  },
  tipText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});