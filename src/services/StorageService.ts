import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, Category, DashboardPreferences } from '../types';

const STORAGE_KEYS = {
  SESSIONS: '@sessions',
  CATEGORIES: '@categories',
  PREFERENCES: '@preferences',
  VERSION: '@storage_version',
  BACKUP: '@backup',
} as const;

const CURRENT_VERSION = 1;

const isValidSession = (data: any): data is Session => {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.categoryId === 'string' &&
    typeof data.startedAt === 'string' &&
    typeof data.durationMs === 'number' &&
    data.durationMs >= 0
  );
};

const isValidCategory = (data: any): data is Category => {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.icon === 'string' &&
    typeof data.color === 'string' &&
    typeof data.createdAt === 'string' &&
    typeof data.isDefault === 'boolean'
  );
};

const isValidPreferences = (data: any): data is DashboardPreferences => {
  return (
    typeof data === 'object' &&
    Array.isArray(data.visibleCategoryIds) &&
    data.visibleCategoryIds.every((id: any) => typeof id === 'string')
  );
};

export class StorageService {
  static async initialize(): Promise<void> {
    try {
      await this.checkAndMigrate();
      console.log('✅ Storage initialized successfully');
    } catch (error) {
      console.error('❌ Storage initialization failed:', error);
      throw new Error('Failed to initialize storage');
    }
  }

  private static async checkAndMigrate(): Promise<void> {
    try {
      const versionStr = await AsyncStorage.getItem(STORAGE_KEYS.VERSION);
      const currentVersion = versionStr ? parseInt(versionStr, 10) : 0;

      if (currentVersion < CURRENT_VERSION) {
        console.log(`🔄 Migrating from version ${currentVersion} to ${CURRENT_VERSION}`);
        await this.migrate(currentVersion, CURRENT_VERSION);
        await AsyncStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION.toString());
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  private static async migrate(fromVersion: number, toVersion: number): Promise<void> {
    console.log(`Migration from ${fromVersion} to ${toVersion} complete`);
  }

  private static async createBackup(key: string, data: any): Promise<void> {
    try {
      const backupKey = `${STORAGE_KEYS.BACKUP}_${key}_${Date.now()}`;
      await AsyncStorage.setItem(backupKey, JSON.stringify(data));
      
      const allKeys = await AsyncStorage.getAllKeys();
      const backupKeys = allKeys
        .filter(k => k.startsWith(`${STORAGE_KEYS.BACKUP}_${key}`))
        .sort()
        .reverse();
      
      if (backupKeys.length > 3) {
        await AsyncStorage.multiRemove(backupKeys.slice(3));
      }
    } catch (error) {
      console.warn('Backup creation failed:', error);
    }
  }

  private static async safeRead<T>(
    key: string,
    validator: (data: any) => data is T,
    defaultValue: T
  ): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(key);
      
      if (!raw) {
        return defaultValue;
      }

      const parsed = JSON.parse(raw);
      
      if (Array.isArray(defaultValue)) {
        if (!Array.isArray(parsed)) {
          console.error(`Invalid data type for ${key}: expected array`);
          return defaultValue;
        }
        
        const validItems = parsed.filter(item => {
          const isValid = validator(item);
          if (!isValid) {
            console.warn(`Invalid item in ${key}:`, item);
          }
          return isValid;
        });
        
        return validItems as T;
      } else {
        if (!validator(parsed)) {
          console.error(`Invalid data structure for ${key}`);
          return defaultValue;
        }
        return parsed;
      }
    } catch (error) {
      console.error(`Failed to read ${key}:`, error);
      return defaultValue;
    }
  }

