import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, Category, Goal, Achievement, DashboardPreferences, NotificationPreferences } from '../types';
import { logger } from './logger';
import { STORAGE_KEYS } from '../config/constants';

export class StorageService {
  static async initialize(): Promise<void> {
    try {
      logger.info('Initializing StorageService...');
      
      await AsyncStorage.getItem(STORAGE_KEYS.STORAGE_VERSION);
      
      logger.success('StorageService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize StorageService', error);
      throw error;
    }
  }

  static async getSessions(): Promise<Session[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      const sessions = data ? JSON.parse(data) : [];
      logger.info(`Loaded ${sessions.length} sessions`);
      return sessions;
    } catch (error) {
      logger.error('Failed to get sessions', error);
      return [];
    }
  }

  static async saveSession(session: Session): Promise<void> {
    try {
      const sessions = await this.getSessions();
      sessions.push(session);
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      logger.success(`Session saved: ${session.id}`);
    } catch (error) {
      logger.error('Failed to save session', error);
      throw error;
    }
  }

  static async updateSession(sessionId: string, updates: Partial<Session>): Promise<void> {
    try {
      const sessions = await this.getSessions();
      const index = sessions.findIndex(s => s.id === sessionId);
      
      if (index === -1) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      sessions[index] = {
        ...sessions[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      logger.success(`Session updated: ${sessionId}`);
    } catch (error) {
      logger.error('Failed to update session', error);
      throw error;
    }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
      logger.success(`Session deleted: ${sessionId}`);
    } catch (error) {
      logger.error('Failed to delete session', error);
      throw error;
    }
  }

  static async clearAllSessions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS);
      logger.warn('All sessions cleared');
    } catch (error) {
      logger.error('Failed to clear sessions', error);
      throw error;
    }
  }

  static async getCategories(): Promise<Category[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const categories = data ? JSON.parse(data) : [];
      logger.info(`Loaded ${categories.length} categories`);
      return categories;
    } catch (error) {
      logger.error('Failed to get categories', error);
      return [];
    }
  }

  static async saveCategory(category: Category): Promise<void> {
    try {
      const categories = await this.getCategories();
      categories.push(category);
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      logger.success(`Category saved: ${category.name}`);
    } catch (error) {
      logger.error('Failed to save category', error);
      throw error;
    }
  }

  static async updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
    try {
      const categories = await this.getCategories();
      const index = categories.findIndex(c => c.id === categoryId);
      
      if (index === -1) {
        throw new Error(`Category not found: ${categoryId}`);
      }

      categories[index] = { ...categories[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      logger.success(`Category updated: ${categoryId}`);
    } catch (error) {
      logger.error('Failed to update category', error);
      throw error;
    }
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    try {
      const categories = await this.getCategories();
      const filtered = categories.filter(c => c.id !== categoryId);
      
      if (filtered.length === 0) {
        throw new Error('Cannot delete the last category');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
      logger.success(`Category deleted: ${categoryId}`);
    } catch (error) {
      logger.error('Failed to delete category', error);
      throw error;
    }
  }

  static async getGoals(): Promise<Goal[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      const goals = data ? JSON.parse(data) : [];
      logger.info(`Loaded ${goals.length} goals`);
      return goals;
    } catch (error) {
      logger.error('Failed to get goals', error);
      return [];
    }
  }

  static async saveGoal(goal: Goal): Promise<void> {
    try {
      const goals = await this.getGoals();
      goals.push(goal);
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      logger.success(`Goal saved: ${goal.title}`);
    } catch (error) {
      logger.error('Failed to save goal', error);
      throw error;
    }
  }

  static async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    try {
      const goals = await this.getGoals();
      const index = goals.findIndex(g => g.id === goalId);
      
      if (index === -1) {
        throw new Error(`Goal not found: ${goalId}`);
      }

      goals[index] = {
        ...goals[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      logger.success(`Goal updated: ${goalId}`);
    } catch (error) {
      logger.error('Failed to update goal', error);
      throw error;
    }
  }

  static async deleteGoal(goalId: string): Promise<void> {
    try {
      const goals = await this.getGoals();
      const filtered = goals.filter(g => g.id !== goalId);
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filtered));
      logger.success(`Goal deleted: ${goalId}`);
    } catch (error) {
      logger.error('Failed to delete goal', error);
      throw error;
    }
  }

  static async getAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      const achievements = data ? JSON.parse(data) : [];
      logger.info(`Loaded ${achievements.length} achievements`);
      return achievements;
    } catch (error) {
      logger.error('Failed to get achievements', error);
      return [];
    }
  }

  static async saveAchievement(achievement: Achievement): Promise<void> {
    try {
      const achievements = await this.getAchievements();
      
      const existingIndex = achievements.findIndex(a => a.id === achievement.id);
      
      if (existingIndex >= 0) {
        achievements[existingIndex] = achievement;
      } else {
        achievements.push(achievement);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
      logger.success(`Achievement saved: ${achievement.title}`);
    } catch (error) {
      logger.error('Failed to save achievement', error);
      throw error;
    }
  }

  static async updateAchievement(achievementId: string, updates: Partial<Achievement>): Promise<void> {
    try {
      const achievements = await this.getAchievements();
      const index = achievements.findIndex(a => a.id === achievementId);
      
      if (index === -1) {
        throw new Error(`Achievement not found: ${achievementId}`);
      }

      achievements[index] = { ...achievements[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
      logger.success(`Achievement updated: ${achievementId}`);
    } catch (error) {
      logger.error('Failed to update achievement', error);
      throw error;
    }
  }

  static async deleteAchievement(achievementId: string): Promise<void> {
    try {
      const achievements = await this.getAchievements();
      const filtered = achievements.filter(a => a.id !== achievementId);
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(filtered));
      logger.success(`Achievement deleted: ${achievementId}`);
    } catch (error) {
      logger.error('Failed to delete achievement', error);
      throw error;
    }
  }

  static async getDashboardPreferences(): Promise<DashboardPreferences> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DASHBOARD_PREFERENCES);
      const preferences = data ? JSON.parse(data) : { visibleCategoryIds: [] };
      logger.info('Loaded dashboard preferences');
      return preferences;
    } catch (error) {
      logger.error('Failed to get dashboard preferences', error);
      return { visibleCategoryIds: [] };
    }
  }

  static async saveDashboardPreferences(preferences: DashboardPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DASHBOARD_PREFERENCES, JSON.stringify(preferences));
      logger.success('Dashboard preferences saved');
    } catch (error) {
      logger.error('Failed to save dashboard preferences', error);
      throw error;
    }
  }

  static async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
      if (!data) return null;
      
      const preferences = JSON.parse(data);
      logger.info('Loaded notification preferences');
      return preferences;
    } catch (error) {
      logger.error('Failed to get notification preferences', error);
      return null;
    }
  }

  static async saveNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES, JSON.stringify(preferences));
      logger.success('Notification preferences saved');
    } catch (error) {
      logger.error('Failed to save notification preferences', error);
      throw error;
    }
  }

  static async getAllData(): Promise<{
    sessions: Session[];
    categories: Category[];
    goals: Goal[];
    achievements: Achievement[];
    preferences: DashboardPreferences;
    notificationPreferences: NotificationPreferences | null;
    version: string;
  }> {
    try {
      const [
        sessions,
        categories,
        goals,
        achievements,
        preferences,
        notificationPreferences,
      ] = await Promise.all([
        this.getSessions(),
        this.getCategories(),
        this.getGoals(),
        this.getAchievements(),
        this.getDashboardPreferences(),
        this.getNotificationPreferences(),
      ]);

      logger.info('Loaded all data for export');

      return {
        sessions,
        categories,
        goals,
        achievements,
        preferences,
        notificationPreferences,
        version: '1.0.0',
      };
    } catch (error) {
      logger.error('Failed to get all data', error);
      throw error;
    }
  }

  static async restoreAllData(data: {
    sessions?: Session[];
    categories?: Category[];
    goals?: Goal[];
    achievements?: Achievement[];
    preferences?: DashboardPreferences;
    notificationPreferences?: NotificationPreferences;
  }): Promise<void> {
    try {
      logger.info('Starting data restore...');

      const backup = await this.getAllData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.BACKUP_PREFIX}${timestamp}`,
        JSON.stringify(backup)
      );
      logger.info('Backup created before restore');

      const restorePromises: Promise<void>[] = [];

      if (data.sessions) {
        restorePromises.push(
          AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions))
        );
      }

      if (data.categories) {
        restorePromises.push(
          AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories))
        );
      }

      if (data.goals) {
        restorePromises.push(
          AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data.goals))
        );
      }

      if (data.achievements) {
        restorePromises.push(
          AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(data.achievements))
        );
      }

      if (data.preferences) {
        restorePromises.push(
          AsyncStorage.setItem(STORAGE_KEYS.DASHBOARD_PREFERENCES, JSON.stringify(data.preferences))
        );
      }

      if (data.notificationPreferences) {
        restorePromises.push(
          AsyncStorage.setItem(
            STORAGE_KEYS.NOTIFICATION_PREFERENCES,
            JSON.stringify(data.notificationPreferences)
          )
        );
      }

      await Promise.all(restorePromises);
      logger.success('Data restored successfully');
    } catch (error) {
      logger.error('Failed to restore data', error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      logger.warn('Clearing all app data...');

      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.CATEGORIES),
        AsyncStorage.removeItem(STORAGE_KEYS.GOALS),
        AsyncStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS),
        AsyncStorage.removeItem(STORAGE_KEYS.DASHBOARD_PREFERENCES),
        AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES),
      ]);

      logger.success('All data cleared');
    } catch (error) {
      logger.error('Failed to clear all data', error);
      throw error;
    }
  }

  static async getStorageSize(): Promise<{ keys: number; estimatedSizeKB: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => key.startsWith('@session_track:') || key.startsWith('@trackora:'));
      
      let totalSize = 0;
      for (const key of appKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        keys: appKeys.length,
        estimatedSizeKB: Math.round(totalSize / 1024),
      };
    } catch (error) {
      logger.error('Failed to get storage size', error);
      return { keys: 0, estimatedSizeKB: 0 };
    }
  }

  static async isEmpty(): Promise<boolean> {
    try {
      const sessions = await this.getSessions();
      return sessions.length === 0;
    } catch (error) {
      logger.error('Failed to check if storage is empty', error);
      return true;
    }
  }
}

export default StorageService;