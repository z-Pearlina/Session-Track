import { create } from 'zustand';
import { StorageService } from '../services/StorageService';
import { DashboardPreferences } from '../types';
import { logger } from '../services/logger';

const MAX_VISIBLE_CATEGORIES = 4;

interface DashboardState {
  preferences: DashboardPreferences;
  isLoading: boolean;
  error: string | null;
  maxVisibleCategories: number;
  
  loadPreferences: () => Promise<void>;
  setVisibleCategories: (categoryIds: string[]) => Promise<void>;
  toggleCategoryVisibility: (categoryId: string) => Promise<boolean>;
  clearError: () => void;
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  visibleCategoryIds: ['work', 'study'],
};

const useDashboardStoreBase = create<DashboardState>((set, get) => ({
  preferences: DEFAULT_PREFERENCES,
  isLoading: false,
  error: null,
  maxVisibleCategories: MAX_VISIBLE_CATEGORIES,

  loadPreferences: async () => {
    set({ isLoading: true, error: null });
    try {
      const preferences = await StorageService.getDashboardPreferences();
      
      if (!preferences || preferences.visibleCategoryIds.length === 0) {
        await StorageService.saveDashboardPreferences(DEFAULT_PREFERENCES);
        set({ preferences: DEFAULT_PREFERENCES, isLoading: false });
        logger.info('Initialized default dashboard preferences');
      } else {
        set({ preferences, isLoading: false });
        logger.info('Loaded dashboard preferences');
      }
    } catch (error) {
      logger.error('Failed to load dashboard preferences', error);
      set({ 
        preferences: DEFAULT_PREFERENCES,
        error: error instanceof Error ? error.message : 'Failed to load dashboard preferences',
        isLoading: false 
      });
    }
  },

  setVisibleCategories: async (categoryIds: string[]) => {
    set({ isLoading: true, error: null });
    const limitedIds = categoryIds.slice(0, MAX_VISIBLE_CATEGORIES);
    const preferences: DashboardPreferences = {
      visibleCategoryIds: limitedIds,
    };
    
    try {
      await StorageService.saveDashboardPreferences(preferences);
      set({ preferences, isLoading: false });
      logger.success('Dashboard preferences saved');
    } catch (error) {
      logger.error('Failed to save dashboard preferences', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save dashboard preferences',
        isLoading: false 
      });
    }
  },

  toggleCategoryVisibility: async (categoryId: string) => {
    const { preferences } = get();
    const { visibleCategoryIds } = preferences;
    
    let updatedIds: string[];
    if (visibleCategoryIds.includes(categoryId)) {
      updatedIds = visibleCategoryIds.filter(id => id !== categoryId);
      await get().setVisibleCategories(updatedIds);
      logger.info(`Category removed from dashboard: ${categoryId}`);
      return true;
    } else {
      if (visibleCategoryIds.length >= MAX_VISIBLE_CATEGORIES) {
        logger.warn('Cannot add more categories - limit reached');
        return false;
      }
      updatedIds = [...visibleCategoryIds, categoryId];
      await get().setVisibleCategories(updatedIds);
      logger.info(`Category added to dashboard: ${categoryId}`);
      return true;
    }
  },

  clearError: () => set({ error: null }),
}));

// ✅ FIXED: Simple selectors only
export const useDashboardPreferences = () => useDashboardStoreBase((state) => state.preferences);
export const useVisibleCategoryIds = () => useDashboardStoreBase((state) => state.preferences.visibleCategoryIds);
export const useDashboardLoading = () => useDashboardStoreBase((state) => state.isLoading);
export const useDashboardError = () => useDashboardStoreBase((state) => state.error);
export const useMaxVisibleCategories = () => useDashboardStoreBase((state) => state.maxVisibleCategories);

// ✅ FIXED: Return individual functions, not objects
export const useLoadDashboardPreferences = () => useDashboardStoreBase((state) => state.loadPreferences);
export const useSetVisibleCategories = () => useDashboardStoreBase((state) => state.setVisibleCategories);
export const useToggleCategoryVisibility = () => useDashboardStoreBase((state) => state.toggleCategoryVisibility);
export const useClearDashboardError = () => useDashboardStoreBase((state) => state.clearError);

export const useDashboardStore = useDashboardStoreBase;