  private static async safeWrite(key: string, data: any): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(key);
      if (existing) {
        await this.createBackup(key, JSON.parse(existing));
      }

      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to write ${key}:`, error);
      throw new Error(`Storage write failed for ${key}`);
    }
  }

  static async getSessions(): Promise<Session[]> {
    const data = await this.safeRead<Session[]>(
      STORAGE_KEYS.SESSIONS,
      (data: any): data is Session[] => Array.isArray(data) && data.every(isValidSession),
      []
    );
    return data;
  }

  static async saveSession(session: Session): Promise<void> {
    if (!isValidSession(session)) {
      throw new Error('Invalid session data');
    }

    const sessions = await this.getSessions();
    
    if (sessions.some(s => s.id === session.id)) {
      throw new Error('Session with this ID already exists');
    }

    sessions.push(session);
    await this.safeWrite(STORAGE_KEYS.SESSIONS, sessions);
  }

  static async updateSession(sessionId: string, updates: Partial<Session>): Promise<void> {
    const sessions = await this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);

    if (index === -1) {
      throw new Error('Session not found');
    }

    const updatedSession = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (!isValidSession(updatedSession)) {
      throw new Error('Invalid session data after update');
    }

    sessions[index] = updatedSession;
    await this.safeWrite(STORAGE_KEYS.SESSIONS, sessions);
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const sessions = await this.getSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);

    if (filtered.length === sessions.length) {
      throw new Error('Session not found');
    }

    await this.safeWrite(STORAGE_KEYS.SESSIONS, filtered);
  }

  static async bulkDeleteSessions(sessionIds: string[]): Promise<void> {
    const sessions = await this.getSessions();
    const idSet = new Set(sessionIds);
    const filtered = sessions.filter(s => !idSet.has(s.id));
    await this.safeWrite(STORAGE_KEYS.SESSIONS, filtered);
  }

  static async getCategories(): Promise<Category[]> {
    const data = await this.safeRead<Category[]>(
      STORAGE_KEYS.CATEGORIES,
      (data: any): data is Category[] => Array.isArray(data) && data.every(isValidCategory),
      []
    );
    return data;
  }

  static async saveCategory(category: Category): Promise<void> {
    if (!isValidCategory(category)) {
      throw new Error('Invalid category data');
    }

    const categories = await this.getCategories();
    
    if (categories.some(c => c.id === category.id)) {
      throw new Error('Category with this ID already exists');
    }

    categories.push(category);
    await this.safeWrite(STORAGE_KEYS.CATEGORIES, categories);
  }

  static async updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
    const categories = await this.getCategories();
    const index = categories.findIndex(c => c.id === categoryId);

    if (index === -1) {
      throw new Error('Category not found');
    }

    const updatedCategory = {
      ...categories[index],
      ...updates,
    };

    if (!isValidCategory(updatedCategory)) {
      throw new Error('Invalid category data after update');
    }

    categories[index] = updatedCategory;
    await this.safeWrite(STORAGE_KEYS.CATEGORIES, categories);
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    const categories = await this.getCategories();
    const category = categories.find(c => c.id === categoryId);

    if (!category) {
      throw new Error('Category not found');
    }

    if (category.isDefault) {
      throw new Error('Cannot delete default category');
    }

    const sessions = await this.getSessions();
    const isInUse = sessions.some(s => s.categoryId === categoryId);
    
    if (isInUse) {
      throw new Error('Cannot delete category that is in use by sessions');
    }

    const filtered = categories.filter(c => c.id !== categoryId);
    await this.safeWrite(STORAGE_KEYS.CATEGORIES, filtered);
  }

  static async getPreferences(): Promise<DashboardPreferences> {
    return this.safeRead<DashboardPreferences>(
      STORAGE_KEYS.PREFERENCES,
      isValidPreferences,
      { visibleCategoryIds: [] }
    );
  }

  static async savePreferences(preferences: DashboardPreferences): Promise<void> {
    if (!isValidPreferences(preferences)) {
      throw new Error('Invalid preferences data');
    }

    await this.safeWrite(STORAGE_KEYS.PREFERENCES, preferences);
  }

  static async updatePreferences(updates: Partial<DashboardPreferences>): Promise<void> {
    const current = await this.getPreferences();
    const updated = { ...current, ...updates };

    if (!isValidPreferences(updated)) {
      throw new Error('Invalid preferences data after update');
    }

    await this.safeWrite(STORAGE_KEYS.PREFERENCES, updated);
  }

  static async getStorageStats(): Promise<{
    sessionCount: number;
    categoryCount: number;
    estimatedSizeKB: number;
  }> {
    try {
      const [sessions, categories] = await Promise.all([
        this.getSessions(),
        this.getCategories(),
      ]);

      const data = JSON.stringify({ sessions, categories });
      const estimatedSizeKB = Math.round(new Blob([data]).size / 1024);

      return {
        sessionCount: sessions.length,
        categoryCount: categories.length,
        estimatedSizeKB,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { sessionCount: 0, categoryCount: 0, estimatedSizeKB: 0 };
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SESSIONS,
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.PREFERENCES,
      ]);
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw new Error('Failed to clear storage');
    }
  }

  static async getAllData(): Promise<{
    sessions: Session[];
    categories: Category[];
    preferences: DashboardPreferences;
    version: number;
  }> {
    const [sessions, categories, preferences] = await Promise.all([
      this.getSessions(),
      this.getCategories(),
      this.getPreferences(),
    ]);

    return {
      sessions,
      categories,
      preferences,
      version: CURRENT_VERSION,
    };
  }

  static async restoreAllData(data: {
    sessions: Session[];
    categories: Category[];
    preferences: DashboardPreferences;
  }): Promise<void> {
    const validSessions = data.sessions.filter(isValidSession);
    const validCategories = data.categories.filter(isValidCategory);
    
    if (!isValidPreferences(data.preferences)) {
      throw new Error('Invalid preferences data');
    }

    const currentData = await this.getAllData();
    await this.createBackup('full_backup', currentData);

    await Promise.all([
      this.safeWrite(STORAGE_KEYS.SESSIONS, validSessions),
      this.safeWrite(STORAGE_KEYS.CATEGORIES, validCategories),
      this.safeWrite(STORAGE_KEYS.PREFERENCES, data.preferences),
    ]);

    console.log(`✅ Restored ${validSessions.length} sessions and ${validCategories.length} categories`);
  }

  static async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    try {
      await Promise.all([
        this.getSessions(),
        this.getCategories(),
        this.getPreferences(),
      ]);

      return { healthy: true };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default StorageService;