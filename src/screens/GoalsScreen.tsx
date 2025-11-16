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

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentProgress / goal.targetMinutes) * 100, 100);
  };

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
            <Ionicons name="add" size={28} color={theme.colors.primary.cyan} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards - NO SCROLLVIEW HERE */}
        <View style={styles.statsContainer}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>TOTAL</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>ACTIVE</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>COMPLETED</Text>
          </GlassCard>
        </View>

        {/* Filter Chips - NO SCROLLVIEW HERE */}
        <View style={styles.filtersWrapper}>
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
                  <Text style={[
                    styles.filterChipText,
                    filterPeriod === period && styles.filterChipTextActive,
                  ]}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Goals List - ONLY THIS SCROLLS */}
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
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => navigation.navigate('GoalDetails', { goalId: goal.id })}
                  activeOpacity={0.7}
                >
                  <GlassCard style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                      <View style={styles.goalInfo}>
                        <Ionicons name="trophy" size={24} color={theme.colors.primary.cyan} />
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteGoal(goal.id, goal.title)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.goalStats}>
                      <Text style={styles.goalProgress}>
                        {formatMinutes(goal.currentProgress)} / {formatMinutes(goal.targetMinutes)}
                      </Text>
                      <Text style={styles.goalPercentage}>
                        {Math.round(getProgressPercentage(goal))}%
                      </Text>
                    </View>

                    <View style={styles.progressBarBackground}>
                      <LinearGradient
                        colors={[theme.colors.primary.cyan, theme.colors.primary.aqua]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.progressBarFill,
                          { width: `${getProgressPercentage(goal)}%` },
                        ]}
                      />
                    </View>

                    <View style={styles.goalFooter}>
                      <View style={styles.periodBadge}>
                        <Text style={styles.periodText}>{goal.period.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.goalDates}>
                        {new Date(goal.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(goal.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, activeGoals.length > 0 && styles.sectionTitleSpacing]}>
                Completed Goals ✓
              </Text>
              {completedGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => navigation.navigate('GoalDetails', { goalId: goal.id })}
                  activeOpacity={0.7}
                >
                  <GlassCard style={[styles.goalCard, styles.goalCardCompleted]}>
                    <View style={styles.goalHeader}>
                      <View style={styles.goalInfo}>
                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                      </View>
                    </View>
                    <Text style={styles.completedText}>Goal Completed! 🎉</Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Empty State */}
          {filteredGoals.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color={theme.colors.text.tertiary} />
              <Text style={styles.emptyStateTitle}>No Goals Yet</Text>
              <Text style={styles.emptyStateText}>
                Create your first goal to start tracking your progress!
              </Text>
              
              {/* Create Goal Button */}
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateGoal')}
                style={styles.createGoalButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.colors.primary.cyan, theme.colors.primary.aqua]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.createGoalGradient}
                >
                  <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.createGoalText}>Create Your First Goal</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
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
    paddingVertical: theme.spacing[3],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
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
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  statCard: {
    flex: 1,
    padding: theme.spacing[4],
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
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  filtersWrapper: {
    marginBottom: theme.spacing[3],
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing[4],
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
    paddingTop: 0,
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
  goalCard: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  goalCardCompleted: {
    opacity: 0.7,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    flex: 1,
  },
  goalTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[2],
  },
  goalProgress: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.semibold,
  },
  goalPercentage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary.cyan,
    fontWeight: theme.fontWeight.bold,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing[3],
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodBadge: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    backgroundColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.md,
  },
  periodText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.cyan,
    letterSpacing: 0.5,
  },
  goalDates: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontWeight: theme.fontWeight.semibold,
  },
  completedText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.semibold,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[16],
  },
  emptyStateTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  emptyStateText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing[8],
    marginBottom: theme.spacing[6],
  },
  createGoalButton: {
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    elevation: 4,
    shadowColor: theme.colors.primary.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createGoalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    gap: theme.spacing[2],
  },
  createGoalText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
});