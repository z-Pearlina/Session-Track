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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGoalActions } from '../stores/useGoalStore';
import { useCategories } from '../stores/useCategoryStore';
import { Goal, GoalPeriod } from '../types';
import { COLORS } from '../theme/theme';
import { RootStackNavigationProp } from '../types';

export default function CreateGoalScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { addGoal } = useGoalActions();
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
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background.primary, COLORS.background.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={28} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Goal</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Goal Title *</Text>
        <BlurView intensity={30} tint="dark" style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Practice guitar daily"
            placeholderTextColor={COLORS.text.quaternary}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
        </BlurView>

        <Text style={styles.label}>Description (Optional)</Text>
        <BlurView intensity={30} tint="dark" style={styles.inputCard}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What do you want to achieve?"
            placeholderTextColor={COLORS.text.quaternary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </BlurView>

        <Text style={styles.label}>Target Time *</Text>
        <View style={styles.timeInputRow}>
          <BlurView intensity={30} tint="dark" style={styles.timeInputCard}>
            <TextInput
              style={styles.timeInput}
              placeholder="0"
              placeholderTextColor={COLORS.text.quaternary}
              value={targetHours}
              onChangeText={setTargetHours}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.timeLabel}>hours</Text>
          </BlurView>

          <BlurView intensity={30} tint="dark" style={styles.timeInputCard}>
            <TextInput
              style={styles.timeInput}
              placeholder="0"
              placeholderTextColor={COLORS.text.quaternary}
              value={targetMinutes}
              onChangeText={setTargetMinutes}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.timeLabel}>minutes</Text>
          </BlurView>
        </View>

        <Text style={styles.label}>Period *</Text>
        <View style={styles.periodGrid}>
          {(['daily', 'weekly', 'monthly', 'custom'] as GoalPeriod[]).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => handlePeriodChange(p)}
              style={styles.periodButton}
            >
              <BlurView
                intensity={30}
                tint="dark"
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
                  color={period === p ? COLORS.primary.cyan : COLORS.text.secondary}
                />
                <Text
                  style={[
                    styles.periodText,
                    period === p && styles.periodTextActive,
                  ]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Category (Optional)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategoryId(undefined)}
            style={styles.categoryButton}
          >
            <BlurView
              intensity={30}
              tint="dark"
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
            </BlurView>
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategoryId(category.id)}
              style={styles.categoryButton}
            >
              <BlurView
                intensity={30}
                tint="dark"
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
              </BlurView>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {period === 'custom' && (
          <>
            <Text style={styles.label}>Date Range *</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                style={styles.dateButton}
              >
                <BlurView intensity={30} tint="dark" style={styles.dateCard}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.text.secondary} />
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
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                style={styles.dateButton}
              >
                <BlurView intensity={30} tint="dark" style={styles.dateCard}>
                  <Ionicons name="calendar" size={20} color={COLORS.primary.cyan} />
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
                </BlurView>
              </TouchableOpacity>
            </View>
          </>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          <LinearGradient
            colors={[COLORS.primary.cyan, COLORS.primary.aqua]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          >
            {isSubmitting ? (
              <Text style={styles.submitText}>Creating...</Text>
            ) : (
              <>
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                <Text style={styles.submitText}>Create Goal</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.secondary,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    marginBottom: 20,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timeInputCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    padding: 16,
    alignItems: 'center',
  },
  timeInput: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary.cyan,
    textAlign: 'center',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  periodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  periodButton: {
    width: '48%',
  },
  periodCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  periodCardActive: {
    borderColor: COLORS.primary.cyan,
    borderWidth: 2,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  periodTextActive: {
    color: COLORS.primary.cyan,
  },
  categoryScroll: {
    paddingBottom: 20,
    gap: 8,
  },
  categoryButton: {
    marginRight: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    gap: 8,
  },
  categoryCardActive: {
    borderColor: COLORS.primary.cyan,
    borderWidth: 2,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  categoryTextActive: {
    color: COLORS.primary.cyan,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateButton: {
    flex: 1,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    gap: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 12,
    elevation: 4,
    shadowColor: COLORS.primary.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});