import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { typography, fonts } from '../utils/typography';
import { GlassCard } from '../components/GlassCard';
import {
  useNotificationPreferences,
  useLoadNotificationPreferences,
  useUpdateNotificationPreference,
  useSendTestNotification,
  useNotificationsLoading,
} from '../stores/useNotificationStore';
import { NotificationService, NotificationPreferences } from '../services/NotificationService';

const InfoCard = React.memo(() => (
  <GlassCard style={styles.infoCard}>
    <View style={styles.infoContent}>
      <Ionicons name="information-circle" size={24} color={theme.colors.primary.cyan} />
      <Text style={styles.infoText}>
        Stay on track with smart reminders and progress updates
      </Text>
    </View>
  </GlassCard>
));

const SectionTitle = React.memo<{ title: string }>(({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
));

const SettingRow = React.memo<{
  icon: string;
  color: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}>(({ icon, color, label, description, value, onToggle, disabled }) => (
  <View style={styles.settingRow}>
    <View style={styles.settingLeft}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
      thumbColor={theme.colors.background.primary}
      ios_backgroundColor={theme.colors.glass.border}
    />
  </View>
));

const Divider = React.memo(() => <View style={styles.divider} />);

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const preferences = useNotificationPreferences();
  const loadPreferences = useLoadNotificationPreferences();
  const updatePreference = useUpdateNotificationPreference();
  const sendTestNotification = useSendTestNotification();
  const isLoading = useNotificationsLoading();

  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [tempTime, setTempTime] = React.useState(new Date());

  useEffect(() => {
    loadPreferences();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const status = await NotificationService.getPermissionStatus();
    if (status !== 'granted') {
      Alert.alert(
        'Notification Permissions',
        'Enable notifications to stay updated on your progress.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Enable',
            onPress: async () => {
              const granted = await NotificationService.requestPermissions();
              if (!granted) {
                Alert.alert('Permission Denied', 'You can enable notifications later in Settings.');
              }
            }
          },
        ]
      );
    }
  };

  const handleToggle = useCallback(async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    await updatePreference(key, value);
  }, [preferences, updatePreference]);

  const handleTimeChange = useCallback((event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      setTempTime(selectedDate);
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      updatePreference('dailyReminderTime', timeString);
    }
  }, [updatePreference]);

  const handleTestNotification = useCallback(async () => {
    try {
      await sendTestNotification();
      Alert.alert('Success', 'Test notification sent! Check your notification tray.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  }, [sendTestNotification]);

  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);

  const toggleHandlers = useMemo(() => ({
    enabled: (value: boolean) => handleToggle('enabled', value),
    sessionCompletion: (value: boolean) => handleToggle('sessionCompletionEnabled', value),
    sessionReminder: (value: boolean) => handleToggle('sessionReminderEnabled', value),
    goalCompletion: (value: boolean) => handleToggle('goalCompletionEnabled', value),
    goalProgress: (value: boolean) => handleToggle('goalProgressEnabled', value),
    goalReminder: (value: boolean) => handleToggle('goalReminderEnabled', value),
    streakReminder: (value: boolean) => handleToggle('streakReminderEnabled', value),
    achievement: (value: boolean) => handleToggle('achievementNotificationsEnabled', value),
    dailyReminder: (value: boolean) => handleToggle('dailyReminderEnabled', value),
    sound: (value: boolean) => handleToggle('soundEnabled', value),
    vibration: (value: boolean) => handleToggle('vibrationEnabled', value),
  }), [handleToggle]);

  if (!preferences) {
    return (
      <View style={styles.gradient}>
        <LinearGradient
          colors={theme.gradients.backgroundAnimated}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.gradient}>
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="always"
          keyboardShouldPersistTaps="handled"
        >
          <InfoCard />

          <SectionTitle title="General" />
          <GlassCard style={styles.card}>
            <SettingRow
              icon="notifications"
              color={theme.colors.primary.cyan}
              label="Enable Notifications"
              description="Master switch for all notifications"
              value={preferences.enabled}
              onToggle={toggleHandlers.enabled}
            />
          </GlassCard>

          <SectionTitle title="Sessions" />
          <GlassCard style={styles.card}>
            <SettingRow
              icon="time"
              color="#10B981"
              label="Session Completion"
              description="Notify when you complete a session"
              value={preferences.sessionCompletionEnabled}
              onToggle={toggleHandlers.sessionCompletion}
              disabled={!preferences.enabled}
            />
            <Divider />
            <SettingRow
              icon="alarm"
              color="#10B981"
              label="Session Reminders"
              description="Remind you to track sessions"
              value={preferences.sessionReminderEnabled}
              onToggle={toggleHandlers.sessionReminder}
              disabled={!preferences.enabled}
            />
          </GlassCard>

          <SectionTitle title="Goals" />
          <GlassCard style={styles.card}>
            <SettingRow
              icon="flag"
              color="#F59E0B"
              label="Goal Completion"
              description="Notify when you complete a goal"
              value={preferences.goalCompletionEnabled}
              onToggle={toggleHandlers.goalCompletion}
              disabled={!preferences.enabled}
            />
            <Divider />
            <SettingRow
              icon="trending-up"
              color="#F59E0B"
              label="Goal Progress"
              description="Notify at 80% and 90% progress"
              value={preferences.goalProgressEnabled}
              onToggle={toggleHandlers.goalProgress}
              disabled={!preferences.enabled}
            />
            <Divider />
            <SettingRow
              icon="calendar"
              color="#F59E0B"
              label="Goal Reminders"
              description="Remind before deadline (1 day)"
              value={preferences.goalReminderEnabled}
              onToggle={toggleHandlers.goalReminder}
              disabled={!preferences.enabled}
            />
          </GlassCard>

          <SectionTitle title="Streaks" />
          <GlassCard style={styles.card}>
            <SettingRow
              icon="flash"
              color="#8B5CF6"
              label="Streak Reminders"
              description="Daily reminders to maintain your streak"
              value={preferences.streakReminderEnabled}
              onToggle={toggleHandlers.streakReminder}
              disabled={!preferences.enabled}
            />
          </GlassCard>

          <SectionTitle title="Achievements" />
          <GlassCard style={styles.card}>
            <SettingRow
              icon="trophy"
              color="#9B59B6"
              label="Achievement Unlocks"
              description="Notify when you unlock achievements"
              value={preferences.achievementNotificationsEnabled}
              onToggle={toggleHandlers.achievement}
              disabled={!preferences.enabled}
            />
          </GlassCard>

          <SectionTitle title="Daily Reminder" />
          <GlassCard style={styles.card}>
            <SettingRow
              icon="alarm"
              color="#FFD700"
              label="Enable Daily Reminder"
              description="Daily reminder to track your sessions"
              value={preferences.dailyReminderEnabled}
              onToggle={toggleHandlers.dailyReminder}
              disabled={!preferences.enabled}
            />

            {preferences.dailyReminderEnabled && (
              <>
                <Divider />
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(true)}
                  disabled={!preferences.enabled}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: '#FFD700' + '20' }]}>
                      <Ionicons name="time-outline" size={24} color="#FFD700" />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Reminder Time</Text>
                      <Text style={styles.timeText}>{preferences.dailyReminderTime}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              </>
            )}
          </GlassCard>

          {showTimePicker && (
            <DateTimePicker
              value={tempTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <SectionTitle title="Sound & Vibration" />
          <GlassCard style={styles.card}>
            <SettingRow
              icon="volume-high"
              color={theme.colors.text.tertiary}
              label="Sound"
              description="Play sound with notifications"
              value={preferences.soundEnabled}
              onToggle={toggleHandlers.sound}
              disabled={!preferences.enabled}
            />
            <Divider />
            <SettingRow
              icon="phone-portrait"
              color={theme.colors.text.tertiary}
              label="Vibration"
              description="Vibrate device with notifications"
              value={preferences.vibrationEnabled}
              onToggle={toggleHandlers.vibration}
              disabled={!preferences.enabled}
            />
          </GlassCard>

          <TouchableOpacity
            style={[styles.testButton, !preferences.enabled && styles.testButtonDisabled]}
            onPress={handleTestNotification}
            disabled={!preferences.enabled}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={preferences.enabled 
                ? [theme.colors.primary.cyan, theme.colors.primary.aqua] 
                : [theme.colors.glass.border, theme.colors.glass.border]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.testButtonGradient}
            >
              <Ionicons name="flask" size={20} color="#FFFFFF" />
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: { 
    flex: 1,
  },
  container: { 
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: theme.colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    zIndex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[6],
  },
  infoCard: {
    marginBottom: theme.spacing[6],
  },
  infoContent: {
    flexDirection: 'row',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    ...typography.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  sectionTitle: {
    ...typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    marginTop: theme.spacing[2],
  },
  card: {
    marginBottom: theme.spacing[4],
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[4],
    minHeight: 76,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
    paddingRight: theme.spacing[3],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    ...typography.bodyMedium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  settingDescription: {
    ...typography.caption,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.glass.border,
    marginHorizontal: theme.spacing[4],
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[4],
    minHeight: 76,
  },
  timeText: {
    ...typography.bodyMedium,
    color: theme.colors.primary.cyan,
    fontFamily: fonts.bold,
    marginTop: theme.spacing[0.5],
  },
  testButton: {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[4],
    gap: theme.spacing[2],
  },
  testButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 32,
  },
});

export default NotificationSettingsScreen;