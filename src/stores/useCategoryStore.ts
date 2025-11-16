import { create } from 'zustand';
import { Category } from '../types';
import { StorageService } from '../services/StorageService';
import { DEFAULT_CATEGORIES } from '../constants/defaultCategories';
import { logger } from '../services/logger';

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

const useCategoryStoreBase = create<CategoryState>((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  isLoading: false,
  error: null,

  loadCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await StorageService.getCategories();
      
      if (categories.length === 0) {
        for (const category of DEFAULT_CATEGORIES) {
          await StorageService.saveCategory(category);
        }
        set({ categories: DEFAULT_CATEGORIES, isLoading: false });
        logger.info('Initialized default categories');
      } else {
        set({ categories, isLoading: false });
        logger.info(`Loaded ${categories.length} categories`);
      }
    } catch (error) {
      logger.error('Failed to load categories', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load categories',
        isLoading: false,
        categories: DEFAULT_CATEGORIES 
      });
    }
  },

  addCategory: async (category: Category) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.saveCategory(category);
      
      const { categories } = get();
      set({ 
        categories: [...categories, category], 
        isLoading: false 
      });
      
      logger.success(`Category added: ${category.name}`);
    } catch (error) {
      logger.error('Failed to add category', error);
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
      await StorageService.updateCategory(categoryId, updates);
      
      const { categories } = get();
      const updatedCategories = categories.map(c =>
        c.id === categoryId ? { ...c, ...updates } : c
      );
      
      set({ 
        categories: updatedCategories, 
        isLoading: false 
      });
      
      logger.success(`Category updated: ${categoryId}`);
    } catch (error) {
      logger.error('Failed to update category', error);
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
      
      if (categories.length <= 1) {
        throw new Error('Cannot delete the last category. At least one category must exist.');
      }
      
      await StorageService.deleteCategory(categoryId);
      
      const updatedCategories = categories.filter(c => c.id !== categoryId);
      
      set({ 
        categories: updatedCategories, 
        isLoading: false 
      });
      
      logger.success(`Category deleted: ${categoryId}`);
    } catch (error) {
      logger.error('Failed to delete category', error);
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

// ✅ FIXED: Simple selectors only
export const useCategories = () => useCategoryStoreBase((state) => state.categories);
export const useCategoryById = (categoryId: string) => 
  useCategoryStoreBase((state) => state.categories.find(c => c.id === categoryId));
export const useCategoriesLoading = () => useCategoryStoreBase((state) => state.isLoading);
export const useCategoriesError = () => useCategoryStoreBase((state) => state.error);

// ✅ FIXED: Return individual functions, not objects
export const useLoadCategories = () => useCategoryStoreBase((state) => state.loadCategories);
export const useAddCategory = () => useCategoryStoreBase((state) => state.addCategory);
export const useUpdateCategory = () => useCategoryStoreBase((state) => state.updateCategory);
export const useDeleteCategory = () => useCategoryStoreBase((state) => state.deleteCategory);
export const useGetCategoryById = () => useCategoryStoreBase((state) => state.getCategoryById);
export const useClearCategoryError = () => useCategoryStoreBase((state) => state.clearError);

export const useCategoryStore = useCategoryStoreBase;