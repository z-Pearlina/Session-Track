import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

export interface NotificationPreferences {
  enabled: boolean;
  sessionCompletionEnabled: boolean;
  sessionReminderEnabled: boolean;
  goalCompletionEnabled: boolean;
  goalProgressEnabled: boolean;
  streakReminderEnabled: boolean;
  streakMilestoneEnabled: boolean;
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
  | 'streak_reminder'
  | 'streak_milestone'
  | 'achievement_unlocked'
  | 'daily_reminder';

const STORAGE_KEYS = {
  PREFERENCES: '@flowtrix:notification_preferences',
  HISTORY: '@flowtrix:notification_history',
  DAILY_REMINDER_ID: '@flowtrix:daily_reminder_id',
  LAST_SENT: '@flowtrix:last_sent_notifications',
} as const;

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
  private static navigationCallback: ((screen: string, params?: any) => void) | null = null;

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
        await this.setupAndroidChannels();
      }

      this.setupNotificationListeners();
      await this.rescheduleDailyReminder();

      logger.success('Notification service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize notification service', error);
    }
  }

  private static async setupAndroidChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync('general', {
      name: 'General',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#38BDF8',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('sessions', {
      name: 'Sessions',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('goals', {
      name: 'Goals',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('streaks', {
      name: 'Streaks',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#EF4444',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('achievements', {
      name: 'Achievements',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 150, 150, 150, 150, 150],
      lightColor: '#9B59B6',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD700',
      sound: 'default',
    });
  }

  private static setupNotificationListeners(): void {
    this.notificationListener = Notifications.addNotificationReceivedListener(
      async (notification) => {
        logger.info('Notification received:', notification);
        
        // ✅ FIX: Properly type the notification type with fallback
        const notificationType: NotificationType = 
          (notification.request.content.data?.type as NotificationType) || 'session_completion';
        
        await this.addToHistory({
          id: notification.request.identifier,
          type: notificationType, // ✅ Now properly typed
          title: notification.request.content.title || '',
          body: notification.request.content.body || '',
          data: notification.request.content.data,
          sentAt: new Date().toISOString(),
          read: false,
          dismissed: false,
        });
      }
    );

    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        logger.info('Notification tapped:', response);
        
        const data = response.notification.request.content.data;
        const notificationId = response.notification.request.identifier;
        
        await this.markAsRead(notificationId);
        
        if (data?.screen && this.navigationCallback) {
          this.navigationCallback(data.screen as string, data.params); // ✅ FIX: Cast to string
        }
      }
    );
  }

  static setNavigationCallback(callback: (screen: string, params?: any) => void): void {
    this.navigationCallback = callback;
  }

  static removeListeners(): void {
    if (this.notificationListener) {
      // ✅ FIX: Use correct method name
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      // ✅ FIX: Use correct method name
      this.responseListener.remove();
    }
  }

  // ========================================
  // PREFERENCES MANAGEMENT
  // ========================================

  static async getPreferences(): Promise<NotificationPreferences> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
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
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
      await this.rescheduleDailyReminder();
      logger.success('Notification preferences saved');
    } catch (error) {
      logger.error('Failed to save notification preferences', error);
      throw error;
    }
  }

  static async updatePreference<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ): Promise<void> {
    const preferences = await this.getPreferences();
    preferences[key] = value;
    await this.savePreferences(preferences);
  }

  private static getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      sessionCompletionEnabled: true,
      sessionReminderEnabled: false,
      goalCompletionEnabled: true,
      goalProgressEnabled: true,
      streakReminderEnabled: true,
      streakMilestoneEnabled: true,
      achievementNotificationsEnabled: true,
      dailyReminderEnabled: true,
      dailyReminderTime: '20:00',
      soundEnabled: true,
      vibrationEnabled: true,
    };
  }

  // ========================================
  // NOTIFICATION HISTORY
  // ========================================

  static async getHistory(): Promise<NotificationHistoryItem[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!raw) return [];
      
      const history: NotificationHistoryItem[] = JSON.parse(raw);
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
      history.push(item);
      const trimmed = history.slice(-100);
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
    } catch (error) {
      logger.error('Failed to add notification to history', error);
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updated = history.map(item =>
        item.id === notificationId ? { ...item, read: true } : item
      );
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (error) {
      logger.error('Failed to mark notification as read', error);
    }
  }

  static async markAsDismissed(notificationId: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updated = history.map(item =>
        item.id === notificationId ? { ...item, dismissed: true } : item
      );
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (error) {
      logger.error('Failed to mark notification as dismissed', error);
    }
  }

  static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
      logger.success('Notification history cleared');
    } catch (error) {
      logger.error('Failed to clear notification history', error);
      throw error;
    }
  }

  static async getUnreadCount(): Promise<number> {
    const history = await this.getHistory();
    return history.filter(item => !item.read && !item.dismissed).length;
  }

  // ========================================
  // DEDUPLICATION
  // ========================================

  private static async wasRecentlySent(
    type: NotificationType,
    uniqueKey: string,
    withinMinutes: number = 60
  ): Promise<boolean> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SENT);
      if (!raw) return false;
      
      const lastSent: Record<string, string> = JSON.parse(raw);
      const key = `${type}:${uniqueKey}`;
      const lastSentTime = lastSent[key];
      
      if (!lastSentTime) return false;
      
      const minutesAgo = (Date.now() - new Date(lastSentTime).getTime()) / (1000 * 60);
      return minutesAgo < withinMinutes;
    } catch (error) {
      return false;
    }
  }

  private static async recordSent(type: NotificationType, uniqueKey: string): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SENT);
      const lastSent: Record<string, string> = raw ? JSON.parse(raw) : {};
      
      const key = `${type}:${uniqueKey}`;
      lastSent[key] = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SENT, JSON.stringify(lastSent));
    } catch (error) {
      logger.error('Failed to record sent notification', error);
    }
  }

  // ========================================
  // SESSION NOTIFICATIONS
  // ========================================

  static async sendSessionCompletion(sessionTitle: string, durationMinutes: number): Promise<void> {
    const preferences = await this.getPreferences();
    
    if (!preferences.enabled || !preferences.sessionCompletionEnabled) {
      return;
    }

    const uniqueKey = `${sessionTitle}-${Date.now()}`;
    if (await this.wasRecentlySent('session_completion', uniqueKey, 5)) {
      logger.info('Session completion notification recently sent, skipping');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Session Completed!',
          body: `Great job! You tracked ${durationMinutes} minutes for "${sessionTitle}"`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: {
            type: 'session_completion',
            sessionTitle,
            durationMinutes,
            screen: 'Home',
          },
        },
        trigger: null,
      });

      await this.recordSent('session_completion', uniqueKey);
      logger.success('Session completion notification sent');
    } catch (error) {
      logger.error('Failed to send session completion notification', error);
    }
  }

  static async sendSessionReminder(): Promise<void> {
    const preferences = await this.getPreferences();
    
    if (!preferences.enabled || !preferences.sessionReminderEnabled) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏱️ Time to Track!',
          body: "Don't forget to track your session today!",
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: {
            type: 'session_reminder',
            screen: 'StartSession',
          },
        },
        trigger: null,
      });

      logger.success('Session reminder sent');
    } catch (error) {
      logger.error('Failed to send session reminder', error);
    }
  }

  // ========================================
  // GOAL NOTIFICATIONS
  // ========================================

  static async sendGoalCompletion(goalTitle: string): Promise<void> {
    const preferences = await this.getPreferences();
    
    if (!preferences.enabled || !preferences.goalCompletionEnabled) {
      return;
    }

    if (await this.wasRecentlySent('goal_completion', goalTitle, 60)) {
      logger.info('Goal completion notification recently sent, skipping');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Goal Completed!',
          body: `Congratulations! You've achieved "${goalTitle}"!`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: {
            type: 'goal_completion',
            goalTitle,
            screen: 'Goals',
          },
        },
        trigger: null,
      });

      await this.recordSent('goal_completion', goalTitle);
      logger.success('Goal completion notification sent');
    } catch (error) {
      logger.error('Failed to send goal completion notification', error);
    }
  }

  static async sendGoalProgress(
    goalTitle: string,
    progress: number,
    target: number
  ): Promise<void> {
    const preferences = await this.getPreferences();
    
    if (!preferences.enabled || !preferences.goalProgressEnabled) {
      return;
    }

    const percentage = Math.round((progress / target) * 100);
    
    if (percentage !== 80 && percentage !== 90) {
      return;
    }

    const uniqueKey = `${goalTitle}-${percentage}`;
    if (await this.wasRecentlySent('goal_progress', uniqueKey, 1440)) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Almost There!',
          body: `You're ${percentage}% complete on "${goalTitle}". Keep going!`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: {
            type: 'goal_progress',
            goalTitle,
            percentage,
            screen: 'Goals',
          },
        },
        trigger: null,
      });

      await this.recordSent('goal_progress', uniqueKey);
      logger.success('Goal progress notification sent');
    } catch (error) {
      logger.error('Failed to send goal progress notification', error);
    }
  }

  // ========================================
  // STREAK NOTIFICATIONS
  // ========================================

  static async sendStreakReminder(currentStreak: number): Promise<void> {
    const preferences = await this.getPreferences();
    
    if (!preferences.enabled || !preferences.streakReminderEnabled) {
      return;
    }

    if (await this.wasRecentlySent('streak_reminder', 'daily', 1440)) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Keep Your Streak!',
          body: `You're on a ${currentStreak}-day streak! Don't break it today.`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: {
            type: 'streak_reminder',
            currentStreak,
            screen: 'Home',
          },
        },
        trigger: null,
      });

      await this.recordSent('streak_reminder', 'daily');
      logger.success('Streak reminder sent');
    } catch (error) {
      logger.error('Failed to send streak reminder', error);
    }
  }

  static async sendStreakMilestone(streakDays: number): Promise<void> {
    const preferences = await this.getPreferences();
    
    if (!preferences.enabled || !preferences.streakMilestoneEnabled) {
      return;
    }

    const milestones = [3, 7, 14, 30, 50, 100];
    if (!milestones.includes(streakDays)) {
      return;
    }

    const uniqueKey = `${streakDays}`;
    if (await this.wasRecentlySent('streak_milestone', uniqueKey, 1440)) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Streak Milestone!',
          body: `Amazing! You've maintained a ${streakDays}-day streak!`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: {
            type: 'streak_milestone',
            streakDays,
            screen: 'Home',
          },
        },
        trigger: null,
      });

      await this.recordSent('streak_milestone', uniqueKey);
      logger.success('Streak milestone notification sent');
    } catch (error) {
      logger.error('Failed to send streak milestone notification', error);
    }
  }

  // ========================================
  // ACHIEVEMENT NOTIFICATIONS
  // ========================================

  static async sendAchievementUnlocked(
    achievementTitle: string,
    achievementDescription: string
  ): Promise<void> {
    const preferences = await this.getPreferences();
    
    if (!preferences.enabled || !preferences.achievementNotificationsEnabled) {
      return;
    }

    if (await this.wasRecentlySent('achievement_unlocked', achievementTitle, 60)) {
      logger.info('Achievement notification recently sent, skipping');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏆 Achievement Unlocked!',
          body: `${achievementTitle}: ${achievementDescription}`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: {
            type: 'achievement_unlocked',
            achievementTitle,
            screen: 'Achievements',
          },
        },
        trigger: null,
      });

      await this.recordSent('achievement_unlocked', achievementTitle);
      logger.success(`Achievement notification sent: ${achievementTitle}`);
    } catch (error) {
      logger.error('Failed to send achievement notification', error);
    }
  }

  // ========================================
  // GOAL REMINDERS (Optional - for goal deadlines)
  // ========================================

  /**
   * Schedule a reminder for an upcoming goal deadline
   */
  static async scheduleGoalReminder(
    goalTitle: string,
    goalId: string,
    deadlineDate: Date
  ): Promise<string | null> {
    try {
      const preferences = await this.getPreferences();
      
      if (!preferences.enabled || !preferences.goalProgressEnabled) {
        return null;
      }

      // Calculate seconds until deadline (remind 1 day before)
      const reminderDate = new Date(deadlineDate);
      reminderDate.setDate(reminderDate.getDate() - 1); // 1 day before deadline
      reminderDate.setHours(9, 0, 0, 0); // 9 AM reminder
      
      const now = new Date();
      
      // Don't schedule if reminder time has passed
      if (reminderDate <= now) {
        return null;
      }
      
      const secondsUntilReminder = Math.floor((reminderDate.getTime() - now.getTime()) / 1000);
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Goal Deadline Reminder',
          body: `"${goalTitle}" is due tomorrow! Keep pushing!`,
          sound: preferences.soundEnabled ? 'default' : undefined,
          data: {
            type: 'goal_progress',
            goalId,
            goalTitle,
            screen: 'Goals',
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

  /**
   * Cancel a specific goal reminder
   */
  static async cancelGoalReminder(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      logger.info('Goal reminder cancelled');
    } catch (error) {
      logger.error('Failed to cancel goal reminder', error);
    }
  }

  // ========================================
  // DAILY REMINDER
  // ========================================

  static async scheduleDailyReminder(): Promise<string | null> {
    try {
      const preferences = await this.getPreferences();
      
      if (!preferences.enabled || !preferences.dailyReminderEnabled) {
        await this.cancelDailyReminder();
        return null;
      }

      const [hours, minutes] = preferences.dailyReminderTime.split(':').map(Number);
      await this.cancelDailyReminder();
      
      // ✅ FIX: Calculate seconds until target time (works on both iOS and Android)
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // If scheduled time is earlier today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const secondsUntilTrigger = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000);
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏱️ Time to Track!',
          body: 'Log your sessions and keep your streak going! 🔥',
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

      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_REMINDER_ID, id);
      logger.success(`Daily reminder scheduled for ${hours}:${minutes} (in ${Math.floor(secondsUntilTrigger / 3600)} hours)`);
      
      return id;
    } catch (error) {
      logger.error('Failed to schedule daily reminder', error);
      return null;
    }
  }

  private static async cancelDailyReminder(): Promise<void> {
    try {
      const existingId = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_REMINDER_ID);
      if (existingId) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
        await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_REMINDER_ID);
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

  // ========================================
  // UTILITY METHODS
  // ========================================

  static async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  static async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  static async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Notification',
          body: 'If you see this, notifications are working correctly!',
          sound: true,
          data: { type: 'session_completion' }, // ✅ Use valid type
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
      await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_REMINDER_ID);
      logger.info('All notifications cancelled');
    } catch (error) {
      logger.error('Failed to cancel notifications', error);
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      logger.error('Failed to get scheduled notifications', error);
      return [];
    }
  }

  static async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      logger.info('All notifications dismissed');
    } catch (error) {
      logger.error('Failed to dismiss notifications', error);
    }
  }

  static async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      return 0;
    }
  }

  static async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      logger.error('Failed to set badge count', error);
    }
  }

  static async clearBadgeCount(): Promise<void> {
    await this.setBadgeCount(0);
  }
}