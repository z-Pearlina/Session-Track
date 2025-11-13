import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';
import { APP_CONFIG, STORAGE_KEYS } from '../config/constants';
import { NotificationPreferences } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
export class NotificationService {
  static async initialize(): Promise<void> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('Notification permissions not granted');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#38BDF8',
        });
      }

      logger.success('Notifications initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize notifications', error);
    }
  }

  static async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  static async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  static async getPreferences(): Promise<NotificationPreferences> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
      if (!raw) {
        return this.getDefaultPreferences();
      }
      return JSON.parse(raw);
    } catch (error) {
      logger.error('Failed to load notification preferences', error);
      return this.getDefaultPreferences();
    }
  }

  static async savePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_PREFERENCES,
        JSON.stringify(preferences)
      );
      await this.rescheduleAllNotifications();
    } catch (error) {
      logger.error('Failed to save notification preferences', error);
      throw error;
    }
  }

  static async scheduleDailyReminder(time: string): Promise<string | null> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.enabled || !preferences.dailyReminderEnabled) {
        return null;
      }

      const [hours, minutes] = time.split(':').map(Number);
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏱️ Time to Track',
          body: 'Log your progress and keep your streak going!',
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: { type: 'daily_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      return id;
    } catch (error) {
      logger.error('Failed to schedule daily reminder', error);
      return null;
    }
  }

  static async scheduleGoalReminder(goalTitle: string, minutesRemaining: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.enabled || !preferences.goalReminderEnabled) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Goal Almost There!',
          body: `Only ${minutesRemaining} minutes left to reach "${goalTitle}"`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: { type: 'goal_reminder' },
        },
        trigger: null,
      });
    } catch (error) {
      logger.error('Failed to schedule goal reminder', error);
    }
  }

  static async sendGoalCompletedNotification(goalTitle: string): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.enabled || !preferences.goalReminderEnabled) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Goal Completed!',
          body: `Congratulations! You completed "${goalTitle}"`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: { type: 'goal_completed' },
        },
        trigger: null,
      });
    } catch (error) {
      logger.error('Failed to send goal completed notification', error);
    }
  }

  static async sendStreakReminder(currentStreak: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.enabled || !preferences.streakReminderEnabled) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Keep Your Streak!',
          body: `You're on a ${currentStreak}-day streak! Don't break it today.`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: { type: 'streak_reminder' },
        },
        trigger: null,
      });
    } catch (error) {
      logger.error('Failed to send streak reminder', error);
    }
  }

  static async sendAchievementUnlocked(
    achievementTitle: string,
    achievementDescription: string
  ): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.enabled || !preferences.achievementNotificationsEnabled) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🏆 Achievement Unlocked!`,
          body: `${achievementTitle}: ${achievementDescription}`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: { type: 'achievement_unlocked', title: achievementTitle },
        },
        trigger: null,
      });
      } catch (error) {
      logger.error('Failed to send achievement notification', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logger.info('All notifications cancelled');
    } catch (error) {
      logger.error('Failed to cancel notifications', error);
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      logger.error('Failed to cancel notification', error);
    }
  }

  static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      logger.error('Failed to get scheduled notifications', error);
      return [];
    }
  }

  private static async rescheduleAllNotifications(): Promise<void> {
    try {
      await this.cancelAllNotifications();
      const preferences = await this.getPreferences();

      if (preferences.enabled && preferences.dailyReminderEnabled) {
        await this.scheduleDailyReminder(preferences.dailyReminderTime);
      }
    } catch (error) {
      logger.error('Failed to reschedule notifications', error);
    }
  }

  private static getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      dailyReminderEnabled: true,
      dailyReminderTime: '20:00',
      streakReminderEnabled: true,
      goalReminderEnabled: true,
      achievementNotificationsEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
    };
  }
}