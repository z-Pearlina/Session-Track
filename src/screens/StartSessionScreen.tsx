import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
    startTimer();
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleResume = () => {
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

    Alert.alert(
      'Save Session',
      'Would you like to save this session?',
      [
        {
          text: 'Discard',
          style: 'destructive',
          onPress: handleDiscard,
        },
        {
          text: 'Save',
          onPress: handleSave,
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      const endedAt = new Date().toISOString();
      
      const session: Session = {
        id: `session_${Date.now()}`,
        title: title.trim() || 'Untitled Session',
        categoryId: 'default', // We'll add categories in Phase 2
        durationMs: elapsedMs,
        notes: notes.trim(),
        startedAt: startedAt!,
        endedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addSession(session);
      
      Alert.alert(
        'Success!',
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
    handleReset();
  };

  const handleReset = () => {
    stopTimer();
    resetTimer();
    setTitle('');
    setNotes('');
    setStartedAt(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Timer Display */}
          <View style={styles.timerSection}>
            <TimerDisplay elapsedMs={elapsedMs} size="large" />
            
            {isRunning && (
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, isPaused && styles.statusDotPaused]} />
                <Text style={styles.statusText}>
                  {isPaused ? 'Paused' : 'Recording'}
                </Text>
              </View>
            )}
          </View>

          {/* Session Info Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Session Title</Text>
            <TextInput
              style={styles.input}
              placeholder="What are you working on?"
              placeholderTextColor={theme.colors.text.tertiary}
              value={title}
              onChangeText={setTitle}
              editable={!isRunning}
            />

            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any notes about this session..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isRunning}
            />
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsSection}>
            {!isRunning ? (
              <TimerButton
                title="Start Session"
                icon="play"
                onPress={handleStart}
                variant="primary"
                style={styles.primaryButton}
              />
            ) : (
              <View style={styles.runningControls}>
                {!isPaused ? (
                  <TimerButton
                    title="Pause"
                    icon="pause"
                    onPress={handlePause}
                    variant="secondary"
                    style={styles.controlButton}
                  />
                ) : (
                  <TimerButton
                    title="Resume"
                    icon="play"
                    onPress={handleResume}
                    variant="primary"
                    style={styles.controlButton}
                  />
                )}
                
                <TimerButton
                  title="Stop & Save"
                  icon="stop"
                  onPress={handleStop}
                  variant="danger"
                  style={styles.controlButton}
                />
              </View>
            )}
          </View>
        </ScrollView>
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
  },
  timerSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.sm,
  },
  statusDotPaused: {
    backgroundColor: theme.colors.warning,
  },
  statusText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  inputSection: {
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    fontSize: theme.fontSize.md,
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
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  controlsSection: {
    marginTop: 'auto',
    paddingTop: theme.spacing.lg,
  },
  primaryButton: {
    width: '100%',
  },
  runningControls: {
    gap: theme.spacing.md,
  },
  controlButton: {
    width: '100%',
  },
});