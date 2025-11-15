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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StorageService } from '../services/StorageService';
import { NotificationPreferences } from '../types';
import { COLORS } from '../theme/theme';
import { logger } from '../services/logger';

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
      const saved = await StorageService.getNotificationPreferences();
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
      await StorageService.saveNotificationPreferences(newPreferences);
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
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <BlurView intensity={30} tint="dark" style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={24} color={COLORS.primary.cyan} />
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
                trackColor={{ false: COLORS.glass.border, true: COLORS.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={COLORS.glass.border}
              />
            </View>
          </View>
        </BlurView>

        <Text style={styles.sectionTitle}>Daily Reminders</Text>
        <BlurView intensity={30} tint="dark" style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="calendar-outline" size={24} color={COLORS.primary.aqua} />
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
                trackColor={{ false: COLORS.glass.border, true: COLORS.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={COLORS.glass.border}
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
                >
                  <View style={styles.settingInfo}>
                    <Ionicons name="time-outline" size={24} color={COLORS.primary.mint} />
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>Reminder Time</Text>
                      <Text style={styles.settingValue}>
                        {formatTime(preferences.dailyReminderTime)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </BlurView>

        <Text style={styles.sectionTitle}>Activity Reminders</Text>
        <BlurView intensity={30} tint="dark" style={styles.card}>
          <View style={styles.cardContent}>
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
                trackColor={{ false: COLORS.glass.border, true: COLORS.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={COLORS.glass.border}
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
                trackColor={{ false: COLORS.glass.border, true: COLORS.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={COLORS.glass.border}
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
                trackColor={{ false: COLORS.glass.border, true: COLORS.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={COLORS.glass.border}
                disabled={!preferences.enabled}
              />
            </View>
          </View>
        </BlurView>

        <Text style={styles.sectionTitle}>Sound & Haptics</Text>
        <BlurView intensity={30} tint="dark" style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="volume-high" size={24} color={COLORS.primary.sage} />
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
                trackColor={{ false: COLORS.glass.border, true: COLORS.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={COLORS.glass.border}
                disabled={!preferences.enabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="phone-portrait-outline" size={24} color={COLORS.primary.teal} />
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
                trackColor={{ false: COLORS.glass.border, true: COLORS.primary.cyan }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={COLORS.glass.border}
                disabled={!preferences.enabled}
              />
            </View>
          </View>
        </BlurView>

        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.text.tertiary} />
          <Text style={styles.infoNoteText}>
            Changes are saved automatically. Make sure notifications are enabled in your device settings.
          </Text>
        </View>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.secondary,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    marginBottom: 12,
  },
  cardContent: {
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  settingValue: {
    fontSize: 15,
    color: COLORS.primary.cyan,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.glass.border,
    marginVertical: 12,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 4,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.tertiary,
    lineHeight: 18,
  },
});