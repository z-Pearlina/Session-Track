import { create } from "zustand";
import { Goal, GoalPeriod, GoalStatus } from "../types";
import { StorageService } from "../services/StorageService";
import { logger } from "../services/logger";

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
}

interface GoalActions {
  loadGoals: () => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  updateGoalProgress: (
    goalId: string,
    progressMinutes: number
  ) => Promise<void>;
  completeGoal: (goalId: string) => Promise<void>;
  archiveGoal: (goalId: string) => Promise<void>;
  getActiveGoals: () => Goal[];
  getGoalById: (goalId: string) => Goal | undefined;
}
type GoalStore = GoalState & GoalActions;

const useGoalStoreBase = create<GoalStore>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  loadGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const goals = await StorageService.getGoals();
      set({ goals, isLoading: false });
    } catch (error) {
      logger.error("Failed to load goals", error);
      set({ error: "Failed to load goals", isLoading: false });
    }
  },
  addGoal: async (goal: Goal) => {
    try {
      await StorageService.saveGoal(goal);
      set((state) => ({ goals: [...state.goals, goal] }));
    } catch (error) {
      logger.error("Failed to add goal", error);
      throw error;
    }
  },

  updateGoal: async (goalId: string, updates: Partial<Goal>) => {
    try {
      await StorageService.updateGoal(goalId, updates);
      set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId
            ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
            : goal
        ),
      }));
    } catch (error) {
      logger.error("Failed to update goal", error);
      throw error;
    }
  },

  deleteGoal: async (goalId: string) => {
    try {
      await StorageService.deleteGoal(goalId);
      set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== goalId),
      }));
    } catch (error) {
      logger.error("Failed to delete goal", error);
      throw error;
    }
  },
  updateGoalProgress: async (goalId: string, progressMinutes: number) => {
    try {
      const goal = get().goals.find((g) => g.id === goalId);
      if (!goal) return;

      const newProgress = goal.currentProgress + progressMinutes;
      const isCompleted = newProgress >= goal.targetMinutes;

      await StorageService.updateGoal(goalId, {
        currentProgress: newProgress,
        status: isCompleted ? "completed" : goal.status,
        completedAt: isCompleted ? new Date().toISOString() : goal.completedAt,
      });

      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                currentProgress: newProgress,
                status: isCompleted ? "completed" : g.status,
                completedAt: isCompleted
                  ? new Date().toISOString()
                  : g.completedAt,
                updatedAt: new Date().toISOString(),
              }
            : g
        ),
      }));
    } catch (error) {
      logger.error("Failed to update goal progress", error);
      throw error;
    }
  },
  completeGoal: async (goalId: string) => {
    try {
      await StorageService.updateGoal(goalId, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });

      set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                status: "completed",
                completedAt: new Date().toISOString(),
              }
            : goal
        ),
      }));
    } catch (error) {
      logger.error("Failed to complete goal", error);
      throw error;
    }
  },
  archiveGoal: async (goalId: string) => {
    try {
      await StorageService.updateGoal(goalId, { status: "archived" });
      set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId ? { ...goal, status: "archived" } : goal
        ),
      }));
    } catch (error) {
      logger.error("Failed to archive goal", error);
      throw error;
    }
  },

  getActiveGoals: () => {
    return get().goals.filter((goal) => goal.status === "active");
  },
  getGoalById: (goalId: string) => {
    return get().goals.find((goal) => goal.id === goalId);
  },
}));

export const useGoals = () => useGoalStoreBase((state) => state.goals);
export const useActiveGoals = () =>
  useGoalStoreBase((state) => state.getActiveGoals());
export const useGoalActions = () =>
  useGoalStoreBase((state) => ({
    loadGoals: state.loadGoals,
    addGoal: state.addGoal,
    updateGoal: state.updateGoal,
    deleteGoal: state.deleteGoal,
    updateGoalProgress: state.updateGoalProgress,
    completeGoal: state.completeGoal,
    archiveGoal: state.archiveGoal,
    getGoalById: state.getGoalById,
  }));

export const useGoalStore = useGoalStoreBase;
