import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useTimer } from '../hooks/useTimer';
import { useSessionStore } from '../stores/useSessionStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { Session } from '../types';
import { RootStackNavigationProp } from '../types';

export default function StartSessionScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('work');
  
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
  
  const { addSession } = useSessionStore();
  const { categories, loadCategories } = useCategoryStore();

  // Load categories when screen mounts
  useEffect(() => {
    loadCategories();
  }, []);

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
    resetTimer();
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
      
      const session: Session = {
        id: `session_${Date.now()}`,
        title: title.trim() || 'Untitled Session',
        categoryId: selectedCategory,
        durationMs: elapsedMs,
        notes: notes.trim(),
        startedAt: startedAt!,
        endedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addSession(session);
      
      Alert.alert(
        'Success! 🎉',
        'Session saved successfully',
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
          <Text style={styles.headerTitle}>Start New Session</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Timer Display with Glow */}
              <View style={styles.timerContainer}>
                {/* Animated glow ring */}
                <View style={styles.glowRing} />
                
                {/* Timer circle */}
                <View style={styles.timerCircle}>
                  <Text style={styles.timerText}>{formatTime(elapsedMs)}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleReset}
                >
                  <Ionicons name="refresh" size={28} color={theme.colors.text.secondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.mainButton, isRunning && styles.stopButton]}
                  onPress={isRunning ? handleStop : handleStart}
                >
                  <Text style={styles.mainButtonText}>
                    {isRunning ? 'Stop' : 'Start'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={isPaused ? handleResume : handlePause}
                  disabled={!isRunning}
                >
                  <Ionicons 
                    name={isPaused ? 'play' : 'pause'} 
                    size={28} 
                    color={isRunning ? theme.colors.text.secondary : theme.colors.text.quaternary} 
                  />
                </TouchableOpacity>
              </View>

              {/* Input Section */}
              <View style={styles.inputSection}>
                {/* Session Title */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Session Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="E.g., Design Sprint"
                    placeholderTextColor={theme.colors.text.quaternary}
                    value={title}
                    onChangeText={setTitle}
                    returnKeyType="next"
                  />
                </View>

                {/* Optional Notes */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Optional Notes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add some details about your session"
                    placeholderTextColor={theme.colors.text.quaternary}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Category Selector */}
                <View style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.inputLabel}>Select a Category</Text>
                    <TouchableOpacity 
                      style={styles.manageCategoriesButton}
                      onPress={handleOpenCategoryManager}
                    >
                      <Ionicons name="settings" size={16} color={theme.colors.primary.cyan} />
                      <Text style={styles.manageCategoriesText}>Manage</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesScroll}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryButton,
                          selectedCategory === category.id && styles.categoryButtonActive,
                          { borderColor: category.color + '40' },
                          selectedCategory === category.id && { 
                            backgroundColor: category.color,
                            borderColor: category.color 
                          }
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                      >
                        <Ionicons
                          name={category.icon as any}
                          size={16}
                          color={
                            selectedCategory === category.id
                              ? theme.colors.text.inverse
                              : category.color
                          }
                        />
                        <Text
                          style={[
                            styles.categoryButtonText,
                            selectedCategory === category.id && styles.categoryButtonTextActive,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Bottom padding */}
              <View style={{ height: 100 }} />
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[8],
    paddingBottom: theme.spacing[6],
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[12],
    height: 280,
  },
  glowRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: theme.colors.primary.cyan + '10',
    ...theme.shadows.glowEnergyRing,
  },
  timerCircle: {
    width: 256,
    height: 256,
    borderRadius: 128,
    borderWidth: 4,
    borderColor: theme.colors.background.secondary,
    backgroundColor: theme.colors.background.primary + '80',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  timerText: {
    fontSize: 56,
    fontWeight: theme.fontWeight.black,
    color: theme.colors.text.primary,
    letterSpacing: -2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[10],
  },
  iconButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  mainButton: {
    minWidth: 150,
    paddingVertical: theme.spacing[5],
    paddingHorizontal: theme.spacing[8],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glowCyan,
  },
  stopButton: {
    backgroundColor: theme.colors.danger,
  },
  mainButtonText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  inputSection: {
    gap: theme.spacing[6],
  },
  inputGroup: {
    gap: theme.spacing[2],
  },
  inputLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  input: {
    height: 56,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing[4],
    fontSize: theme.fontSize.base,
    color: theme.colors.text.primary,
  },
  textArea: {
    height: 112,
    paddingTop: theme.spacing[4],
    textAlignVertical: 'top',
  },
  categorySection: {
    gap: theme.spacing[3],
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manageCategoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  manageCategoriesText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary.cyan,
  },
  categoriesScroll: {
    gap: theme.spacing[3],
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1.5],
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  categoryButtonActive: {
    borderWidth: 2,
  },
  categoryButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  categoryButtonTextActive: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
});