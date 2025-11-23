import { create } from 'zustand';
import { NotificationService, NotificationHistoryItem, NotificationPreferences } from '../services/NotificationService';
import { logger } from '../services/logger';

interface NotificationState {
  preferences: NotificationPreferences | null;
  history: NotificationHistoryItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  loadPreferences: () => Promise<void>;
  savePreferences: (preferences: NotificationPreferences) => Promise<void>;
  updatePreference: <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => Promise<void>;

  loadHistory: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAsDismissed: (notificationId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;

  sendTestNotification: () => Promise<void>;

  clearError: () => void;
}

const useNotificationStoreBase = create<NotificationState>((set, get) => ({
  preferences: null,
  history: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  loadPreferences: async () => {
    set({ isLoading: true, error: null });
    try {
      const preferences = await NotificationService.getPreferences();
      set({ preferences, isLoading: false });
      logger.info('Notification preferences loaded');
    } catch (error) {
      logger.error('Failed to load notification preferences', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load preferences',
        isLoading: false,
      });
    }
  },

  savePreferences: async (preferences: NotificationPreferences) => {
    set({ isLoading: true, error: null });
    try {
      await NotificationService.savePreferences(preferences);
      set({ preferences, isLoading: false });
      logger.success('Notification preferences saved');
    } catch (error) {
      logger.error('Failed to save notification preferences', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to save preferences',
        isLoading: false,
      });
      throw error;
    }
  },

  updatePreference: async <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    const { preferences } = get();
    if (!preferences) {
      await get().loadPreferences();
      return;
    }

    const updated = { ...preferences, [key]: value };
    await get().savePreferences(updated);
  },

  loadHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const history = await NotificationService.getHistory();
      const unreadCount = await NotificationService.getUnreadCount();
      
      set({ 
        history, 
        unreadCount,
        isLoading: false 
      });
      
      logger.info(`Loaded ${history.length} notifications`);
    } catch (error) {
      logger.error('Failed to load notification history', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load history',
        isLoading: false,
      });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      
      const { history } = get();
      const updated = history.map(item =>
        item.id === notificationId ? { ...item, read: true } : item
      );
      
      const unreadCount = updated.filter(item => !item.read && !item.dismissed).length;
      
      set({ 
        history: updated, 
        unreadCount
      });
      
      logger.info('Notification marked as read');
    } catch (error) {
      logger.error('Failed to mark notification as read', error);
    }
  },

  markAsDismissed: async (notificationId: string) => {
    try {
      await NotificationService.markAsDismissed(notificationId);
      
      const { history } = get();
      const updated = history.map(item =>
        item.id === notificationId ? { ...item, dismissed: true } : item
      );
      
      const unreadCount = updated.filter(item => !item.read && !item.dismissed).length;
      
      set({ 
        history: updated, 
        unreadCount
      });
      
      logger.info('Notification marked as dismissed');
    } catch (error) {
      logger.error('Failed to mark notification as dismissed', error);
    }
  },

  clearHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      await NotificationService.clearHistory();
      
      set({ 
        history: [], 
        unreadCount: 0,
        isLoading: false 
      });
      
      logger.success('Notification history cleared');
    } catch (error) {
      logger.error('Failed to clear notification history', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to clear history',
        isLoading: false,
      });
      throw error;
    }
  },

  refreshUnreadCount: async () => {
    try {
      const unreadCount = await NotificationService.getUnreadCount();
      set({ unreadCount });
    } catch (error) {
      logger.error('Failed to refresh unread count', error);
    }
  },

  sendTestNotification: async () => {
    try {
      await NotificationService.sendTestNotification();
      
      setTimeout(async () => {
        await get().loadHistory();
      }, 1000);
      
      logger.success('Test notification sent');
    } catch (error) {
      logger.error('Failed to send test notification', error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export const useNotificationPreferences = () =>
  useNotificationStoreBase((state) => state.preferences);

export const useNotificationHistory = () =>
  useNotificationStoreBase((state) => state.history);

export const useUnreadNotificationCount = () =>
  useNotificationStoreBase((state) => state.unreadCount);

export const useNotificationsLoading = () =>
  useNotificationStoreBase((state) => state.isLoading);

export const useNotificationsError = () =>
  useNotificationStoreBase((state) => state.error);

export const useLoadNotificationPreferences = () =>
  useNotificationStoreBase((state) => state.loadPreferences);

export const useSaveNotificationPreferences = () =>
  useNotificationStoreBase((state) => state.savePreferences);

export const useUpdateNotificationPreference = () =>
  useNotificationStoreBase((state) => state.updatePreference);

export const useLoadNotificationHistory = () =>
  useNotificationStoreBase((state) => state.loadHistory);

export const useMarkNotificationAsRead = () =>
  useNotificationStoreBase((state) => state.markAsRead);

export const useMarkNotificationAsDismissed = () =>
  useNotificationStoreBase((state) => state.markAsDismissed);

export const useClearNotificationHistory = () =>
  useNotificationStoreBase((state) => state.clearHistory);

export const useRefreshUnreadCount = () =>
  useNotificationStoreBase((state) => state.refreshUnreadCount);

export const useSendTestNotification = () =>
  useNotificationStoreBase((state) => state.sendTestNotification);

export const useClearNotificationError = () =>
  useNotificationStoreBase((state) => state.clearError);

export const useNotificationStore = useNotificationStoreBase;