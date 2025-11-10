import { create } from 'zustand';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/defaultCategories';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES_KEY = '@session_track:categories';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  loadCategories: () => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  getCategoryById: (categoryId: string) => Category | undefined;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  isLoading: false,
  error: null,

  loadCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await AsyncStorage.getItem(CATEGORIES_KEY);
      const categories = data ? JSON.parse(data) : DEFAULT_CATEGORIES;
      
      // Merge with defaults if empty
      if (categories.length === 0) {
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
        set({ categories: DEFAULT_CATEGORIES, isLoading: false });
      } else {
        set({ categories, isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load categories',
        isLoading: false 
      });
    }
  },

  addCategory: async (category: Category) => {
    set({ isLoading: true, error: null });
    try {
      const { categories } = get();
      const updatedCategories = [...categories, category];
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
      set({ categories: updatedCategories, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add category',
        isLoading: false 
      });
      throw error;
    }
  },

  updateCategory: async (categoryId: string, updates: Partial<Category>) => {
    set({ isLoading: true, error: null });
    try {
      const { categories } = get();
      const updatedCategories = categories.map(c =>
        c.id === categoryId ? { ...c, ...updates } : c
      );
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
      set({ categories: updatedCategories, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update category',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteCategory: async (categoryId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { categories } = get();
      const category = categories.find(c => c.id === categoryId);
      
      if (category?.isDefault) {
        throw new Error('Cannot delete default categories');
      }

      const updatedCategories = categories.filter(c => c.id !== categoryId);
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
      set({ categories: updatedCategories, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete category',
        isLoading: false 
      });
      throw error;
    }
  },

  getCategoryById: (categoryId: string) => {
    return get().categories.find(c => c.id === categoryId);
  },

  clearError: () => set({ error: null }),
}));