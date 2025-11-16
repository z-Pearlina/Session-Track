import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useTimer } from '../hooks/useTimer';
import { useAddSession } from '../stores/useSessionStore';
import { useCategories, useLoadCategories } from '../stores/useCategoryStore';
import { useUpdateGoalProgress } from '../stores/useGoalStore';
import { Session } from '../types';
import { RootStackNavigationProp, StartSessionRouteProp } from '../types';

/**
 * 🎨 UPGRADED START SESSION SCREEN
 * 
 * Features:
 * - ✅ Glowing circular timer with pulsating animation
 * - ✅ Fixed Pause/Resume button logic
 * - ✅ Modern glassmorphism design
 * - ✅ Smooth animations
 */

export default function StartSessionScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<StartSessionRouteProp>();
  const { goalId, categoryId } = route.params || {};
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('work');

  // Pulsating glow animation
  const glowAnim = useRef(new Animated.Value(1)).current;

  const {
    elapsedMs,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer
  } = useTimer();

  const addSession = useAddSession();
  const categories = useCategories();
  const loadCategories = useLoadCategories();
  const updateGoalProgress = useUpdateGoalProgress();

  // Load categories when screen mounts
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Set category from params if provided
  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  // Pulsating glow animation
  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1.3,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(1);
    }
  }, [isRunning, glowAnim]);

  const handleStart = () => {
    const now = new Date().toISOString();
    setStartedAt(now);
    startTimer();
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleResume = () => {
    Keyboard.dismiss();
    resumeTimer();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Timer?',
      'This will reset the timer to 00:00:00. Your session will not be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetTimer },
      ]
    );
  };

  const handleStop = async () => {
    if (elapsedMs < 1000) {
      Alert.alert(
        'Session Too Short',
        'Please track for at least 1 second before saving.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const endedAt = new Date().toISOString();
      const sessionMinutes = Math.floor(elapsedMs / 60000);

      const session: Session = {
        id: `session_${Date.now()}`,
        title: title.trim() || 'Untitled Session',
        categoryId: selectedCategory,
        durationMs: elapsedMs,
        notes: notes.trim(),
        goalId: goalId,
        startedAt: startedAt!,
        endedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addSession(session);

      if (goalId && sessionMinutes > 0) {
        try {
          await updateGoalProgress(goalId, sessionMinutes);
        } catch (error) {
          console.warn('Failed to update goal progress:', error);
        }
      }

      const successMessage = goalId
        ? `Session saved and ${sessionMinutes} minute(s) added to your goal!`
        : 'Session saved successfully';

      Alert.alert(
        'Success! 🎉',
        successMessage,
        [{ text: 'OK', onPress: handleFullReset }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save session. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleFullReset = () => {
    stopTimer();
    resetTimer();
    setTitle('');
    setNotes('');
    setStartedAt(null);
    setSelectedCategory('work');
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleOpenCategoryManager = () => {
    navigation.navigate('CategoryManager');
  };

  return (
    <LinearGradient
      colors={theme.gradients.backgroundAnimated}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Focus Session</Text>
          <View style={styles.headerButton} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* ✨ NEW: Glowing Circular Timer */}
              <View style={styles.timerContainer}>
                {/* Pulsating Glow Background */}
                <Animated.View
                  style={[
                    styles.glowBackground,
                    {
                      transform: [{ scale: glowAnim }],
                      opacity: isRunning ? 0.3 : 0.1,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[theme.colors.primary.cyan, theme.colors.primary.aqua]}
                    style={styles.glowGradient}
                  />
                </Animated.View>

                {/* Circular Timer */}
                <BlurView intensity={30} tint="dark" style={styles.timerCircle}>
                  <View style={styles.timerInner}>
                    <Text style={styles.timerText}>{formatTime(elapsedMs)}</Text>
                    
                    {/* Status Badge */}
                    {isPaused && (
                      <View style={styles.statusBadge}>
                        <Ionicons name="pause" size={12} color={theme.colors.warning} />
                        <Text style={styles.statusText}>Paused</Text>
                      </View>
                    )}
                    {isRunning && !isPaused && (
                      <View style={styles.statusBadge}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.statusText}>Recording</Text>
                      </View>
                    )}
                  </View>
                </BlurView>
              </View>

              {/* Input Fields */}
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Session Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="What are you working on?"
                    placeholderTextColor={theme.colors.text.quaternary}
                    value={title}
                    onChangeText={setTitle}
                    editable={!isRunning}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity onPress={handleOpenCategoryManager}>
                      <Text style={styles.manageLink}>Manage</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryChipsContainer}>
                      {categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.categoryChip,
                            selectedCategory === category.id && styles.categoryChipActive,
                          ]}
                          onPress={() => setSelectedCategory(category.id)}
                          disabled={isRunning}
                        >
                          <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                          <Text
                            style={[
                              styles.categoryChipText,
                              selectedCategory === category.id && styles.categoryChipTextActive,
                            ]}
                          >
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.notesInput]}
                    placeholder="Add any notes or details..."
                    placeholderTextColor={theme.colors.text.quaternary}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* ✅ FIXED: Timer Controls with proper pause/resume logic */}
              <View style={styles.controlsContainer}>
                {/* Initial State: Not Started */}
                {!isRunning && !isPaused && (
                  <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
                    <LinearGradient
                      colors={[theme.colors.primary.cyan, theme.colors.primary.aqua]}
                      style={styles.buttonGradient}
                    >
                      <Ionicons name="play-circle" size={24} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Start Session</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {/* Running State: Show Pause and Stop */}
                {isRunning && !isPaused && (
                  <View style={styles.activeControls}>
                    <TouchableOpacity 
                      style={[styles.secondaryButton, styles.flexButton]} 
                      onPress={handlePause}
                    >
                      <Ionicons name="pause" size={24} color={theme.colors.warning} />
                      <Text style={[styles.secondaryButtonText, { color: theme.colors.warning }]}>
                        Pause
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.primaryButton, styles.flexButton]} 
                      onPress={handleStop}
                    >
                      <LinearGradient
                        colors={[theme.colors.success, '#27AE60']}
                        style={styles.buttonGradient}
                      >
                        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Finish</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Paused State: Show Reset, Resume, and Stop */}
                {isPaused && (
                  <View style={styles.pausedControls}>
                    <TouchableOpacity 
                      style={styles.dangerButton} 
                      onPress={handleReset}
                    >
                      <Ionicons name="refresh" size={20} color={theme.colors.danger} />
                      <Text style={[styles.secondaryButtonText, { color: theme.colors.danger }]}>
                        Reset
                      </Text>
                    </TouchableOpacity>
                    
                    <View style={styles.pausedMainButtons}>
                      <TouchableOpacity 
                        style={[styles.secondaryButton, styles.flexButton]} 
                        onPress={handleResume}
                      >
                        <Ionicons name="play" size={24} color={theme.colors.primary.cyan} />
                        <Text style={styles.secondaryButtonText}>Resume</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.primaryButton, styles.flexButton]} 
                        onPress={handleStop}
                      >
                        <LinearGradient
                          colors={[theme.colors.success, '#27AE60']}
                          style={styles.buttonGradient}
                        >
                          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                          <Text style={styles.buttonText}>Finish</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Helpful Tip */}
              {!isRunning && !isPaused && (
                <View style={styles.tipContainer}>
                  <Ionicons name="bulb-outline" size={20} color={theme.colors.primary.cyan} />
                  <Text style={styles.tipText}>
                    Tip: Start your timer and stay focused. We'll track your progress!
                  </Text>
                </View>
              )}
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const TIMER_SIZE = 256;

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
    paddingVertical: theme.spacing[3],
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  
  // ✨ NEW: Glowing Circular Timer Styles
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing[8],
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    width: TIMER_SIZE + 40,
    height: TIMER_SIZE + 40,
    borderRadius: (TIMER_SIZE + 40) / 2,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (TIMER_SIZE + 40) / 2,
  },
  timerCircle: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: theme.colors.glass.border,
  },
  timerInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  timerText: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1.5],
    marginTop: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
    backgroundColor: theme.colors.glass.background,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
  },
  
  formContainer: {
    gap: theme.spacing[5],
  },
  inputGroup: {
    gap: theme.spacing[2],
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.glass.background,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    fontSize: theme.fontSize.base,
    color: theme.colors.text.primary,
  },
  notesInput: {
    minHeight: 100,
    paddingTop: theme.spacing[4],
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manageLink: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary.cyan,
  },
  categoryChipsContainer: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.glass.background,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.full,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.glass.medium,
    borderColor: theme.colors.primary.cyan,
    borderWidth: 2,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  categoryChipTextActive: {
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.bold,
  },
  
  // ✅ FIXED: Button Controls
  controlsContainer: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[3],
  },
  primaryButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[4],
  },
  buttonText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.glass.background,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.xl,
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.glass.background,
    borderWidth: 1,
    borderColor: theme.colors.danger + '40',
    borderRadius: theme.borderRadius.xl,
  },
  activeControls: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  pausedControls: {
    gap: theme.spacing[3],
  },
  pausedMainButtons: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  flexButton: {
    flex: 1,
  },
  
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginTop: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.glass.background,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.xl,
  },
  tipText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});