import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';
import { STORAGE_KEYS } from '../config/constants';

export interface NotificationPreferences {
  enabled: boolean;
  
  sessionCompletionEnabled: boolean;
  sessionReminderEnabled: boolean;
  
  goalCompletionEnabled: boolean;
  goalProgressEnabled: boolean;
  goalReminderEnabled: boolean;
  
  streakReminderEnabled: boolean;
  
  achievementNotificationsEnabled: boolean;
  
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface NotificationHistoryItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  sentAt: string;
  read: boolean;
  dismissed: boolean;
}

export type NotificationType =
  | 'session_completion'
  | 'session_reminder'
  | 'goal_completion'
  | 'goal_progress'
  | 'goal_reminder'
  | 'streak_reminder'
  | 'achievement_unlocked'
  | 'daily_reminder'
  | 'test';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  sessionCompletionEnabled: true,
  sessionReminderEnabled: false,
  goalCompletionEnabled: true,
  goalProgressEnabled: true,
  goalReminderEnabled: true,
  streakReminderEnabled: true,
  achievementNotificationsEnabled: true,
  dailyReminderEnabled: false,
  dailyReminderTime: '20:00',
  soundEnabled: true,
  vibrationEnabled: true,
};

const NOTIFICATION_STORAGE = {
  HISTORY: '@flowtrix:notifications:history',
  LAST_SENT: '@flowtrix:notifications:last_sent',
  DAILY_REMINDER_ID: '@flowtrix:notifications:daily_reminder_id',
} as const;

