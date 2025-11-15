import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useGoals, useGoalActions } from '../stores/useGoalStore';
import { Goal } from '../types';
import { COLORS } from '../theme/theme';
import { RootStackNavigationProp } from '../types';


export default function GoalsScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const goals = useGoals();
  const { loadGoals, deleteGoal } = useGoalActions();
  
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

  const filteredGoals = goals.filter(goal => {
    if (filterPeriod === 'all') return true;
    return goal.period === filterPeriod;
  });

  const activeGoals = filteredGoals.filter(g => g.status === 'active');
  const completedGoals = filteredGoals.filter(g => g.status === 'completed');

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[COLORS.background.primary, COLORS.background.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goals</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateGoal')}
          style={styles.addButton}
        >
          <Ionicons name="add" size={28} color={COLORS.primary.cyan} />
        </TouchableOpacity>
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
            style={styles.filterChipWrapper}
          >
            <BlurView intensity={30} tint="dark" style={styles.filterChip}>
              <Text
                style={[
                  styles.filterChipText,
                  filterPeriod === period && styles.filterChipTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </BlurView>
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
            tintColor={COLORS.primary.cyan}
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
            <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>
              Completed Goals 🎉
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
            <Ionicons name="trophy-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyStateTitle}>No Goals Yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first goal to start tracking your progress!
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateGoal')}
              style={styles.createFirstGoalButton}
            >
              <LinearGradient
                colors={[COLORS.primary.cyan, COLORS.primary.aqua]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.createFirstGoalGradient}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createFirstGoalText}>Create Goal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
      case 'daily':
        return 'today';
      case 'weekly':
        return 'calendar';
      case 'monthly':
        return 'calendar-outline';
      default:
        return 'time';
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <BlurView intensity={30} tint="dark" style={styles.goalCard}>
        <View style={styles.goalCardContent}>
          {/* Header */}
          <View style={styles.goalCardHeader}>
            <View style={styles.goalCardTitleRow}>
              <Ionicons
                name={getPeriodIcon(goal.period)}
                size={20}
                color={isCompleted ? COLORS.success : COLORS.primary.cyan}
              />
              <Text style={styles.goalCardTitle} numberOfLines={1}>
                {goal.title}
              </Text>
              {isCompleted && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              )}
            </View>
            <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
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
                    ? [COLORS.success, COLORS.success]
                    : [COLORS.primary.cyan, COLORS.primary.aqua]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.goalCardFooter}>
            <View style={styles.goalCardPeriodBadge}>
              <Text style={styles.goalCardPeriodText}>
                {goal.period.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.goalCardDates}>
              {new Date(goal.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}{' '}
              →{' '}
              {new Date(goal.endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterChipWrapper: {
    marginRight: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  filterChipTextActive: {
    color: COLORS.primary.cyan,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  sectionTitleSpacing: {
    marginTop: 24,
  },
  goalCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  goalCardContent: {
    padding: 16,
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  goalCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
  },
  goalCardDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  goalCardProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalCardProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  goalCardProgressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary.cyan,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: COLORS.glass.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalCardPeriodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.glass.border,
    borderRadius: 6,
  },
  goalCardPeriodText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text.secondary,
    letterSpacing: 0.5,
  },
  goalCardDates: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  createFirstGoalButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createFirstGoalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  createFirstGoalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});