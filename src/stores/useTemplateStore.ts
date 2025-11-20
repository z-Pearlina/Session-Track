import { create } from 'zustand';
import { SessionTemplate } from '../types';
import { StorageService } from '../services/StorageService';
import { logger } from '../services/logger';

interface TemplateState {
  templates: SessionTemplate[];
  isLoading: boolean;
  error: string | null;

  loadTemplates: () => Promise<void>;
  addTemplate: (template: SessionTemplate) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<SessionTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  incrementUsage: (id: string) => Promise<void>;
  clearError: () => void;
}

const useTemplateStoreBase = create<TemplateState>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,

  loadTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await StorageService.getTemplates();
      set({ templates, isLoading: false });
      logger.info(`Loaded ${templates.length} templates`);
    } catch (error) {
      logger.error('Failed to load templates', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load templates',
        isLoading: false 
      });
    }
  },

  addTemplate: async (template: SessionTemplate) => {
    const previousTemplates = get().templates;
    
    // Optimistic update
    set((state) => ({
      templates: [...state.templates, template],
    }));

    try {
      await StorageService.saveTemplate(template);
      logger.success(`Template saved: ${template.name}`);
    } catch (error) {
      set({ 
        templates: previousTemplates,
        error: error instanceof Error ? error.message : 'Failed to save template'
      });
      logger.error('Failed to save template', error);
      throw error;
    }
  },

  updateTemplate: async (id: string, updates: Partial<SessionTemplate>) => {
    const previousTemplates = get().templates;
    
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));

    try {
      await StorageService.updateTemplate(id, updates);
      logger.success(`Template updated: ${id}`);
    } catch (error) {
      set({ 
        templates: previousTemplates,
        error: error instanceof Error ? error.message : 'Failed to update template'
      });
      throw error;
    }
  },

  deleteTemplate: async (id: string) => {
    const previousTemplates = get().templates;
    
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    }));

    try {
      await StorageService.deleteTemplate(id);
      logger.success(`Template deleted: ${id}`);
    } catch (error) {
      set({ 
        templates: previousTemplates,
        error: error instanceof Error ? error.message : 'Failed to delete template'
      });
      throw error;
    }
  },

  incrementUsage: async (id: string) => {
    const template = get().templates.find(t => t.id === id);
    if (!template) return;

    await get().updateTemplate(id, { usageCount: template.usageCount + 1 });
  },

  clearError: () => set({ error: null }),
}));

export const useTemplates = () => useTemplateStoreBase((state) => state.templates);
export const useTemplatesLoading = () => useTemplateStoreBase((state) => state.isLoading);
export const useTemplatesError = () => useTemplateStoreBase((state) => state.error);

export const useLoadTemplates = () => useTemplateStoreBase((state) => state.loadTemplates);
export const useAddTemplate = () => useTemplateStoreBase((state) => state.addTemplate);
export const useUpdateTemplate = () => useTemplateStoreBase((state) => state.updateTemplate);
export const useDeleteTemplate = () => useTemplateStoreBase((state) => state.deleteTemplate);
export const useIncrementTemplateUsage = () => useTemplateStoreBase((state) => state.incrementUsage);

export const useTemplateStore = useTemplateStoreBase;