export class NotificationService {
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await this.requestPermissions();
      }

      this.isInitialized = true;
      logger.success('Notification service initialized');
    } catch (error) {
      logger.error('Failed to initialize notification service', error);
      throw error;
    }
  }

  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      logger.warn('Notifications require physical device');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('Notification permissions denied');
        return false;
      }

      logger.success('Notification permissions granted');
      return true;
    } catch (error) {
      logger.error('Failed to request permissions', error);
      return false;
    }
  }

  static async getPermissionStatus(): Promise<string> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  static async getPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
      if (!stored) return DEFAULT_PREFERENCES;

      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    } catch (error) {
      logger.error('Failed to load notification preferences', error);
      return DEFAULT_PREFERENCES;
    }
  }

  static async savePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_PREFERENCES,
        JSON.stringify(preferences)
      );

      if (preferences.dailyReminderEnabled) {
        await this.scheduleDailyReminder();
      } else {
        await this.cancelDailyReminder();
      }

      logger.success('Notification preferences saved');
    } catch (error) {
      logger.error('Failed to save notification preferences', error);
      throw error;
    }
  }

  private static async sendNotification(
    type: NotificationType,
    title: string,
    body: string,
    data?: any
  ): Promise<string | null> {
    try {
      await this.initialize();

      const preferences = await this.getPreferences();
      if (!preferences.enabled) {
        logger.info('Notifications disabled globally');
        return null;
      }

      if (!this.isNotificationTypeEnabled(type, preferences)) {
        logger.info(`Notification type ${type} is disabled`);
        return null;
      }

      if (await this.isDuplicate(type, data)) {
        logger.info(`Duplicate notification prevented: ${type}`);
        return null;
      }

      const content: Notifications.NotificationContentInput = {
        title,
        body,
        data: { type, ...data },
        sound: preferences.soundEnabled,
        vibrate: preferences.vibrationEnabled ? [0, 250, 250, 250] : undefined,
      };

      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: null,
      });

      await this.addToHistory({
        id,
        type,
        title,
        body,
        data,
        sentAt: new Date().toISOString(),
        read: false,
        dismissed: false,
      });

      await this.saveLastSent(type, data);

      logger.success(`Notification sent: ${type} - ${title}`);
      return id;
    } catch (error) {
      logger.error('Failed to send notification', error);
      return null;
    }
  }

  private static isNotificationTypeEnabled(
    type: NotificationType,
    preferences: NotificationPreferences
  ): boolean {
    const typeMap: Record<NotificationType, keyof NotificationPreferences> = {
      session_completion: 'sessionCompletionEnabled',
      session_reminder: 'sessionReminderEnabled',
      goal_completion: 'goalCompletionEnabled',
      goal_progress: 'goalProgressEnabled',
      goal_reminder: 'goalReminderEnabled',
      streak_reminder: 'streakReminderEnabled',
      achievement_unlocked: 'achievementNotificationsEnabled',
      daily_reminder: 'dailyReminderEnabled',
      test: 'enabled',
    };

    const key = typeMap[type];
    return preferences[key] as boolean;
  }

  private static async isDuplicate(type: NotificationType, data?: any): Promise<boolean> {
    try {
      const lastSentKey = `${type}:${JSON.stringify(data || {})}`;
      const stored = await AsyncStorage.getItem(`${NOTIFICATION_STORAGE.LAST_SENT}:${lastSentKey}`);
      
      if (!stored) return false;

      const lastSent = new Date(stored);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSent.getTime()) / (1000 * 60);

      const windows: Record<NotificationType, number> = {
        session_completion: 1,
        session_reminder: 60,
        goal_completion: 5,
        goal_progress: 30,
        goal_reminder: 1440,
        streak_reminder: 1440,
        achievement_unlocked: 2,
        daily_reminder: 1440,
        test: 0.5,
      };

      return diffMinutes < windows[type];
    } catch (error) {
      logger.error('Deduplication check failed', error);
      return false;
    }
  }

  private static async saveLastSent(type: NotificationType, data?: any): Promise<void> {
    try {
      const key = `${type}:${JSON.stringify(data || {})}`;
      await AsyncStorage.setItem(
        `${NOTIFICATION_STORAGE.LAST_SENT}:${key}`,
        new Date().toISOString()
      );
    } catch (error) {
      logger.error('Failed to save last sent timestamp', error);
    }
  }

  static async sendSessionCompletion(
    sessionTitle: string,
    durationMinutes: number,
    categoryName: string
  ): Promise<void> {
    await this.sendNotification(
      'session_completion',
      '✅ Session Completed!',
      `${sessionTitle} • ${durationMinutes} min in ${categoryName}`,
      { sessionTitle, durationMinutes, categoryName }
    );
  }

  static async sendSessionReminder(): Promise<void> {
    await this.sendNotification(
      'session_reminder',
      '⏱️ Time to Track!',
      'Don\'t forget to log your sessions today',
      {}
    );
  }

  static async sendGoalCompletion(goalTitle: string): Promise<void> {
    await this.sendNotification(
      'goal_completion',
      '🎯 Goal Achieved!',
      `Congratulations on completing: ${goalTitle}`,
      { goalTitle }
    );
  }

  static async sendGoalProgress(
    goalTitle: string,
    currentMinutes: number,
    targetMinutes: number
  ): Promise<void> {
    const progress = Math.round((currentMinutes / targetMinutes) * 100);
    
    await this.sendNotification(
      'goal_progress',
      `📈 ${progress}% Complete!`,
      `You're making great progress with "${goalTitle}"`,
      { goalTitle, progress, currentMinutes, targetMinutes }
    );
  }

  static async sendGoalReminder(goalTitle: string, daysLeft: number): Promise<void> {
    await this.sendNotification(
      'goal_reminder',
      '📅 Goal Deadline Reminder',
      `"${goalTitle}" is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
      { goalTitle, daysLeft }
    );
  }

  static async sendStreakReminder(currentStreak: number): Promise<void> {
    await this.sendNotification(
      'streak_reminder',
      '⚡ Keep Your Streak Going!',
      `You're on a ${currentStreak} day streak. Log a session today to continue!`,
      { currentStreak }
    );
  }

  static async sendAchievementUnlocked(
    achievementTitle: string,
    tier: string
  ): Promise<void> {
    const tierEmojis = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
    };

    const emoji = tierEmojis[tier as keyof typeof tierEmojis] || '🏆';

    await this.sendNotification(
      'achievement_unlocked',
      `${emoji} Achievement Unlocked!`,
      achievementTitle,
      { achievementTitle, tier }
    );
  }

  static async scheduleDailyReminder(): Promise<string | null> {
    try {
      const preferences = await this.getPreferences();
      
      if (!preferences.enabled || !preferences.dailyReminderEnabled) {
        await this.cancelDailyReminder();
        return null;
      }

      const [hours, minutes] = preferences.dailyReminderTime.split(':').map(Number);
      await this.cancelDailyReminder();
      
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const secondsUntilTrigger = Math.floor(
        (scheduledTime.getTime() - now.getTime()) / 1000
      );
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏱️ Time to Track!',
          body: 'Log your sessions and keep your streak going!',
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: {
            type: 'daily_reminder',
            screen: 'StartSession',
          },
        },
        trigger: {
          seconds: secondsUntilTrigger,
          repeats: true,
        },
      });

      await AsyncStorage.setItem(NOTIFICATION_STORAGE.DAILY_REMINDER_ID, id);
      logger.success(`Daily reminder scheduled for ${hours}:${minutes}`);
      
      return id;
    } catch (error) {
      logger.error('Failed to schedule daily reminder', error);
      return null;
    }
  }

  static async cancelDailyReminder(): Promise<void> {
    try {
      const id = await AsyncStorage.getItem(NOTIFICATION_STORAGE.DAILY_REMINDER_ID);
      if (id) {
        await Notifications.cancelScheduledNotificationAsync(id);
        await AsyncStorage.removeItem(NOTIFICATION_STORAGE.DAILY_REMINDER_ID);
        logger.info('Daily reminder cancelled');
      }
    } catch (error) {
      logger.error('Failed to cancel daily reminder', error);
    }
  }

  static async scheduleGoalDeadlineReminder(
    goalTitle: string,
    goalId: string,
    deadlineDate: Date
  ): Promise<string | null> {
    try {
      const preferences = await this.getPreferences();
      
      if (!preferences.enabled || !preferences.goalReminderEnabled) {
        return null;
      }

      const reminderDate = new Date(deadlineDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(9, 0, 0, 0);
      
      const now = new Date();
      
      if (reminderDate <= now) {
        return null;
      }
      
      const secondsUntilReminder = Math.floor(
        (reminderDate.getTime() - now.getTime()) / 1000
      );
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Goal Deadline Tomorrow',
          body: `"${goalTitle}" is due tomorrow!`,
          data: {
            type: 'goal_reminder',
            goalId,
            goalTitle,
            screen: 'GoalDetails',
            params: { goalId },
          },
        },
        trigger: {
          seconds: secondsUntilReminder,
        },
      });

      logger.success(`Goal reminder scheduled for ${goalTitle}`);
      return id;
    } catch (error) {
      logger.error('Failed to schedule goal reminder', error);
      return null;
    }
  }

  static async cancelGoalDeadlineReminder(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      logger.info('Goal reminder cancelled');
    } catch (error) {
      logger.error('Failed to cancel goal reminder', error);
    }
  }

  static async sendTestNotification(): Promise<void> {
    await this.sendNotification(
      'test',
      '🧪 Test Notification',
      'Notifications are working perfectly!',
      { test: true }
    );
  }

  static async getHistory(): Promise<NotificationHistoryItem[]> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE.HISTORY);
      if (!stored) return [];

      const history: NotificationHistoryItem[] = JSON.parse(stored);
      return history.sort((a, b) => 
        new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );
    } catch (error) {
      logger.error('Failed to load notification history', error);
      return [];
    }
  }

  private static async addToHistory(item: NotificationHistoryItem): Promise<void> {
    try {
      const history = await this.getHistory();
      history.unshift(item);

      const trimmed = history.slice(0, 100);

      await AsyncStorage.setItem(
        NOTIFICATION_STORAGE.HISTORY,
        JSON.stringify(trimmed)
      );
    } catch (error) {
      logger.error('Failed to add to history', error);
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updated = history.map(item =>
        item.id === notificationId ? { ...item, read: true } : item
      );

      await AsyncStorage.setItem(
        NOTIFICATION_STORAGE.HISTORY,
        JSON.stringify(updated)
      );

      logger.info('Notification marked as read');
    } catch (error) {
      logger.error('Failed to mark as read', error);
    }
  }

  static async markAsDismissed(notificationId: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updated = history.map(item =>
        item.id === notificationId ? { ...item, dismissed: true, read: true } : item
      );

      await AsyncStorage.setItem(
        NOTIFICATION_STORAGE.HISTORY,
        JSON.stringify(updated)
      );

      logger.info('Notification marked as dismissed');
    } catch (error) {
      logger.error('Failed to mark as dismissed', error);
    }
  }

  static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATION_STORAGE.HISTORY);
      logger.success('Notification history cleared');
    } catch (error) {
      logger.error('Failed to clear history', error);
      throw error;
    }
  }

  static async getUnreadCount(): Promise<number> {
    try {
      const history = await this.getHistory();
      return history.filter(item => !item.read && !item.dismissed).length;
    } catch (error) {
      logger.error('Failed to get unread count', error);
      return 0;
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    logger.info('All scheduled notifications cancelled');
  }
}

export default NotificationService;