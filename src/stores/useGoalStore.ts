import { create } from "zustand";
import { Goal } from "../types";
import { StorageService } from "../services/StorageService";
import { NotificationService } from "../services/NotificationService";
import { AchievementService } from "../services/AchievementService";
import { logger } from "../services/logger";

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;

  getGoalById: (goalId: string) => Goal | undefined;
  loadGoals: () => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  updateGoalProgress: (goalId: string, progressMinutes: number) => Promise<void>;
  completeGoal: (goalId: string) => Promise<void>;
  archiveGoal: (goalId: string) => Promise<void>;
  unarchiveGoal: (goalId: string) => Promise<void>;
  clearError: () => void;
}

const useGoalStoreBase = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  getGoalById: (goalId: string) => {
    return get().goals.find((goal) => goal.id === goalId);
  },

  loadGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const goals = await StorageService.getGoals();
      set({ goals, isLoading: false });
      logger.info(`Loaded ${goals.length} goals`);
    } catch (error) {
      logger.error("Failed to load goals", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load goals",
        isLoading: false
      });
    }
  },

  addGoal: async (goal: Goal) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.saveGoal(goal);
      set((state) => ({
        goals: [...state.goals, goal],
        isLoading: false
      }));
      
      const daysUntilEnd = Math.ceil(
        (new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilEnd > 1) {
        await NotificationService.scheduleGoalReminder(
          goal.id,
          goal.title,
          Math.max(1, daysUntilEnd - 1)
        );
      }
      
      logger.success(`Goal added: ${goal.title}`);
    } catch (error) {
      logger.error("Failed to add goal", error);
      set({
        error: error instanceof Error ? error.message : "Failed to add goal",
        isLoading: false
      });
      throw error;
    }
  },

  updateGoal: async (goalId: string, updates: Partial<Goal>) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.updateGoal(goalId, updates);
      set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId
            ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
            : goal
        ),
        isLoading: false,
      }));
      logger.success(`Goal updated: ${goalId}`);
    } catch (error) {
      logger.error("Failed to update goal", error);
      set({
        error: error instanceof Error ? error.message : "Failed to update goal",
        isLoading: false
      });
      throw error;
    }
  },

  deleteGoal: async (goalId: string) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.deleteGoal(goalId);
      set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== goalId),
        isLoading: false,
      }));
      logger.success(`Goal deleted: ${goalId}`);
    } catch (error) {
      logger.error("Failed to delete goal", error);
      set({
        error: error instanceof Error ? error.message : "Failed to delete goal",
        isLoading: false
      });
      throw error;
    }
  },

  updateGoalProgress: async (goalId: string, progressMinutes: number) => {
    set({ isLoading: true, error: null });
    try {
      const goal = get().goals.find((g) => g.id === goalId);
      if (!goal) {
        throw new Error(`Goal not found: ${goalId}`);
      }

      const newProgress = goal.currentProgress + progressMinutes;
      const isCompleted = newProgress >= goal.targetMinutes;

      const progressPercentage = (newProgress / goal.targetMinutes) * 100;
      const previousPercentage = (goal.currentProgress / goal.targetMinutes) * 100;

      if (progressPercentage >= 80 && previousPercentage < 80 && !isCompleted) {
        await NotificationService.sendGoalProgressNotification(
          goal.title,
          newProgress,
          goal.targetMinutes
        );
      }

      await StorageService.updateGoal(goalId, {
        currentProgress: newProgress,
        status: isCompleted ? "completed" : goal.status,
        completedAt: isCompleted ? new Date().toISOString() : goal.completedAt,
      });

      const updatedGoals = get().goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              currentProgress: newProgress,
              status: isCompleted ? "completed" : g.status,
              completedAt: isCompleted ? new Date().toISOString() : g.completedAt,
              updatedAt: new Date().toISOString(),
            }
          : g
      );

      set({ goals: updatedGoals, isLoading: false });

      if (isCompleted) {
        await NotificationService.sendGoalCompletedNotification(goal.title);
        
        try {
          const completedGoals = updatedGoals.filter(g => g.status === 'completed');
          await AchievementService.checkGoalAchievements(completedGoals);
        } catch (achievementError) {
          logger.error('Achievement check failed (non-critical)', achievementError);
        }
      }

      logger.success(`Goal progress updated: ${goalId}`);
    } catch (error) {
      logger.error("Failed to update goal progress", error);
      set({
        error: error instanceof Error ? error.message : "Failed to update goal progress",
        isLoading: false
      });
      throw error;
    }
  },

  completeGoal: async (goalId: string) => {
    set({ isLoading: true, error: null });
    try {
      const goal = get().goals.find((g) => g.id === goalId);
      
      await StorageService.updateGoal(goalId, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });

      const updatedGoals = get().goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              status: "completed",
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : g
      );

      set({ goals: updatedGoals, isLoading: false });

      if (goal) {
        await NotificationService.sendGoalCompletedNotification(goal.title);
      }

      try {
        const completedGoals = updatedGoals.filter(g => g.status === 'completed');
        await AchievementService.checkGoalAchievements(completedGoals);
      } catch (achievementError) {
        logger.error('Achievement check failed (non-critical)', achievementError);
      }

      logger.success(`Goal completed: ${goalId}`);
    } catch (error) {
      logger.error("Failed to complete goal", error);
      set({
        error: error instanceof Error ? error.message : "Failed to complete goal",
        isLoading: false
      });
      throw error;
    }
  },

  archiveGoal: async (goalId: string) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.updateGoal(goalId, {
        status: "archived",
        updatedAt: new Date().toISOString(),
      });

      set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                status: "archived",
                updatedAt: new Date().toISOString(),
              }
            : goal
        ),
        isLoading: false,
      }));

      logger.success(`Goal archived: ${goalId}`);
    } catch (error) {
      logger.error("Failed to archive goal", error);
      set({
        error: error instanceof Error ? error.message : "Failed to archive goal",
        isLoading: false
      });
      throw error;
    }
  },

  unarchiveGoal: async (goalId: string) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.updateGoal(goalId, {
        status: "active",
        updatedAt: new Date().toISOString(),
      });

      set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                status: "active",
                updatedAt: new Date().toISOString(),
              }
            : goal
        ),
        isLoading: false,
      }));

      logger.success(`Goal unarchived: ${goalId}`);
    } catch (error) {
      logger.error("Failed to unarchive goal", error);
      set({
        error: error instanceof Error ? error.message : "Failed to unarchive goal",
        isLoading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export const useGoals = () => useGoalStoreBase((state) => state.goals);
export const useGoalsLoading = () => useGoalStoreBase((state) => state.isLoading);
export const useGoalsError = () => useGoalStoreBase((state) => state.error);
export const useGoalById = (goalId: string) =>
  useGoalStoreBase((state) => state.goals.find((goal) => goal.id === goalId));

export const useGetGoalById = () => useGoalStoreBase((state) => state.getGoalById);
export const useLoadGoals = () => useGoalStoreBase((state) => state.loadGoals);
export const useAddGoal = () => useGoalStoreBase((state) => state.addGoal);
export const useUpdateGoal = () => useGoalStoreBase((state) => state.updateGoal);
export const useDeleteGoal = () => useGoalStoreBase((state) => state.deleteGoal);
export const useUpdateGoalProgress = () => useGoalStoreBase((state) => state.updateGoalProgress);
export const useCompleteGoal = () => useGoalStoreBase((state) => state.completeGoal);
export const useArchiveGoal = () => useGoalStoreBase((state) => state.archiveGoal);
export const useUnarchiveGoal = () => useGoalStoreBase((state) => state.unarchiveGoal);
export const useClearGoalError = () => useGoalStoreBase((state) => state.clearError);

export const useGoalStore = useGoalStoreBase;