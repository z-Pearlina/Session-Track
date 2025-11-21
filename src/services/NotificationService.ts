import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';
import { NotificationPreferences } from '../types';

const STORAGE_KEY = '@flowtrix:notification_preferences';
const DAILY_REMINDER_ID_KEY = '@flowtrix:daily_reminder_id';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export class NotificationService {
  private static notificationListener: Notifications.Subscription | null = null;
  private static responseListener: Notifications.Subscription | null = null;

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
          name: 'General Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#38BDF8',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });

        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FFD700',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('achievements', {
          name: 'Achievements',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 150, 150, 150, 150, 150],
          lightColor: '#9B59B6',
          sound: 'default',
        });
      }

      this.setupNotificationListeners();

      await this.rescheduleDailyReminder();

      logger.success('Notifications initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize notifications', error);
    }
  }

  private static setupNotificationListeners(): void {
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      logger.info('Notification received:', notification);
    });

    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      logger.info('Notification response received:', response);
      const data = response.notification.request.content.data;
      
      if (data?.screen) {
        logger.info('Navigate to screen:', data.screen);
      }
    });
  }

  static removeListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
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
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
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
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      await this.rescheduleDailyReminder();
      logger.success('Notification preferences saved');
    } catch (error) {
      logger.error('Failed to save notification preferences', error);
      throw error;
    }
  }

  static async scheduleDailyReminder(): Promise<string | null> {
    try {
      const preferences = await this.getPreferences();
      
      if (!preferences.enabled || !preferences.dailyReminderEnabled) {
        await this.cancelDailyReminder();
        return null;
      }

      const [hours, minutes] = preferences.dailyReminderTime.split(':').map(Number);
      
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏱️ Time to Track Your Progress',
          body: 'Log your sessions and keep your streak going! 🔥',
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: { 
            type: 'daily_reminder',
            screen: 'StartSession'
          },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      await AsyncStorage.setItem(DAILY_REMINDER_ID_KEY, id);
      logger.success(`Daily reminder scheduled for ${hours}:${minutes} (ID: ${id})`);
      
      return id;
    } catch (error) {
      logger.error('Failed to schedule daily reminder', error);
      return null;
    }
  }

  private static async cancelDailyReminder(): Promise<void> {
    try {
      const existingId = await AsyncStorage.getItem(DAILY_REMINDER_ID_KEY);
      if (existingId) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
        await AsyncStorage.removeItem(DAILY_REMINDER_ID_KEY);
        logger.info('Daily reminder cancelled');
      }
    } catch (error) {
      logger.error('Failed to cancel daily reminder', error);
    }
  }

  private static async rescheduleDailyReminder(): Promise<void> {
    await this.cancelDailyReminder();
    await this.scheduleDailyReminder();
  }

  static async scheduleGoalReminder(goalId: string, goalTitle: string, daysBeforeEnd: number = 1): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.enabled || !preferences.goalReminderEnabled) {
        return;
      }

      const triggerDate = new Date();
      triggerDate.setDate(triggerDate.getDate() + daysBeforeEnd);
      triggerDate.setHours(20, 0, 0, 0);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Goal Reminder',
          body: `"${goalTitle}" deadline is approaching. Keep up the great work!`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: { 
            type: 'goal_reminder',
            goalId,
            screen: 'GoalDetails'
          },
        },
        trigger: triggerDate,
      });

      logger.success(`Goal reminder scheduled for ${goalTitle}`);
    } catch (error) {
      logger.error('Failed to schedule goal reminder', error);
    }
  }

  static async sendGoalProgressNotification(goalTitle: string, progress: number, target: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.enabled || !preferences.goalReminderEnabled) {
        return;
      }

      const percentage = Math.round((progress / target) * 100);
      
      if (percentage >= 80 && percentage < 100) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🎯 Almost There!',
            body: `You're ${percentage}% complete on "${goalTitle}". Just a little more!`,
            sound: preferences.soundEnabled ? 'default' : undefined,
            data: { type: 'goal_progress' },
          },
          trigger: null,
        });
      }
    } catch (error) {
      logger.error('Failed to send goal progress notification', error);
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
          body: `Congratulations! You've achieved "${goalTitle}"!`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: { type: 'goal_completed' },
        },
        trigger: null,
      });

      logger.success('Goal completed notification sent');
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
          data: { 
            type: 'streak_reminder',
            screen: 'Home'
          },
        },
        trigger: null,
      });

      logger.success('Streak reminder sent');
    } catch (error) {
      logger.error('Failed to send streak reminder', error);
    }
  }

  static async sendAchievementUnlocked(achievementTitle: string, achievementDescription: string): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.enabled || !preferences.achievementNotificationsEnabled) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏆 Achievement Unlocked!',
          body: `${achievementTitle}: ${achievementDescription}`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: { 
            type: 'achievement_unlocked',
            title: achievementTitle,
            screen: 'Achievements'
          },
        },
        trigger: null,
      });

      logger.success(`Achievement notification sent: ${achievementTitle}`);
    } catch (error) {
      logger.error('Failed to send achievement notification', error);
    }
  }

  static async sendSessionCompletedNotification(sessionTitle: string, durationMinutes: number): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      if (!preferences.enabled) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Session Completed',
          body: `Great job! You tracked ${durationMinutes} minutes for "${sessionTitle}"`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: { type: 'session_completed' },
        },
        trigger: null,
      });
    } catch (error) {
      logger.error('Failed to send session completed notification', error);
    }
  }

  static async testNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Notification',
          body: 'If you see this, notifications are working correctly!',
          sound: true,
          data: { type: 'test' },
        },
        trigger: null,
      });
      logger.success('Test notification sent');
    } catch (error) {
      logger.error('Failed to send test notification', error);
      throw error;
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(DAILY_REMINDER_ID_KEY);
      logger.info('All notifications cancelled');
    } catch (error) {
      logger.error('Failed to cancel notifications', error);
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      logger.info(`Notification cancelled: ${notificationId}`);
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