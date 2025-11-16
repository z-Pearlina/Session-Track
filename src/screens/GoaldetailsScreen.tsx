import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useGoalStore } from '../stores/useGoalStore';
import { useCategoryById } from '../stores/useCategoryStore';
import { theme } from '../theme/theme';
import { GoalDetailsRouteProp, RootStackNavigationProp } from '../types';


export default function GoalDetailsScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<GoalDetailsRouteProp>();
  const { goalId } = route.params;

  const { getGoalById, completeGoal, archiveGoal, unarchiveGoal, deleteGoal } = useGoalStore();
  const goal = getGoalById(goalId);
  const category = useCategoryById(goal?.categoryId || '');

  useEffect(() => {
    if (!goal) {
      Alert.alert('Error', 'Goal not found', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [goal, navigation]);

  if (!goal) return null;

  const progressPercentage = Math.min(
    (goal.currentProgress / goal.targetMinutes) * 100,
    100
  );

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleComplete = () => {
    Alert.alert(
      'Complete Goal',
      'Mark this goal as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await completeGoal(goalId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive Goal',
      'Move this goal to archives?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            await archiveGoal(goalId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleUnarchive = () => {
    Alert.alert(
      'Unarchive Goal',
      'Restore this goal to active status?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unarchive',
          onPress: async () => {
            await unarchiveGoal(goalId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteGoal(goalId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleStartSession = () => {
    navigation.navigate('MainTabs', {
      screen: 'StartSession',
      params: {
        goalId: goalId,
        categoryId: goal.categoryId,
      },
    });
  };

  const isCompleted = goal.status === 'completed';
  const isArchived = goal.status === 'archived';

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Goal Details</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          {/* Progress Circle */}
          <BlurView intensity={30} tint="dark" style={styles.progressCard}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                <Text style={styles.completedText}>Completed!</Text>
              </View>
            )}
          </BlurView>

          {/* Goal Info */}
          <BlurView intensity={30} tint="dark" style={styles.infoCard}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            {goal.description && (
              <Text style={styles.goalDescription}>{goal.description}</Text>
            )}

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatMinutes(goal.currentProgress)}</Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatMinutes(goal.targetMinutes)}</Text>
                <Text style={styles.statLabel}>Target</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatMinutes(Math.max(0, goal.targetMinutes - goal.currentProgress))}
                </Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={isCompleted ? [theme.colors.success, theme.colors.success] : [theme.colors.primary.cyan, theme.colors.primary.aqua]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
                />
              </View>
            </View>
          </BlurView>

          {/* Details */}
          <BlurView intensity={30} tint="dark" style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.text.secondary} />
              <Text style={styles.detailLabel}>Period</Text>
              <Text style={styles.detailValue}>{goal.period.toUpperCase()}</Text>
            </View>

            {category && (
              <View style={styles.detailRow}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{category.name}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color={theme.colors.text.secondary} />
              <Text style={styles.detailLabel}>Timeline</Text>
              <Text style={styles.detailValue}>
                {new Date(goal.startDate).toLocaleDateString()} → {new Date(goal.endDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="flag" size={20} color={theme.colors.text.secondary} />
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, styles.statusText]}>{goal.status.toUpperCase()}</Text>
            </View>
          </BlurView>

          {/* Actions */}
          {!isCompleted && !isArchived && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity onPress={handleStartSession} style={styles.actionButton}>
                <LinearGradient
                  colors={[theme.colors.primary.cyan, theme.colors.primary.aqua]}
                  style={styles.actionGradient}
                >
                  <Ionicons name="play-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.actionText}>Start Session</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleComplete} style={styles.actionButton}>
                <BlurView intensity={30} tint="dark" style={styles.actionBlur}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.actionTextSecondary}>Mark Complete</Text>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleArchive} style={styles.actionButton}>
                <BlurView intensity={30} tint="dark" style={styles.actionBlur}>
                  <Ionicons name="archive" size={20} color={theme.colors.text.secondary} />
                  <Text style={styles.actionTextSecondary}>Archive</Text>
                </BlurView>
              </TouchableOpacity>
            </View>
          )}

          {/* Unarchive Action */}
          {isArchived && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity onPress={handleUnarchive} style={styles.actionButton}>
                <LinearGradient
                  colors={[theme.colors.primary.cyan, theme.colors.primary.aqua]}
                  style={styles.actionGradient}
                >
                  <Ionicons name="arrow-undo" size={20} color="#FFFFFF" />
                  <Text style={styles.actionText}>Unarchive Goal</Text>
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
    paddingVertical: theme.spacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  progressCard: {
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    padding: theme.spacing[6],
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  progressCircle: {
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  progressPercentage: {
    fontSize: theme.fontSize['5xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.cyan,
  },
  progressLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.semibold,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  completedText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  infoCard: {
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  goalTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  goalDescription: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[5],
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing[5],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.cyan,
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.semibold,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.glass.border,
    marginHorizontal: theme.spacing[2],
  },
  progressBarContainer: {
    marginTop: theme.spacing[3],
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  detailsCard: {
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    gap: theme.spacing[3],
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
  },
  detailLabel: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.semibold,
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  statusText: {
    color: theme.colors.primary.cyan,
    textTransform: 'uppercase',
  },
  actionsContainer: {
    gap: theme.spacing[3],
  },
  actionButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[4],
    gap: theme.spacing[2],
  },
  actionBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[4],
    gap: theme.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  actionText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  actionTextSecondary: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.secondary,
  },
});