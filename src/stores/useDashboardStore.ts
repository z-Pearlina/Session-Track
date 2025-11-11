import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DASHBOARD_PREFS_KEY = '@session_track:dashboard_prefs';
const MAX_VISIBLE_CATEGORIES = 3; // Maximum 3 cards

interface DashboardPreferences {
  visibleCategoryIds: string[];
}

interface DashboardState {
  preferences: DashboardPreferences;
  isLoading: boolean;
  maxVisibleCategories: number;
  
  loadPreferences: () => Promise<void>;
  setVisibleCategories: (categoryIds: string[]) => Promise<void>;
  toggleCategoryVisibility: (categoryId: string) => Promise<boolean>; // Returns success
  isCategoryVisible: (categoryId: string) => boolean;
  canAddMoreCategories: () => boolean;
  getRemainingSlots: () => number;
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  visibleCategoryIds: ['work', 'study'], // Default visible categories
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  preferences: DEFAULT_PREFERENCES,
  isLoading: false,
  maxVisibleCategories: MAX_VISIBLE_CATEGORIES,

  loadPreferences: async () => {
    set({ isLoading: true });
    try {
      const data = await AsyncStorage.getItem(DASHBOARD_PREFS_KEY);
      const preferences = data ? JSON.parse(data) : DEFAULT_PREFERENCES;
      set({ preferences, isLoading: false });
    } catch (error) {
      console.error('Failed to load dashboard preferences:', error);
      set({ preferences: DEFAULT_PREFERENCES, isLoading: false });
    }
  },

  setVisibleCategories: async (categoryIds: string[]) => {
    // Enforce max limit
    const limitedIds = categoryIds.slice(0, MAX_VISIBLE_CATEGORIES);
    const preferences: DashboardPreferences = {
      visibleCategoryIds: limitedIds,
    };
    try {
      await AsyncStorage.setItem(DASHBOARD_PREFS_KEY, JSON.stringify(preferences));
      set({ preferences });
    } catch (error) {
      console.error('Failed to save dashboard preferences:', error);
    }
  },

  toggleCategoryVisibility: async (categoryId: string) => {
    const { preferences } = get();
    const { visibleCategoryIds } = preferences;
    
    let updatedIds: string[];
    if (visibleCategoryIds.includes(categoryId)) {
      // Remove if already visible
      updatedIds = visibleCategoryIds.filter(id => id !== categoryId);
      await get().setVisibleCategories(updatedIds);
      return true;
    } else {
      // Check if we can add more
      if (visibleCategoryIds.length >= MAX_VISIBLE_CATEGORIES) {
        return false; // Can't add more
      }
      // Add if not visible and under limit
      updatedIds = [...visibleCategoryIds, categoryId];
      await get().setVisibleCategories(updatedIds);
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