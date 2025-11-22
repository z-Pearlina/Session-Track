import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAddGoal } from '../stores/useGoalStore';
import { useCategories } from '../stores/useCategoryStore';
import { Goal, GoalPeriod } from '../types';
import { theme } from '../theme/theme';
import { GlassCard } from '../components/GlassCard';
import { RootStackNavigationProp } from '../types';
import { typography, fonts } from '../utils/typography';

export default function CreateGoalScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const addGoal = useAddGoal();
  const categories = useCategories();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetHours, setTargetHours] = useState('');
  const [targetMinutes, setTargetMinutes] = useState('');
  const [period, setPeriod] = useState<GoalPeriod>('weekly');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(getDefaultEndDate('weekly'));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function getDefaultEndDate(selectedPeriod: GoalPeriod): Date {
    const date = new Date();
    switch (selectedPeriod) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'custom':
        date.setDate(date.getDate() + 30);
        break;
    }
    return date;
  }

  const handlePeriodChange = (newPeriod: GoalPeriod) => {
    setPeriod(newPeriod);
    setEndDate(getDefaultEndDate(newPeriod));
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a goal title');
      return false;
    }

    const hours = parseInt(targetHours) || 0;
    const minutes = parseInt(targetMinutes) || 0;
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes === 0) {
      Alert.alert('Validation Error', 'Please set a target time (hours and/or minutes)');
      return false;
    }

    if (endDate <= startDate) {
      Alert.alert('Validation Error', 'End date must be after start date');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const hours = parseInt(targetHours) || 0;
      const minutes = parseInt(targetMinutes) || 0;
      const totalMinutes = hours * 60 + minutes;

      const newGoal: Goal = {
        id: `goal_${Date.now()}`,
        title: title.trim(),
        description: description.trim() || undefined,
        targetMinutes: totalMinutes,
        currentProgress: 0,
        period,
        categoryId: selectedCategoryId,
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        createdAt: new Date().toISOString(),
      };

      await addGoal(newGoal);
      
      Alert.alert(
        'Success! 🎉',
        'Your goal has been created',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            <Ionicons name="close" size={28} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Goal</Text>
          <View style={styles.backButton} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Goal Title */}
            <Text style={styles.label}>Goal Title *</Text>
            <GlassCard style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="e.g., Practice guitar daily"
                placeholderTextColor={theme.colors.text.quaternary}
                value={title}
                onChangeText={setTitle}
                maxLength={50}
              />
            </GlassCard>

            {/* Description */}
            <Text style={styles.label}>Description (Optional)</Text>
            <GlassCard style={styles.inputCard}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What do you want to achieve?"
                placeholderTextColor={theme.colors.text.quaternary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </GlassCard>

            {/* Target Time */}
            <Text style={styles.label}>Target Time *</Text>
            <View style={styles.timeInputRow}>
              <GlassCard style={styles.timeInputCard}>
                <TextInput
                  style={styles.timeInput}
                  placeholder="0"
                  placeholderTextColor={theme.colors.text.quaternary}
                  value={targetHours}
                  onChangeText={setTargetHours}
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
                  value={targetMinutes}
                  onChangeText={setTargetMinutes}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.timeLabel}>minutes</Text>
              </GlassCard>
            </View>

            {/* Period */}
            <Text style={styles.label}>Period *</Text>
            <View style={styles.periodGrid}>
              {(['daily', 'weekly', 'monthly', 'custom'] as GoalPeriod[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => handlePeriodChange(p)}
                  style={styles.periodButton}
                  activeOpacity={0.7}
                >
                  <GlassCard
                    style={[
                      styles.periodCard,
                      period === p && styles.periodCardActive,
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
                      color={period === p ? theme.colors.primary.cyan : theme.colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.periodText,
                        period === p && styles.periodTextActive,
                      ]}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category */}
            <Text style={styles.label}>Category (Optional)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              <TouchableOpacity
                onPress={() => setSelectedCategoryId(undefined)}
                activeOpacity={0.7}
              >
                <GlassCard
                  style={[
                    styles.categoryCard,
                    !selectedCategoryId && styles.categoryCardActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      !selectedCategoryId && styles.categoryTextActive,
                    ]}
                  >
                    All Categories
                  </Text>
                </GlassCard>
              </TouchableOpacity>

              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategoryId(category.id)}
                  activeOpacity={0.7}
                >
                  <GlassCard
                    style={[
                      styles.categoryCard,
                      selectedCategoryId === category.id && styles.categoryCardActive,
                    ]}
                  >
                    <View
                      style={[styles.categoryDot, { backgroundColor: category.color }]}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategoryId === category.id && styles.categoryTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Date Range for Custom Period */}
            {period === 'custom' && (
              <>
                <Text style={styles.label}>Date Range *</Text>
                <View style={styles.dateRow}>
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(true)}
                    style={styles.dateButton}
                    activeOpacity={0.7}
                  >
                    <GlassCard style={styles.dateCard}>
                      <Ionicons name="calendar-outline" size={20} color={theme.colors.text.secondary} />
                      <View style={styles.dateTextContainer}>
                        <Text style={styles.dateLabel}>Start</Text>
                        <Text style={styles.dateValue}>
                          {startDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(true)}
                    style={styles.dateButton}
                    activeOpacity={0.7}
                  >
                    <GlassCard style={styles.dateCard}>
                      <Ionicons name="calendar" size={20} color={theme.colors.primary.cyan} />
                      <View style={styles.dateTextContainer}>
                        <Text style={styles.dateLabel}>End</Text>
                        <Text style={styles.dateValue}>
                          {endDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
              style={styles.submitButton}
            >
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                {isSubmitting ? (
                  <Text style={styles.submitText}>Creating...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={24} color={theme.colors.text.inverse} />
                    <Text style={styles.submitText}>Create Goal</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setStartDate(selectedDate);
              if (selectedDate >= endDate) {
                const newEndDate = new Date(selectedDate);
                newEndDate.setDate(newEndDate.getDate() + 7);
                setEndDate(newEndDate);
              }
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
          minimumDate={startDate}
        />
      )}
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
  headerTitle: {
    ...typography.h2,
    color: theme.colors.text.primary,
    letterSpacing: 0.5,
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
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  categoryTextActive: {
    color: theme.colors.primary.cyan,
  },
  dateRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  dateButton: {
    flex: 1,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
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
  submitButton: {
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    marginTop: theme.spacing[4],
    ...theme.shadows.glowCyan,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[4],
    gap: theme.spacing[2],
  },
  submitText: {
    ...typography.buttonLarge,
    color: theme.colors.text.inverse,
  },
});