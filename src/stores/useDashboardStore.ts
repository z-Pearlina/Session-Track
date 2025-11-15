import { create } from 'zustand';
import { StorageService } from '../services/StorageService';
import { DashboardPreferences } from '../types';
import { logger } from '../services/logger';

const MAX_VISIBLE_CATEGORIES = 4;

interface DashboardState {
  preferences: DashboardPreferences;
  isLoading: boolean;
  maxVisibleCategories: number;
  
  loadPreferences: () => Promise<void>;
  setVisibleCategories: (categoryIds: string[]) => Promise<void>;
  toggleCategoryVisibility: (categoryId: string) => Promise<boolean>;
  isCategoryVisible: (categoryId: string) => boolean;
  canAddMoreCategories: () => boolean;
  getRemainingSlots: () => number;
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  visibleCategoryIds: ['work', 'study'],
};

const useDashboardStoreBase = create<DashboardState>((set, get) => ({
  preferences: DEFAULT_PREFERENCES,
  isLoading: false,
  maxVisibleCategories: MAX_VISIBLE_CATEGORIES,

  loadPreferences: async () => {
    set({ isLoading: true });
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
      set({ preferences: DEFAULT_PREFERENCES, isLoading: false });
    }
  },

  setVisibleCategories: async (categoryIds: string[]) => {
    const limitedIds = categoryIds.slice(0, MAX_VISIBLE_CATEGORIES);
    const preferences: DashboardPreferences = {
      visibleCategoryIds: limitedIds,
    };
    
    try {
      await StorageService.saveDashboardPreferences(preferences);
      set({ preferences });
      logger.success('Dashboard preferences saved');
    } catch (error) {
      logger.error('Failed to save dashboard preferences', error);
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

  isCategoryVisible: (categoryId: string) => {
    const { preferences } = get();
    return preferences.visibleCategoryIds.includes(categoryId);
  },

  canAddMoreCategories: () => {
    const { preferences, maxVisibleCategories } = get();
    return preferences.visibleCategoryIds.length < maxVisibleCategories;
  },

  getRemainingSlots: () => {
    const { preferences, maxVisibleCategories } = get();
    return maxVisibleCategories - preferences.visibleCategoryIds.length;
  },
}));

export const useDashboardPreferences = () => 
  useDashboardStoreBase((state) => state.preferences);

export const useVisibleCategoryIds = () => 
  useDashboardStoreBase((state) => state.preferences.visibleCategoryIds);

export const useIsCategoryVisible = (categoryId: string) => 
  useDashboardStoreBase((state) => state.preferences.visibleCategoryIds.includes(categoryId));

export const useDashboardLoading = () => 
  useDashboardStoreBase((state) => state.isLoading);

export const useMaxVisibleCategories = () => 
  useDashboardStoreBase((state) => state.maxVisibleCategories);

export const useDashboardStats = () => 
  useDashboardStoreBase((state) => ({
    visibleCount: state.preferences.visibleCategoryIds.length,
    remainingSlots: state.maxVisibleCategories - state.preferences.visibleCategoryIds.length,
    canAddMore: state.preferences.visibleCategoryIds.length < state.maxVisibleCategories,
  }));

export const useDashboardActions = () => 
  useDashboardStoreBase((state) => ({
    loadPreferences: state.loadPreferences,
    setVisibleCategories: state.setVisibleCategories,
    toggleCategoryVisibility: state.toggleCategoryVisibility,
    isCategoryVisible: state.isCategoryVisible,
    canAddMoreCategories: state.canAddMoreCategories,
    getRemainingSlots: state.getRemainingSlots,
  }));

export const useDashboardStore = useDashboardStoreBase;