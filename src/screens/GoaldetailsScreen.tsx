import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGoalStore } from '../stores/useGoalStore';
import { useCategoryById, useCategories } from '../stores/useCategoryStore';
import { theme } from '../theme/theme';
import { GoalDetailsRouteProp, RootStackNavigationProp, GoalPeriod } from '../types';
import { typography, fonts } from '../utils/typography';
import { GlassCard } from '../components/GlassCard';

export default function GoalDetailsScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<GoalDetailsRouteProp>();
  const { goalId } = route.params;

  const { getGoalById, completeGoal, archiveGoal, unarchiveGoal, deleteGoal, updateGoal } = useGoalStore();
  const goal = getGoalById(goalId);
  const category = useCategoryById(goal?.categoryId || '');
  const categories = useCategories();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedTargetHours, setEditedTargetHours] = useState('');
  const [editedTargetMinutes, setEditedTargetMinutes] = useState('');
  const [editedCategoryId, setEditedCategoryId] = useState<string | undefined>(undefined);
  const [editedPeriod, setEditedPeriod] = useState<GoalPeriod>('weekly');
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [editedEndDate, setEditedEndDate] = useState(new Date());

  useEffect(() => {
    if (!goal) {
      Alert.alert('Error', 'Goal not found', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else if (isEditing && goal) {
      setEditedTitle(goal.title);
      setEditedDescription(goal.description || '');
      const hours = Math.floor(goal.targetMinutes / 60);
      const minutes = goal.targetMinutes % 60;
      setEditedTargetHours(hours > 0 ? hours.toString() : '');
      setEditedTargetMinutes(minutes > 0 ? minutes.toString() : '');
      setEditedCategoryId(goal.categoryId);
      setEditedPeriod(goal.period);
      setEditedEndDate(new Date(goal.endDate));
    }
  }, [goal, navigation, isEditing]);

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

  const handleSaveEdit = async () => {
    if (!editedTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a goal title');
      return;
    }

    const hours = parseInt(editedTargetHours) || 0;
    const minutes = parseInt(editedTargetMinutes) || 0;
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes === 0) {
      Alert.alert('Validation Error', 'Please set a target time (hours and/or minutes)');
      return;
    }

    try {
      await updateGoal(goalId, {
        title: editedTitle.trim(),
        description: editedDescription.trim() || undefined,
        targetMinutes: totalMinutes,
        categoryId: editedCategoryId,
        period: editedPeriod,
        endDate: editedEndDate.toISOString(),
      });
      setIsEditing(false);
      Alert.alert('Success', 'Goal updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update goal. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
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

  if (isEditing) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={theme.gradients.backgroundAnimated}
          style={styles.gradient}
        />

        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancelEdit} style={styles.backButton}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Goal</Text>
            <TouchableOpacity onPress={handleSaveEdit} style={styles.deleteButton}>
              <Ionicons name="checkmark" size={28} color={theme.colors.success} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
              <Text style={styles.label}>Goal Title *</Text>
              <GlassCard style={styles.inputCard}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Practice guitar daily"
                  placeholderTextColor={theme.colors.text.quaternary}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  maxLength={50}
                />
              </GlassCard>

              <Text style={styles.label}>Description (Optional)</Text>
              <GlassCard style={styles.inputCard}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="What do you want to achieve?"
                  placeholderTextColor={theme.colors.text.quaternary}
                  value={editedDescription}
                  onChangeText={setEditedDescription}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
              </GlassCard>

              <Text style={styles.label}>Target Time *</Text>
              <View style={styles.timeInputRow}>
                <GlassCard style={styles.timeInputCard}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="0"
                    placeholderTextColor={theme.colors.text.quaternary}
                    value={editedTargetHours}
                    onChangeText={setEditedTargetHours}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                  <Text style={styles.timeLabel}>hours</Text>
                </GlassCard>

                <GlassCard style={styles.timeInputCard}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="0"
                    placeholderTextColor={theme.colors.text.quaternary}
                    value={editedTargetMinutes}
                    onChangeText={setEditedTargetMinutes}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={styles.timeLabel}>minutes</Text>
                </GlassCard>
              </View>

              <Text style={styles.label}>Period *</Text>
              <View style={styles.periodGrid}>
                {(['daily', 'weekly', 'monthly', 'custom'] as GoalPeriod[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setEditedPeriod(p)}
                    style={styles.periodButton}
                    activeOpacity={0.7}
                  >
                    <GlassCard
                      style={[
                        styles.periodCard,
                        editedPeriod === p && styles.periodCardActive,
                      ]}
                    >
                      <Ionicons
                        name={
                          p === 'daily'
                            ? 'today'
                            : p === 'weekly'
                            ? 'calendar'
                            : p === 'monthly'
                            ? 'calendar-outline'
                            : 'time'
                        }
                        size={24}
                        color={editedPeriod === p ? theme.colors.primary.cyan : theme.colors.text.secondary}
                      />
                      <Text
                        style={[
                          styles.periodText,
                          editedPeriod === p && styles.periodTextActive,
                        ]}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Category (Optional)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                <TouchableOpacity onPress={() => setEditedCategoryId(undefined)}>
                  <GlassCard
                    style={[
                      styles.categoryCard,
                      !editedCategoryId && styles.categoryCardActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        !editedCategoryId && styles.categoryTextActive,
                      ]}
                    >
                      None
                    </Text>
                  </GlassCard>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setEditedCategoryId(cat.id)}
                  >
                    <GlassCard
                      style={[
                        styles.categoryCard,
                        editedCategoryId === cat.id && styles.categoryCardActive,
                      ]}
                    >
                      <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                      <Text
                        style={[
                          styles.categoryText,
                          editedCategoryId === cat.id && styles.categoryTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>End Date *</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                <GlassCard style={styles.dateCard}>
                  <Ionicons name="calendar" size={20} color={theme.colors.text.secondary} />
                  <View style={styles.dateTextContainer}>
                    <Text style={styles.dateLabel}>End Date</Text>
                    <Text style={styles.dateValue}>
                      {editedEndDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {showEndDatePicker && (
          <DateTimePicker
            value={editedEndDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setEditedEndDate(selectedDate);
              }
            }}
            minimumDate={new Date()}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Goal Details</Text>
          <View style={styles.headerActions}>
            {!isCompleted && !isArchived && (
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.iconButton}>
                <Ionicons name="pencil" size={20} color={theme.colors.primary.cyan} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
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
                  {formatMinutes(Math.max(0, goal.targetMinutes - goal.currentProgress))}
                </Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
            </View>

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  iconButton: {
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
    ...typography.h3,
    color: theme.colors.text.primary,
  },
  keyboardView: {
    flex: 1,
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
    fontFamily: fonts.bold,
    fontSize: theme.fontSize['5xl'],
    color: theme.colors.primary.cyan,
  },
  progressLabel: {
    ...typography.bodySmall,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.semibold,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  completedText: {
    ...typography.bodyMedium,
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
    ...typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  goalDescription: {
    ...typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[5],
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
    ...typography.h4,
    color: theme.colors.primary.cyan,
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    ...typography.caption,
    color: theme.colors.text.secondary,
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
    ...typography.bodySmall,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.semibold,
  },
  detailValue: {
    ...typography.bodySmall,
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
    ...typography.buttonLarge,
    color: '#FFFFFF',
  },
  actionTextSecondary: {
    ...typography.buttonLarge,
    color: theme.colors.text.secondary,
  },
  label: {
    ...typography.caption,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
    marginLeft: theme.spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputCard: {
    marginBottom: theme.spacing[4],
  },
  input: {
    ...typography.body,
    padding: theme.spacing[4],
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeInputRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  timeInputCard: {
    flex: 1,
    padding: theme.spacing[4],
    alignItems: 'center',
  },
  timeInput: {
    fontFamily: fonts.bold,
    fontSize: theme.fontSize['3xl'],
    color: theme.colors.primary.cyan,
    textAlign: 'center',
    marginBottom: theme.spacing[1],
  },
  timeLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.semibold,
  },
  periodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  periodButton: {
    width: '48%',
  },
  periodCard: {
    padding: theme.spacing[4],
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  periodCardActive: {
    borderColor: theme.colors.primary.cyan,
    borderWidth: 2,
  },
  periodText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  periodTextActive: {
    color: theme.colors.primary.cyan,
  },
  categoryScroll: {
    paddingBottom: theme.spacing[4],
    gap: theme.spacing[2],
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    marginRight: theme.spacing[2],
    gap: theme.spacing[2],
  },
  categoryCardActive: {
    borderColor: theme.colors.primary.cyan,
    borderWidth: 2,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  categoryTextActive: {
    color: theme.colors.primary.cyan,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing[0.5],
  },
  dateValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});