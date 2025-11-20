import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Session,
  Category,
  Goal,
  Achievement,
  DashboardPreferences,
  NotificationPreferences,
  SessionTemplate,
} from "../types";
import { logger } from "./logger";
import { STORAGE_KEYS, APP_CONFIG } from "../config/constants";

export class StorageService {
  private static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    operation: string,
    retries = APP_CONFIG.STORAGE_RETRY_ATTEMPTS
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < retries - 1) {
          const delay =
            APP_CONFIG.STORAGE_RETRY_DELAY_BASE_MS *
            Math.pow(APP_CONFIG.STORAGE_RETRY_MULTIPLIER, attempt);
          logger.warn(
            `${operation} failed (attempt ${
              attempt + 1
            }/${retries}), retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    logger.error(`${operation} failed after ${retries} attempts`, lastError);
    throw lastError || new Error(`${operation} failed`);
  }

  static async initialize(): Promise<void> {
    try {
      logger.info("Initializing StorageService...");

      await this.retryWithBackoff(async () => {
        const version = await AsyncStorage.getItem(
          STORAGE_KEYS.STORAGE_VERSION
        );
        if (!version) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.STORAGE_VERSION,
            APP_CONFIG.STORAGE_VERSION.toString()
          );
        }
      }, "Storage initialization");

      logger.success("StorageService initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize StorageService", error);
      throw error;
    }
  }

  // --- Session Methods ---

  static async getSessions(): Promise<Session[]> {
    return this.retryWithBackoff(async () => {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      const sessions = data ? JSON.parse(data) : [];
      logger.info(`Loaded ${sessions.length} sessions`);
      return sessions;
    }, "Get sessions").catch(() => {
      logger.warn("Failed to load sessions, returning empty array");
      return [];
    });
  }

  static async saveSession(session: Session): Promise<void> {
    return this.retryWithBackoff(async () => {
      const sessions = await this.getSessions();
      sessions.push(session);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(sessions)
      );
      logger.success(`Session saved: ${session.id}`);
    }, "Save session");
  }

  static async updateSession(
    sessionId: string,
    updates: Partial<Session>
  ): Promise<void> {
    return this.retryWithBackoff(async () => {
      const sessions = await this.getSessions();
      const index = sessions.findIndex((s) => s.id === sessionId);

      if (index === -1) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      sessions[index] = {
        ...sessions[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(sessions)
      );
      logger.success(`Session updated: ${sessionId}`);
    }, "Update session");
  }

  static async deleteSession(sessionId: string): Promise<void> {
    return this.retryWithBackoff(async () => {
      const sessions = await this.getSessions();
      const filtered = sessions.filter((s) => s.id !== sessionId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(filtered)
      );
      logger.success(`Session deleted: ${sessionId}`);
    }, "Delete session");
  }

  static async clearAllSessions(): Promise<void> {
    return this.retryWithBackoff(async () => {
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS);
      logger.warn("All sessions cleared");
    }, "Clear all sessions");
  }

  // --- Category Methods ---

  static async getCategories(): Promise<Category[]> {
    return this.retryWithBackoff(async () => {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const categories = data ? JSON.parse(data) : [];
      logger.info(`Loaded ${categories.length} categories`);
      return categories;
    }, "Get categories").catch(() => {
      logger.warn("Failed to load categories, returning empty array");
      return [];
    });
  }

  static async saveCategory(category: Category): Promise<void> {
    return this.retryWithBackoff(async () => {
      const categories = await this.getCategories();
      categories.unshift(category);
      await AsyncStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(categories)
      );
      logger.success(`Category saved: ${category.name}`);
    }, "Save category");
  }

  static async updateCategory(
    categoryId: string,
    updates: Partial<Category>
  ): Promise<void> {
    return this.retryWithBackoff(async () => {
      const categories = await this.getCategories();
      const index = categories.findIndex((c) => c.id === categoryId);

      if (index === -1) {
        throw new Error(`Category not found: ${categoryId}`);
      }

      categories[index] = { ...categories[index], ...updates };
      await AsyncStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(categories)
      );
      logger.success(`Category updated: ${categoryId}`);
    }, "Update category");
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    return this.retryWithBackoff(async () => {
      const categories = await this.getCategories();
      const filtered = categories.filter((c) => c.id !== categoryId);

      if (filtered.length === 0) {
        throw new Error("Cannot delete the last category");
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(filtered)
      );
      logger.success(`Category deleted: ${categoryId}`);
    }, "Delete category");
  }

  static async hasCategoryInUse(categoryId: string): Promise<boolean> {
    const sessions = await this.getSessions();
    return sessions.some((s) => s.categoryId === categoryId);
  }

  // --- Goal Methods ---

  static async getGoals(): Promise<Goal[]> {
    return this.retryWithBackoff(async () => {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      const goals = data ? JSON.parse(data) : [];
      logger.info(`Loaded ${goals.length} goals`);
      return goals;
    }, "Get goals").catch(() => {
      logger.warn("Failed to load goals, returning empty array");
      return [];
    });
  }

  static async saveGoal(goal: Goal): Promise<void> {
    return this.retryWithBackoff(async () => {
      const goals = await this.getGoals();
      goals.push(goal);
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      logger.success(`Goal saved: ${goal.title}`);
    }, "Save goal");
  }

  static async updateGoal(
    goalId: string,
    updates: Partial<Goal>
  ): Promise<void> {
    return this.retryWithBackoff(async () => {
      const goals = await this.getGoals();
      const index = goals.findIndex((g) => g.id === goalId);

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
    }, "Update goal");
  }

  static async deleteGoal(goalId: string): Promise<void> {
    return this.retryWithBackoff(async () => {
      const goals = await this.getGoals();
      const filtered = goals.filter((g) => g.id !== goalId);
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filtered));
      logger.success(`Goal deleted: ${goalId}`);
    }, "Delete goal");
  }

  static async clearAllGoals(): Promise<void> {
    return this.retryWithBackoff(async () => {
      await AsyncStorage.removeItem(STORAGE_KEYS.GOALS);
      logger.warn("All goals cleared");
    }, "Clear all goals");
  }

  // --- Template Methods ---

  static async getTemplates(): Promise<SessionTemplate[]> {
    return this.retryWithBackoff(async () => {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES);
      const templates = data ? JSON.parse(data) : [];
      logger.info(`Loaded ${templates.length} templates`);
      return templates;
    }, "Get templates").catch(() => {
      logger.warn("Failed to load templates, returning empty array");
      return [];
    });
  }

  static async saveTemplate(template: SessionTemplate): Promise<void> {
    return this.retryWithBackoff(async () => {
      const templates = await this.getTemplates();

      const existingIndex = templates.findIndex((t) => t.id === template.id);
      if (existingIndex !== -1) {
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.TEMPLATES,
        JSON.stringify(templates)
      );
      logger.success(`Template saved: ${template.name}`);
    }, "Save template");
  }

  static async updateTemplate(
    templateId: string,
    updates: Partial<SessionTemplate>
  ): Promise<void> {
    return this.retryWithBackoff(async () => {
      const templates = await this.getTemplates();
      const index = templates.findIndex((t) => t.id === templateId);

      if (index === -1) {
        throw new Error(`Template not found: ${templateId}`);
      }

      templates[index] = { ...templates[index], ...updates };
      await AsyncStorage.setItem(
        STORAGE_KEYS.TEMPLATES,
        JSON.stringify(templates)
      );
      logger.success(`Template updated: ${templateId}`);
    }, "Update template");
  }

  static async deleteTemplate(templateId: string): Promise<void> {
    return this.retryWithBackoff(async () => {
      const templates = await this.getTemplates();
      const filtered = templates.filter((t) => t.id !== templateId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.TEMPLATES,
        JSON.stringify(filtered)
      );
      logger.success(`Template deleted: ${templateId}`);
    }, "Delete template");
  }

  // --- Achievement Methods ---

  static async getAchievements(): Promise<Achievement[]> {
    return this.retryWithBackoff(async () => {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      const achievements = data ? JSON.parse(data) : [];
      logger.info(`Loaded ${achievements.length} achievements`);
      return achievements;
    }, "Get achievements").catch(() => {
      logger.warn("Failed to load achievements, returning empty array");
      return [];
    });
  }

  static async saveAchievement(achievement: Achievement): Promise<void> {
    return this.retryWithBackoff(async () => {
      const achievements = await this.getAchievements();

      // Check if achievement already exists to prevent duplicates
      const existingIndex = achievements.findIndex(
        (a) => a.id === achievement.id
      );

      if (existingIndex !== -1) {
        // Update existing achievement instead of creating duplicate
        achievements[existingIndex] = achievement;
        logger.info(
          `Achievement updated (already exists): ${achievement.title}`
        );
      } else {
        // Add new achievement
        achievements.push(achievement);
        logger.success(`Achievement saved: ${achievement.title}`);
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(achievements)
      );
    }, "Save achievement");
  }

  static async deduplicateAchievements(): Promise<void> {
    return this.retryWithBackoff(async () => {
      const achievements = await this.getAchievements();
      const uniqueAchievements = achievements.reduce((acc, current) => {
        const exists = acc.find((item) => item.id === current.id);
        if (!exists) {
          acc.push(current);
        } else {
          // Keep the one with more progress
          const existingIndex = acc.findIndex((item) => item.id === current.id);
          if (
            current.progress > acc[existingIndex].progress ||
            current.isUnlocked
          ) {
            acc[existingIndex] = current;
          }
        }
        return acc;
      }, [] as Achievement[]);

      if (uniqueAchievements.length !== achievements.length) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.ACHIEVEMENTS,
          JSON.stringify(uniqueAchievements)
        );
        logger.success(
          `Deduplicated achievements: ${achievements.length} -> ${uniqueAchievements.length}`
        );
      }
    }, "Deduplicate achievements");
  }

  static async updateAchievement(
    achievementId: string,
    updates: Partial<Achievement>
  ): Promise<void> {
    return this.retryWithBackoff(async () => {
      const achievements = await this.getAchievements();
      const index = achievements.findIndex((a) => a.id === achievementId);

      if (index === -1) {
        throw new Error(`Achievement not found: ${achievementId}`);
      }

      achievements[index] = { ...achievements[index], ...updates };
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(achievements)
      );
      logger.success(`Achievement updated: ${achievementId}`);
    }, "Update achievement");
  }

  static async deleteAchievement(achievementId: string): Promise<void> {
    return this.retryWithBackoff(async () => {
      const achievements = await this.getAchievements();
      const filtered = achievements.filter((a) => a.id !== achievementId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(filtered)
      );
      logger.success(`Achievement deleted: ${achievementId}`);
    }, "Delete achievement");
  }

  // --- Preference Methods ---

  static async getDashboardPreferences(): Promise<DashboardPreferences> {
    return this.retryWithBackoff(async () => {
      const data = await AsyncStorage.getItem(
        STORAGE_KEYS.DASHBOARD_PREFERENCES
      );
      const preferences = data ? JSON.parse(data) : { visibleCategoryIds: [] };
      logger.info("Loaded dashboard preferences");
      return preferences;
    }, "Get dashboard preferences").catch(() => {
      logger.warn("Failed to load dashboard preferences, returning defaults");
      return { visibleCategoryIds: [] };
    });
  }

  static async saveDashboardPreferences(
    preferences: DashboardPreferences
  ): Promise<void> {
    return this.retryWithBackoff(async () => {
      await AsyncStorage.setItem(
        STORAGE_KEYS.DASHBOARD_PREFERENCES,
        JSON.stringify(preferences)
      );
      logger.success("Dashboard preferences saved");
    }, "Save dashboard preferences");
  }

  static async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    return this.retryWithBackoff(async () => {
      const data = await AsyncStorage.getItem(
        STORAGE_KEYS.NOTIFICATION_PREFERENCES
      );
      if (!data) return null;

      const preferences = JSON.parse(data);
      logger.info("Loaded notification preferences");
      return preferences;
    }, "Get notification preferences").catch(() => {
      logger.warn("Failed to load notification preferences");
      return null;
    });
  }

  static async saveNotificationPreferences(
    preferences: NotificationPreferences
  ): Promise<void> {
    return this.retryWithBackoff(async () => {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_PREFERENCES,
        JSON.stringify(preferences)
      );
      logger.success("Notification preferences saved");
    }, "Save notification preferences");
  }

  // --- Global Data Methods ---

  static async getAllData(): Promise<{
    sessions: Session[];
    categories: Category[];
    goals: Goal[];
    achievements: Achievement[];
    templates: SessionTemplate[];
    preferences: DashboardPreferences;
    notificationPreferences: NotificationPreferences | null;
    version: string;
  }> {
    try {
      const keys = [
        STORAGE_KEYS.SESSIONS,
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.GOALS,
        STORAGE_KEYS.ACHIEVEMENTS,
        STORAGE_KEYS.TEMPLATES,
        STORAGE_KEYS.DASHBOARD_PREFERENCES,
        STORAGE_KEYS.NOTIFICATION_PREFERENCES,
      ];

      const results = await AsyncStorage.multiGet(keys);

      const data = {
        sessions: results[0][1] ? JSON.parse(results[0][1]) : [],
        categories: results[1][1] ? JSON.parse(results[1][1]) : [],
        goals: results[2][1] ? JSON.parse(results[2][1]) : [],
        achievements: results[3][1] ? JSON.parse(results[3][1]) : [],
        templates: results[4][1] ? JSON.parse(results[4][1]) : [],
        preferences: results[5][1]
          ? JSON.parse(results[5][1])
          : { visibleCategoryIds: [] },
        notificationPreferences: results[6][1]
          ? JSON.parse(results[6][1])
          : null,
        version: "1.0.0",
      };

      logger.info("Loaded all data for export");
      return data;
    } catch (error) {
      logger.error("Failed to get all data", error);
      throw error;
    }
  }

  static async restoreAllData(data: {
    sessions?: Session[];
    categories?: Category[];
    goals?: Goal[];
    achievements?: Achievement[];
    templates?: SessionTemplate[];
    preferences?: DashboardPreferences;
    notificationPreferences?: NotificationPreferences;
  }): Promise<void> {
    try {
      logger.info("Starting data restore...");

      const backup = await this.getAllData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.BACKUP_PREFIX}${timestamp}`,
        JSON.stringify(backup)
      );
      logger.info("Backup created before restore");

      const entries: [string, string][] = [];

      if (data.sessions) {
        entries.push([STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions)]);
      }

      if (data.categories) {
        entries.push([
          STORAGE_KEYS.CATEGORIES,
          JSON.stringify(data.categories),
        ]);
      }

      if (data.goals) {
        entries.push([STORAGE_KEYS.GOALS, JSON.stringify(data.goals)]);
      }

      if (data.achievements) {
        entries.push([
          STORAGE_KEYS.ACHIEVEMENTS,
          JSON.stringify(data.achievements),
        ]);
      }

      if (data.templates) {
        entries.push([
          STORAGE_KEYS.TEMPLATES,
          JSON.stringify(data.templates),
        ]);
      }

      if (data.preferences) {
        entries.push([
          STORAGE_KEYS.DASHBOARD_PREFERENCES,
          JSON.stringify(data.preferences),
        ]);
      }

      if (data.notificationPreferences) {
        entries.push([
          STORAGE_KEYS.NOTIFICATION_PREFERENCES,
          JSON.stringify(data.notificationPreferences),
        ]);
      }

      await AsyncStorage.multiSet(entries);
      logger.success("Data restored successfully");
    } catch (error) {
      logger.error("Failed to restore data", error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      logger.warn("Creating backup before clearing all data...");

      const backup = await this.getAllData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.BACKUP_PREFIX}${timestamp}`,
        JSON.stringify(backup)
      );

      const keys = [
        STORAGE_KEYS.SESSIONS,
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.GOALS,
        STORAGE_KEYS.ACHIEVEMENTS,
        STORAGE_KEYS.TEMPLATES,
        STORAGE_KEYS.DASHBOARD_PREFERENCES,
        STORAGE_KEYS.NOTIFICATION_PREFERENCES,
      ];

      await AsyncStorage.multiRemove(keys);
      logger.success("All data cleared (backup created)");
    } catch (error) {
      logger.error("Failed to clear all data", error);
      throw error;
    }
  }

  static async getStorageSize(): Promise<{
    keys: number;
    estimatedSizeKB: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(
        (key) => key.startsWith("@flowtrix:") || key.startsWith("@trackora:")
      );

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
      logger.error("Failed to get storage size", error);
      return { keys: 0, estimatedSizeKB: 0 };
    }
  }

  static async isEmpty(): Promise<boolean> {
    try {
      const sessions = await this.getSessions();
      return sessions.length === 0;
    } catch (error) {
      logger.error("Failed to check if storage is empty", error);
      return true;
    }
  }
}

export default StorageService;