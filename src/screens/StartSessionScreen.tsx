import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { useTimer } from '../hooks/useTimer';
import { TimerDisplay } from '../components/TimerDisplay';
import { TimerButton } from '../components/TimerButton';
import { useSessionStore } from '../stores/useSessionStore';
import { Session } from '../types';

export default function StartSessionScreen() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [showInputs, setShowInputs] = useState(false);
  
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

  const handleStart = () => {
    const now = new Date().toISOString();
    setStartedAt(now);
    setShowInputs(false);
    startTimer();
  };

  const handlePause = () => {
    pauseTimer();
    setShowInputs(true);
  };

  const handleResume = () => {
    Keyboard.dismiss();
    setShowInputs(false);
    resumeTimer();
  };

  const handleStop = () => {
    if (elapsedMs < 1000) {
      Alert.alert(
        'Session Too Short',
        'Please track for at least 1 second before saving.',
        [{ text: 'OK' }]
      );
      return;
    }

    stopTimer();
    setShowInputs(true);
  };

  const handleSave = async () => {
    try {
      const endedAt = new Date().toISOString();
      
      const session: Session = {
        id: `session_${Date.now()}`,
        title: title.trim() || 'Untitled Session',
        categoryId: 'default',
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
        [{ text: 'OK', onPress: handleReset }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save session. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Session?',
      'Are you sure you want to discard this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: handleReset 
        },
      ]
    );
  };

  const handleReset = () => {
    stopTimer();
    resetTimer();
    setTitle('');
    setNotes('');
    setStartedAt(null);
    setShowInputs(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Timer Display */}
            <View style={styles.timerSection}>
              <TimerDisplay elapsedMs={elapsedMs} size="large" />
              
              {isRunning && !isPaused && (
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Recording...</Text>
                </View>
              )}

              {isPaused && (
                <View style={[styles.statusBadge, styles.pausedBadge]}>
                  <View style={styles.statusDotPaused} />
                  <Text style={styles.statusText}>Paused</Text>
                </View>
              )}
            </View>

            {/* Input Fields - Show when paused or stopped */}
            {showInputs && (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Session Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What did you work on?"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={title}
                  onChangeText={setTitle}
                  returnKeyType="next"
                />

                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add any notes..."
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="done"
                  blurOnSubmit
                />
              </View>
            )}

            {/* Hint text when not running */}
            {!isRunning && !showInputs && (
              <View style={styles.hintSection}>
                <Text style={styles.hintText}>
                  Ready to track your session?
                </Text>
                <Text style={styles.hintSubtext}>
                  You can add title and notes when you pause or finish
                </Text>
              </View>
            )}

            {/* Extra space to push buttons up when keyboard is visible */}
            <View style={styles.spacer} />

            {/* Control Buttons */}
            <View style={styles.controlsSection}>
              {/* Not Started */}
              {!isRunning && !showInputs && (
                <TimerButton
                  title="Start Session"
                  icon="play-circle"
                  onPress={handleStart}
                  variant="primary"
                  style={styles.fullButton}
                />
              )}

              {/* Running (not paused) */}
              {isRunning && !isPaused && (
                <View style={styles.buttonRow}>
                  <TimerButton
                    title="Pause"
                    icon="pause"
                    onPress={handlePause}
                    variant="secondary"
                    style={styles.halfButton}
                  />
                  <TimerButton
                    title="Stop"
                    icon="stop-circle"
                    onPress={handleStop}
                    variant="danger"
                    style={styles.halfButton}
                  />
                </View>
              )}

              {/* Paused */}
              {isPaused && (
                <View style={styles.buttonColumn}>
                  <TimerButton
                    title="Resume"
                    icon="play"
                    onPress={handleResume}
                    variant="primary"
                    style={styles.fullButton}
                  />
                  <View style={styles.buttonRow}>
                    <TimerButton
                      title="Stop"
                      icon="stop-circle"
                      onPress={handleStop}
                      variant="danger"
                      style={styles.halfButton}
                    />
                    <TimerButton
                      title="Discard"
                      icon="trash"
                      onPress={handleDiscard}
                      variant="secondary"
                      style={styles.halfButton}
                    />
                  </View>
                </View>
              )}

              {/* Stopped (ready to save) */}
              {!isRunning && showInputs && (
                <View style={styles.buttonColumn}>
                  <TimerButton
                    title="Save Session"
                    icon="checkmark-circle"
                    onPress={handleSave}
                    variant="primary"
                    style={styles.fullButton}
                  />
                  <TimerButton
                    title="Discard"
                    icon="close-circle"
                    onPress={handleDiscard}
                    variant="secondary"
                    style={styles.fullButton}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl, // Extra padding at bottom
  },
  timerSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  pausedBadge: {
    borderColor: theme.colors.warning,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.sm,
  },
  statusDotPaused: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.warning,
    marginRight: theme.spacing.sm,
  },
  statusText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  hintSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  hintText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  hintSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  inputSection: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    maxHeight: 120,
    paddingTop: theme.spacing.md,
  },
  spacer: {
    flex: 1,
    minHeight: 20, 
  },
  controlsSection: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl, 
  },
  fullButton: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  buttonColumn: {
    flexDirection: 'column',
  },
  halfButton: {
    flex: 1,
  },
});