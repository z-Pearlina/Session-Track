import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
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
        'Please enable notifications in your device settings to receive updates.',
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

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    await updatePreference(key, value);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
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
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleGoBack = () => navigation.goBack();

  if (!preferences) {
    return (
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={theme.gradients.backgroundAnimated}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
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
        >
          {/* Info Card */}
          <GlassCard style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Ionicons name="information-circle" size={24} color={theme.colors.primary.cyan} />
              <Text style={styles.infoText}>
                Customize your notification preferences to stay updated on sessions, goals, and achievements.
              </Text>
            </View>
          </GlassCard>

          {/* Master Toggle */}
          <Text style={styles.sectionTitle}>General</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary.cyan + '20' }]}>
                  <Ionicons name="notifications" size={24} color={theme.colors.primary.cyan} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable Notifications</Text>
                  <Text style={styles.settingDescription}>Master switch for all notifications</Text>
                </View>
              </View>
              <Switch
                value={preferences.enabled}
                onValueChange={(value) => handleToggle('enabled', value)}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor={theme.colors.background.primary}
                ios_backgroundColor={theme.colors.glass.border}
              />
            </View>
          </GlassCard>

          {/* Session Notifications */}
          <Text style={styles.sectionTitle}>Sessions</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>
                  <Ionicons name="time" size={24} color="#10B981" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Session Completion</Text>
                  <Text style={styles.settingDescription}>Notify when you complete a session</Text>
                </View>
              </View>
              <Switch
                value={preferences.sessionCompletionEnabled}
                onValueChange={(value) => handleToggle('sessionCompletionEnabled', value)}
                disabled={!preferences.enabled}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor={theme.colors.background.primary}
                ios_backgroundColor={theme.colors.glass.border}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>
                  <Ionicons name="alarm" size={24} color="#10B981" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Session Reminders</Text>
                  <Text style={styles.settingDescription}>Remind you to track sessions</Text>
                </View>
              </View>
              <Switch
                value={preferences.sessionReminderEnabled}
                onValueChange={(value) => handleToggle('sessionReminderEnabled', value)}
                disabled={!preferences.enabled}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor={theme.colors.background.primary}
                ios_backgroundColor={theme.colors.glass.border}
              />
            </View>
          </GlassCard>

          {/* Goal Notifications */}
          <Text style={styles.sectionTitle}>Goals</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#F59E0B' + '20' }]}>
                  <Ionicons name="flag" size={24} color="#F59E0B" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Goal Completion</Text>
                  <Text style={styles.settingDescription}>Notify when you complete a goal</Text>
                </View>
              </View>
              <Switch
                value={preferences.goalCompletionEnabled}
                onValueChange={(value) => handleToggle('goalCompletionEnabled', value)}
                disabled={!preferences.enabled}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor={theme.colors.background.primary}
                ios_backgroundColor={theme.colors.glass.border}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#F59E0B' + '20' }]}>
                  <Ionicons name="trending-up" size={24} color="#F59E0B" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Goal Progress</Text>
                  <Text style={styles.settingDescription}>Notify at 80% and 90% progress</Text>
                </View>
              </View>
              <Switch
                value={preferences.goalProgressEnabled}
                onValueChange={(value) => handleToggle('goalProgressEnabled', value)}
                disabled={!preferences.enabled}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor={theme.colors.background.primary}
                ios_backgroundColor={theme.colors.glass.border}
              />
            </View>
          </GlassCard>

          {/* Streak Notifications */}
          <Text style={styles.sectionTitle}>Streaks</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#EF4444' + '20' }]}>
                  <Ionicons name="flame" size={24} color="#EF4444" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Streak Reminders</Text>
                  <Text style={styles.settingDescription}>Remind you to maintain your streak</Text>
                </View>
              </View>
              <Switch
                value={preferences.streakReminderEnabled}
                onValueChange={(value) => handleToggle('streakReminderEnabled', value)}
                disabled={!preferences.enabled}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor={theme.colors.background.primary}
                ios_backgroundColor={theme.colors.glass.border}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#EF4444' + '20' }]}>
                  <Ionicons name="trophy" size={24} color="#EF4444" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Streak Milestones</Text>
                  <Text style={styles.settingDescription}>Celebrate at 3, 7, 14, 30 days</Text>
                </View>
              </View>
              <Switch
                value={preferences.streakMilestoneEnabled}
                onValueChange={(value) => handleToggle('streakMilestoneEnabled', value)}
                disabled={!preferences.enabled}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor={theme.colors.background.primary}
                ios_backgroundColor={theme.colors.glass.border}
              />
            </View>
          </GlassCard>

          {/* Achievement Notifications */}
          <Text style={styles.sectionTitle}>Achievements</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#9B59B6' + '20' }]}>
                  <Ionicons name="trophy" size={24} color="#9B59B6" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Achievement Unlocks</Text>
                  <Text style={styles.settingDescription}>Notify when you unlock achievements</Text>
                </View>
              </View>
              <Switch
                value={preferences.achievementNotificationsEnabled}
                onValueChange={(value) => handleToggle('achievementNotificationsEnabled', value)}
                disabled={!preferences.enabled}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor={theme.colors.background.primary}
                ios_backgroundColor={theme.colors.glass.border}
              />
            </View>
          </GlassCard>

          {/* Daily Reminder */}
          <Text style={styles.sectionTitle}>Daily Reminder</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFD700' + '20' }]}>
                  <Ionicons name="alarm" size={24} color="#FFD700" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable Daily Reminder</Text>
                  <Text style={styles.settingDescription}>Daily reminder to track your sessions</Text>
                </View>
              </View>
              <Switch
                value={preferences.dailyReminderEnabled}
                onValueChange={(value) => handleToggle('dailyReminderEnabled', value)}
                disabled={!preferences.enabled}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor={theme.colors.background.primary}
                ios_backgroundColor={theme.colors.glass.border}
              />
            </View>

            {preferences.dailyReminderEnabled && (
              <>
                <View style={styles.divider} />
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

          {/* Sound & Vibration */}
          <Text style={styles.sectionTitle}>Sound & Vibration</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.text.tertiary + '20' }]}>
                  <Ionicons name="volume-high" size={24} color={theme.colors.text.tertiary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Sound</Text>
                  <Text style={styles.settingDescription}>Play sound with notifications</Text>
                </View>
              </View>
              <Switch
                value={preferences.soundEnabled}
                onValueChange={(value) => handleToggle('soundEnabled', value)}
                disabled={!preferences.enabled}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor={theme.colors.background.primary}
                ios_backgroundColor={theme.colors.glass.border}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.text.tertiary + '20' }]}>
                  <Ionicons name="phone-portrait" size={24} color={theme.colors.text.tertiary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Vibration</Text>
                  <Text style={styles.settingDescription}>Vibrate device with notifications</Text>
                </View>
              </View>
              <Switch
                value={preferences.vibrationEnabled}
                onValueChange={(value) => handleToggle('vibrationEnabled', value)}
                disabled={!preferences.enabled}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor={theme.colors.background.primary}
                ios_backgroundColor={theme.colors.glass.border}
              />
            </View>
          </GlassCard>

          {/* Test Notification */}
          <TouchableOpacity
            style={[styles.testButton, !preferences.enabled && styles.testButtonDisabled]}
            onPress={handleTestNotification}
            disabled={!preferences.enabled}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={preferences.enabled 
                ? [theme.colors.primary.cyan, theme.colors.primary.blue] 
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { 
    flex: 1 
  },
  container: { 
    flex: 1 
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
    paddingVertical: theme.spacing[2],
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
    paddingTop: theme.spacing[2],
  },
  infoCard: {
    marginBottom: theme.spacing[6],
  },
  infoContent: {
    flexDirection: 'row',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  infoText: {
    flex: 1,
    ...typography.bodySmall,
    color: theme.colors.text.secondary,
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
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  timeText: {
    ...typography.bodyMedium,
    color: theme.colors.primary.cyan,
    fontFamily: fonts.bold,
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
    height: 100,
  },
});

export default NotificationSettingsScreen;