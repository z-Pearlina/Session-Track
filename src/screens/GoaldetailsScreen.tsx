import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useGoalStore } from '../stores/useGoalStore';
import { useCategoryById } from '../stores/useCategoryStore';
import { COLORS } from '../theme/theme';
import { GoalDetailsRouteProp } from '../types';

export default function GoalDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<GoalDetailsRouteProp>();
  const { goalId } = route.params;

  const { getGoalById, completeGoal, archiveGoal, deleteGoal } = useGoalStore();
  const goal = getGoalById(goalId);
  const category = useCategoryById(goal?.categoryId || '');

  useEffect(() => {
    if (!goal) {
      Alert.alert('Error', 'Goal not found', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [goal]);

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

  const isCompleted = goal.status === 'completed';
  const isArchived = goal.status === 'archived';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background.primary, COLORS.background.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <BlurView intensity={30} tint="dark" style={styles.progressCard}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              <Text style={styles.completedText}>Completed!</Text>
            </View>
          )}
        </BlurView>

        <BlurView intensity={30} tint="dark" style={styles.infoCard}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          {goal.description && (
            <Text style={styles.goalDescription}>{goal.description}</Text>
          )}
          
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
                {formatMinutes(goal.targetMinutes - goal.currentProgress)}
              </Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <LinearGradient
                colors={isCompleted ? [COLORS.success, COLORS.success] : [COLORS.primary.cyan, COLORS.primary.aqua]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
              />
            </View>
          </View>
        </BlurView>

        <BlurView intensity={30} tint="dark" style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.text.secondary} />
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
            <Ionicons name="calendar" size={20} color={COLORS.text.secondary} />
            <Text style={styles.detailLabel}>Timeline</Text>
            <Text style={styles.detailValue}>
              {new Date(goal.startDate).toLocaleDateString()} → {new Date(goal.endDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="flag" size={20} color={COLORS.text.secondary} />
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, styles.statusText]}>{goal.status.toUpperCase()}</Text>
          </View>
        </BlurView>

        {!isCompleted && !isArchived && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={handleComplete} style={styles.actionButton}>
              <LinearGradient
                colors={[COLORS.success, '#27AE60']}
                style={styles.actionGradient}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.actionText}>Mark Complete</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleArchive} style={styles.actionButton}>
              <BlurView intensity={30} tint="dark" style={styles.actionBlur}>
                <Ionicons name="archive" size={20} color={COLORS.text.secondary} />
                <Text style={styles.actionTextSecondary}>Archive</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  deleteButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.text.primary },
  scrollView: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  progressCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  progressCircle: { alignItems: 'center', marginBottom: 16 },
  progressPercentage: { fontSize: 48, fontWeight: '700', color: COLORS.primary.cyan },
  progressLabel: { fontSize: 14, color: COLORS.text.secondary, fontWeight: '600' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  completedText: { fontSize: 16, fontWeight: '700', color: COLORS.success },
  infoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    padding: 20,
    marginBottom: 16,
  },
  goalTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text.primary, marginBottom: 8 },
  goalDescription: { fontSize: 16, color: COLORS.text.secondary, marginBottom: 20, lineHeight: 22 },
  statsRow: { flexDirection: 'row', marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.primary.cyan, marginBottom: 4 },
  statLabel: { fontSize: 12, color: COLORS.text.secondary, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: COLORS.glass.border, marginHorizontal: 8 },
  progressBarContainer: { marginTop: 12 },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.glass.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  detailsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  categoryDot: { width: 12, height: 12, borderRadius: 6 },
  detailLabel: { flex: 1, fontSize: 14, color: COLORS.text.secondary, fontWeight: '600' },
  detailValue: { fontSize: 14, color: COLORS.text.primary, fontWeight: '600' },
  statusText: { color: COLORS.primary.cyan, textTransform: 'uppercase' },
  actionsContainer: { gap: 12 },
  actionButton: { borderRadius: 16, overflow: 'hidden' },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  actionBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  actionText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  actionTextSecondary: { fontSize: 16, fontWeight: '700', color: COLORS.text.secondary },
});