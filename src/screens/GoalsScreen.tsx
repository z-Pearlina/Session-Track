import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGoals, useLoadGoals, useDeleteGoal } from '../stores/useGoalStore';
import { Goal } from '../types';
import { theme } from '../theme/theme';
import { GlassCard } from '../components/GlassCard';
import { RootStackNavigationProp } from '../types';


export default function GoalsScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const goals = useGoals();
  const loadGoals = useLoadGoals();
  const deleteGoal = useDeleteGoal();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  };

  const handleDeleteGoal = (goalId: string, goalTitle: string) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goalTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(goalId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal');
            }
          },
        },
      ]
    );
  };

  const filteredGoals = useMemo(() => {
    if (filterPeriod === 'all') return goals;
    return goals.filter(goal => goal.period === filterPeriod);
  }, [goals, filterPeriod]);

  const activeGoals = useMemo(() => 
    filteredGoals.filter(g => g.status === 'active'), 
    [filteredGoals]
  );
  
  const completedGoals = useMemo(() => 
    filteredGoals.filter(g => g.status === 'completed'), 
    [filteredGoals]
  );

  const stats = useMemo(() => ({
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
  }), [goals]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Goals</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateGoal')}
            style={styles.addButton}
          >
            <View style={styles.addButtonGlow} />
            <Ionicons name="add" size={28} color={theme.colors.primary.cyan} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </GlassCard>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {(['all', 'daily', 'weekly', 'monthly'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setFilterPeriod(period)}
              activeOpacity={0.7}
            >
              <GlassCard style={[
                styles.filterChip,
                filterPeriod === period && styles.filterChipActive
              ]}>
                <Text
                  style={[
                    styles.filterChipText,
                    filterPeriod === period && styles.filterChipTextActive,
                  ]}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Goals List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary.cyan}
              colors={[theme.colors.primary.cyan]}
            />
          }
        >
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Active Goals</Text>
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onPress={() => navigation.navigate('GoalDetails', { goalId: goal.id })}
                  onDelete={() => handleDeleteGoal(goal.id, goal.title)}
                />
              ))}
            </>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, activeGoals.length > 0 && styles.sectionTitleSpacing]}>
                Completed 🎉
              </Text>
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onPress={() => navigation.navigate('GoalDetails', { goalId: goal.id })}
                  onDelete={() => handleDeleteGoal(goal.id, goal.title)}
                />
              ))}
            </>
          )}

          {/* Empty State */}
          {filteredGoals.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="trophy-outline" size={64} color={theme.colors.text.tertiary} />
              </View>
              <Text style={styles.emptyStateTitle}>No Goals Yet</Text>
              <Text style={styles.emptyStateText}>
                Create your first goal to start tracking your progress!
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateGoal')}
                style={styles.createButton}
              >
                <LinearGradient
                  colors={theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.createButtonGradient}
                >
                  <Ionicons name="add" size={20} color={theme.colors.text.inverse} />
                  <Text style={styles.createButtonText}>Create Goal</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
  onDelete: () => void;
}

function GoalCard({ goal, onPress, onDelete }: GoalCardProps) {
  const progressPercentage = Math.min(
    (goal.currentProgress / goal.targetMinutes) * 100,
    100
  );

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'daily': return 'today';
      case 'weekly': return 'calendar';
      case 'monthly': return 'calendar-outline';
      default: return 'time';
    }
  };

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isCompleted = goal.status === 'completed';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.goalCardWrapper}>
      <GlassCard style={styles.goalCard}>
        {/* Header */}
        <View style={styles.goalCardHeader}>
          <View style={styles.goalCardTitleRow}>
            <View style={[
              styles.iconCircle,
              { backgroundColor: isCompleted ? theme.colors.success + '20' : theme.colors.primary.cyan + '20' }
            ]}>
              <Ionicons
                name={getPeriodIcon(goal.period)}
                size={20}
                color={isCompleted ? theme.colors.success : theme.colors.primary.cyan}
              />
            </View>
            <Text style={styles.goalCardTitle} numberOfLines={1}>
              {goal.title}
            </Text>
            {isCompleted && (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            )}
          </View>
          <TouchableOpacity 
            onPress={onDelete} 
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        {goal.description && (
          <Text style={styles.goalCardDescription} numberOfLines={2}>
            {goal.description}
          </Text>
        )}

        {/* Progress */}
        <View style={styles.goalCardProgress}>
          <Text style={styles.goalCardProgressText}>
            {formatMinutes(goal.currentProgress)} / {formatMinutes(goal.targetMinutes)}
          </Text>
          <Text style={styles.goalCardProgressPercentage}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={
                isCompleted
                  ? [theme.colors.success, theme.colors.success]
                  : theme.gradients.primary
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.goalCardFooter}>
          <View style={styles.periodBadge}>
            <Text style={styles.periodBadgeText}>
              {goal.period.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.goalCardDates}>
            {new Date(goal.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
            {' → '}
            {new Date(goal.endDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: 0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  addButtonGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.cyan,
    ...theme.shadows.glowCyan,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  statCard: {
    flex: 1,
    paddingVertical: theme.spacing[4],
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.cyan,
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    gap: theme.spacing[2],
  },
  filterChip: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    marginRight: theme.spacing[2],
  },
  filterChipActive: {
    borderColor: theme.colors.primary.cyan,
    borderWidth: 2,
  },
  filterChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  filterChipTextActive: {
    color: theme.colors.primary.cyan,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    letterSpacing: 0.3,
  },
  sectionTitleSpacing: {
    marginTop: theme.spacing[6],
  },
  goalCardWrapper: {
    marginBottom: theme.spacing[3],
  },
  goalCard: {
    padding: theme.spacing[4],
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[2],
  },
  goalCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing[2],
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCardTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  deleteButton: {
    padding: theme.spacing[2],
  },
  goalCardDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
    lineHeight: 20,
  },
  goalCardProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  goalCardProgressText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  goalCardProgressPercentage: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.cyan,
  },
  progressBarContainer: {
    marginBottom: theme.spacing[3],
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.lg,
  },
  goalCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodBadge: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    backgroundColor: theme.colors.primary.cyan + '20',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary.cyan + '40',
  },
  periodBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.cyan,
    letterSpacing: 0.5,
  },
  goalCardDates: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontWeight: theme.fontWeight.medium,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[16],
  },
  emptyIconContainer: {
    marginBottom: theme.spacing[4],
  },
  emptyStateTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  emptyStateText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[8],
    lineHeight: 24,
  },
  createButton: {
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    ...theme.shadows.glowCyan,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[3],
    gap: theme.spacing[2],
  },
  createButtonText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
});