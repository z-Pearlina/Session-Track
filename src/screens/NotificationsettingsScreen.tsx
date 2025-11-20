import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NotificationService } from '../services/NotificationService';
import { NotificationPreferences } from '../types';
import { theme } from '../theme/theme';
import { logger } from '../services/logger';
import { GlassCard } from '../components/GlassCard';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  dailyReminderEnabled: true,
  dailyReminderTime: '20:00',
  streakReminderEnabled: true,
  goalReminderEnabled: true,
  achievementNotificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await NotificationService.getPreferences();
      if (saved) {
        setPreferences(saved);
      }
    } catch (error) {
      logger.error('Failed to load notification preferences', error);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    setIsSaving(true);
    try {
      await NotificationService.savePreferences(newPreferences);
      setPreferences(newPreferences);
      logger.success('Notification preferences saved');
    } catch (error) {
      logger.error('Failed to save notification preferences', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    await savePreferences(newPreferences);
  };

  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      const newPreferences = {
        ...preferences,
        dailyReminderTime: timeString,
      };
      await savePreferences(newPreferences);
    }
  };

  const parseTime = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  const formatTime = (timeString: string): string => {
    const date = parseTime(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleTestNotification = async () => {
    try {
      await NotificationService.testNotification();
      Alert.alert(
        'Test Notification Sent',
        'Check your notification tray. If you don\'t see it, check your device notification settings.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Test Failed',
        'Could not send test notification. Please check permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleViewScheduled = async () => {
    try {
      const scheduled = await NotificationService.getAllScheduledNotifications();
      if (scheduled.length === 0) {
        Alert.alert('No Scheduled Notifications', 'There are no notifications currently scheduled.');
      } else {
        const list = scheduled.map((n, i) => `${i + 1}. ${n.content.title}`).join('\n');
        Alert.alert(`Scheduled Notifications (${scheduled.length})`, list);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get scheduled notifications');
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={theme.gradients.backgroundAnimated}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={24} color={theme.colors.primary.cyan} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Enable Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Turn all notifications on or off
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.enabled}
                onValueChange={(value) => handleToggle('enabled', value)}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.colors.glass.border}
              />
            </View>
          </GlassCard>

          <Text style={styles.sectionTitle}>Daily Reminders</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="calendar-outline" size={24} color={theme.colors.primary.aqua} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Daily Reminder</Text>
                  <Text style={styles.settingDescription}>
                    Remind me to track my time
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.dailyReminderEnabled}
                onValueChange={(value) => handleToggle('dailyReminderEnabled', value)}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.colors.glass.border}
                disabled={!preferences.enabled}
              />
            </View>

            {preferences.dailyReminderEnabled && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => setShowTimePicker(true)}
                  disabled={!preferences.enabled}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingInfo}>
                    <Ionicons name="time-outline" size={24} color={theme.colors.primary.mint} />
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>Reminder Time</Text>
                      <Text style={styles.settingValue}>
                        {formatTime(preferences.dailyReminderTime)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              </>
            )}
          </GlassCard>

          <Text style={styles.sectionTitle}>Activity Reminders</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="flame" size={24} color="#FF6B35" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Streak Reminder</Text>
                  <Text style={styles.settingDescription}>
                    Remind me to keep my streak alive
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.streakReminderEnabled}
                onValueChange={(value) => handleToggle('streakReminderEnabled', value)}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.colors.glass.border}
                disabled={!preferences.enabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Goal Reminder</Text>
                  <Text style={styles.settingDescription}>
                    Remind me when I'm close to a goal
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.goalReminderEnabled}
                onValueChange={(value) => handleToggle('goalReminderEnabled', value)}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.colors.glass.border}
                disabled={!preferences.enabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="medal" size={24} color="#9B59B6" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Achievements</Text>
                  <Text style={styles.settingDescription}>
                    Notify me when I unlock achievements
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.achievementNotificationsEnabled}
                onValueChange={(value) => handleToggle('achievementNotificationsEnabled', value)}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.colors.glass.border}
                disabled={!preferences.enabled}
              />
            </View>
          </GlassCard>

          <Text style={styles.sectionTitle}>Sound & Haptics</Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="volume-high" size={24} color={theme.colors.primary.sage} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Sound</Text>
                  <Text style={styles.settingDescription}>
                    Play sound with notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.soundEnabled}
                onValueChange={(value) => handleToggle('soundEnabled', value)}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.colors.glass.border}
                disabled={!preferences.enabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="phone-portrait-outline" size={24} color={theme.colors.primary.teal} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Vibration</Text>
                  <Text style={styles.settingDescription}>
                    Vibrate with notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.vibrationEnabled}
                onValueChange={(value) => handleToggle('vibrationEnabled', value)}
                trackColor={{ false: theme.colors.glass.border, true: theme.colors.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.colors.glass.border}
                disabled={!preferences.enabled}
              />
            </View>
          </GlassCard>

          <Text style={styles.sectionTitle}>Testing</Text>
          <GlassCard style={styles.card}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTestNotification}
              activeOpacity={0.7}
            >
              <Ionicons name="send" size={20} color={theme.colors.primary.cyan} />
              <Text style={styles.actionButtonText}>Send Test Notification</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewScheduled}
              activeOpacity={0.7}
            >
              <Ionicons name="list" size={20} color={theme.colors.primary.aqua} />
              <Text style={styles.actionButtonText}>View Scheduled</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          </GlassCard>

          <GlassCard style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary.cyan} />
              <Text style={styles.infoNoteText}>
                Changes are saved automatically. Make sure notifications are enabled in your device settings.
              </Text>
            </View>
          </GlassCard>

          <View style={{ height: 40 }} />
        </ScrollView>

        {showTimePicker && (
          <DateTimePicker
            value={parseTime(preferences.dailyReminderTime)}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
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
    paddingVertical: theme.spacing[3],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[3],
    marginLeft: theme.spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[1],
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing[3],
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[0.5],
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  settingValue: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary.cyan,
    fontWeight: theme.fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.glass.border,
    marginVertical: theme.spacing[3],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[2],
  },
  actionButtonText: {
    flex: 1,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  infoCard: {
    marginTop: theme.spacing[6],
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
    padding: theme.spacing[4],
  },
  infoNoteText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});