import { create } from 'zustand';
import { Achievement, Session, Goal, Category } from '../types';
import { StorageService } from '../services/StorageService';
import { NotificationService } from '../services/NotificationService';
import { logger } from '../services/logger';
import { ACHIEVEMENT_DEFINITIONS } from '../constants/achievements';

interface AchievementState {
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  loadAchievements: () => Promise<void>;
  initializeDefaultAchievements: () => Promise<void>;
  checkAndUnlockAchievements: (sessions: Session[], goals: Goal[], categories: Category[]) => Promise<Achievement[]>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateProgress: (achievementId: string, progress: number) => Promise<void>;
  clearError: () => void;
  resetAchievements: () => Promise<void>;
}

const MIN_SESSION_DURATION_MS = 60 * 1000;

function deduplicateAchievements(achievements: Achievement[]): Achievement[] {
  const seen = new Map<string, Achievement>();
  achievements.forEach(achievement => {
    if (!seen.has(achievement.id)) {
      seen.set(achievement.id, achievement);
    } else {
      logger.warn(`Duplicate achievement ID found: ${achievement.id}`);
    }
  });
  return Array.from(seen.values());
}

const useAchievementStoreBase = create<AchievementState>((set, get) => ({
  achievements: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  loadAchievements: async () => {
    const { isInitialized } = get();
    if (isInitialized) return;

    set({ isLoading: true, error: null });
    try {
      let achievements = await StorageService.getAchievements();
      
      const uniqueIds = new Set(achievements.map(a => a.id));
      if (achievements.length !== uniqueIds.size) {
        logger.warn('Duplicates detected in storage, cleaning up...');
        achievements = deduplicateAchievements(achievements);
        
        await StorageService.clearAchievements();
        for (const achievement of achievements) {
          await StorageService.saveAchievement(achievement);
        }
        logger.success('Duplicates removed from storage');
      }
      
      set({ achievements, isLoading: false, isInitialized: true });
      logger.info(`Loaded ${achievements.length} unique achievements`);
    } catch (error) {
      logger.error('Failed to load achievements', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load achievements',
        isLoading: false
      });
    }
  },

  initializeDefaultAchievements: async () => {
    const { isInitialized } = get();
    
    if (isInitialized) {
      logger.info('Achievements already initialized, skipping');
      return;
    }

    set({ isLoading: true, error: null });
    try {
      let existingAchievements = await StorageService.getAchievements();
      
      if (existingAchievements.length > 0) {
        const uniqueIds = new Set(existingAchievements.map(a => a.id));
        if (existingAchievements.length !== uniqueIds.size) {
          logger.warn('Duplicates found during init, cleaning...');
          existingAchievements = deduplicateAchievements(existingAchievements);
          
          await StorageService.clearAchievements();
          for (const achievement of existingAchievements) {
            await StorageService.saveAchievement(achievement);
          }
        }
        
        set({ achievements: existingAchievements, isLoading: false, isInitialized: true });
        logger.info('Using existing achievements');
        return;
      }

      await StorageService.clearAchievements();
      
      const allAchievements = ACHIEVEMENT_DEFINITIONS.map(achievement => ({ ...achievement }));
      
      for (const achievement of allAchievements) {
        await StorageService.saveAchievement(achievement);
      }

      set({ achievements: allAchievements, isLoading: false, isInitialized: true });
      logger.success(`Initialized ${allAchievements.length} default achievements`);
    } catch (error) {
      logger.error('Failed to initialize achievements', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize achievements',
        isLoading: false
      });
    }
  },

  resetAchievements: async () => {
    set({ isLoading: true, error: null, isInitialized: false });
    try {
      await StorageService.clearAchievements();
      
      const allAchievements = ACHIEVEMENT_DEFINITIONS.map(achievement => ({ ...achievement }));
      
      for (const achievement of allAchievements) {
        await StorageService.saveAchievement(achievement);
      }

      set({ achievements: allAchievements, isLoading: false, isInitialized: true });
      logger.success('Achievements reset successfully');
    } catch (error) {
      logger.error('Failed to reset achievements', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to reset achievements',
        isLoading: false
      });
    }
  },

  checkAndUnlockAchievements: async (sessions: Session[], goals: Goal[], categories: Category[]) => {
    const unlockedAchievements: Achievement[] = [];
    const { achievements } = get();

    const validSessions = sessions.filter(s => s.durationMs >= MIN_SESSION_DURATION_MS);
    const stats = calculateStats(validSessions, goals, categories);

    for (const achievement of achievements) {
      if (achievement.isUnlocked) continue;

      const { shouldUnlock, progress } = checkAchievementCondition(
        achievement,
        stats,
        validSessions,
        goals,
        categories
      );

      if (progress !== achievement.progress) {
        await get().updateProgress(achievement.id, progress);
      }

      if (shouldUnlock) {
        await get().unlockAchievement(achievement.id);
        unlockedAchievements.push(achievement);

        await NotificationService.sendAchievementUnlocked(
          achievement.title,
          achievement.description
        );
      }
    }

    return unlockedAchievements;
  },

  unlockAchievement: async (achievementId: string) => {
    try {
      const now = new Date().toISOString();
      await StorageService.updateAchievement(achievementId, {
        isUnlocked: true,
        unlockedAt: now,
        progress: 100,
      });

      set((state) => ({
        achievements: state.achievements.map((a) =>
          a.id === achievementId
            ? { ...a, isUnlocked: true, unlockedAt: now, progress: 100 }
            : a
        ),
      }));

      logger.success(`Achievement unlocked: ${achievementId}`);
    } catch (error) {
      logger.error('Failed to unlock achievement', error);
      throw error;
    }
  },

  updateProgress: async (achievementId: string, progress: number) => {
    try {
      await StorageService.updateAchievement(achievementId, { progress });

      set((state) => ({
        achievements: state.achievements.map((a) =>
          a.id === achievementId ? { ...a, progress } : a
        ),
      }));
    } catch (error) {
      logger.error('Failed to update achievement progress', error);
    }
  },

  clearError: () => set({ error: null }),
}));

interface Stats {
  totalSessions: number;
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  completedGoals: number;
  activeGoals: number;
  longestSessionMinutes: number;
  categoriesUsed: Set<string>;
  categorySessionCounts: Map<string, number>;
  earlyBirdSessions: number;
  nightOwlSessions: number;
  weekendSessions: number;
  longSessions: number;
  weeklyStreakDays: Set<string>;
  goalCompletionSessions: number;
  focusedSessions: number;
}

function calculateStats(sessions: Session[], goals: Goal[], categories: Category[]): Stats {
  const totalSessions = sessions.length;
  const totalHours = sessions.reduce((sum, s) => sum + s.durationMs, 0) / (1000 * 60 * 60);

  const { currentStreak, longestStreak } = calculateStreaks(sessions);

  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;

  const longestSessionMinutes = Math.max(
    ...sessions.map(s => s.durationMs / (1000 * 60)),
    0
  );

  const categoriesUsed = new Set(sessions.map(s => s.categoryId));

  const categorySessionCounts = new Map<string, number>();
  sessions.forEach(s => {
    categorySessionCounts.set(s.categoryId, (categorySessionCounts.get(s.categoryId) || 0) + 1);
  });

  let earlyBirdSessions = 0;
  let nightOwlSessions = 0;
  let weekendSessions = 0;
  let longSessions = 0;
  let focusedSessions = 0;

  sessions.forEach(session => {
    const startDate = new Date(session.startedAt);
    const hour = startDate.getHours();
    const dayOfWeek = startDate.getDay();
    const durationMinutes = session.durationMs / (1000 * 60);

    if (hour >= 5 && hour < 9) earlyBirdSessions++;
    if (hour >= 22 || hour < 5) nightOwlSessions++;
    if (dayOfWeek === 0 || dayOfWeek === 6) weekendSessions++;
    if (durationMinutes >= 60) longSessions++;
    if (durationMinutes >= 45) focusedSessions++;
  });

  const last7Days = new Set<string>();
  const now = new Date();
  sessions.forEach(s => {
    const sessionDate = new Date(s.startedAt);
    const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      last7Days.add(sessionDate.toDateString());
    }
  });

  const goalCompletionSessions = sessions.filter(s => {
    if (!s.goalId) return false;
    const goal = goals.find(g => g.id === s.goalId);
    return goal && goal.status === 'completed';
  }).length;

  return {
    totalSessions,
    totalHours,
    currentStreak,
    longestStreak,
    completedGoals,
    activeGoals,
    longestSessionMinutes,
    categoriesUsed,
    categorySessionCounts,
    earlyBirdSessions,
    nightOwlSessions,
    weekendSessions,
    longSessions,
    weeklyStreakDays: last7Days,
    goalCompletionSessions,
    focusedSessions,
  };
}

function calculateStreaks(sessions: Session[]): { currentStreak: number; longestStreak: number } {
  if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const sessionDates = new Set(
    sessions.map(s => new Date(s.startedAt).toDateString())
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toDateString();
    if (sessionDates.has(dateStr)) {
      tempStreak++;
      if (i === 0 || currentStreak > 0) {
        currentStreak = tempStreak;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      if (i > 0) {
        tempStreak = 0;
      }
    }
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return { currentStreak, longestStreak };
}

function checkAchievementCondition(
  achievement: Achievement,
  stats: Stats,
  sessions: Session[],
  goals: Goal[],
  categories: Category[]
): { shouldUnlock: boolean; progress: number } {
  let shouldUnlock = false;
  let progress = 0;

  switch (achievement.requirement.type) {
    case 'totalHours':
      progress = Math.min((stats.totalHours / achievement.requirement.value) * 100, 100);
      shouldUnlock = stats.totalHours >= achievement.requirement.value;
      break;

    case 'streak':
      progress = Math.min((stats.currentStreak / achievement.requirement.value) * 100, 100);
      shouldUnlock = stats.currentStreak >= achievement.requirement.value;
      break;

    case 'sessionCount':
      progress = Math.min((stats.totalSessions / achievement.requirement.value) * 100, 100);
      shouldUnlock = stats.totalSessions >= achievement.requirement.value;
      break;

    case 'longestSession':
      progress = Math.min((stats.longestSessionMinutes / achievement.requirement.value) * 100, 100);
      shouldUnlock = stats.longestSessionMinutes >= achievement.requirement.value;
      break;

    case 'categoryCount':
      progress = Math.min((stats.categoriesUsed.size / achievement.requirement.value) * 100, 100);
      shouldUnlock = stats.categoriesUsed.size >= achievement.requirement.value;
      break;

    default:
      if (achievement.id.includes('early_bird')) {
        progress = Math.min((stats.earlyBirdSessions / achievement.requirement.value) * 100, 100);
        shouldUnlock = stats.earlyBirdSessions >= achievement.requirement.value;
      } else if (achievement.id.includes('night_owl')) {
        progress = Math.min((stats.nightOwlSessions / achievement.requirement.value) * 100, 100);
        shouldUnlock = stats.nightOwlSessions >= achievement.requirement.value;
      } else if (achievement.id.includes('weekend')) {
        progress = Math.min((stats.weekendSessions / achievement.requirement.value) * 100, 100);
        shouldUnlock = stats.weekendSessions >= achievement.requirement.value;
      } else if (achievement.id.includes('goal_')) {
        progress = Math.min((stats.completedGoals / achievement.requirement.value) * 100, 100);
        shouldUnlock = stats.completedGoals >= achievement.requirement.value;
      } else if (achievement.id.includes('category_master')) {
        const maxCategorySessions = Math.max(...Array.from(stats.categorySessionCounts.values()), 0);
        progress = Math.min((maxCategorySessions / achievement.requirement.value) * 100, 100);
        shouldUnlock = maxCategorySessions >= achievement.requirement.value;
      } else if (achievement.id.includes('weekly_warrior')) {
        progress = Math.min((stats.weeklyStreakDays.size / 7) * 100, 100);
        shouldUnlock = stats.weeklyStreakDays.size >= 7;
      } else if (achievement.id.includes('long_session')) {
        progress = Math.min((stats.longSessions / achievement.requirement.value) * 100, 100);
        shouldUnlock = stats.longSessions >= achievement.requirement.value;
      } else if (achievement.id.includes('focused')) {
        progress = Math.min((stats.focusedSessions / achievement.requirement.value) * 100, 100);
        shouldUnlock = stats.focusedSessions >= achievement.requirement.value;
      }
      break;
  }

  return { shouldUnlock, progress: Math.round(progress) };
}

export const useAchievements = () => useAchievementStoreBase((state) => state.achievements);
export const useAchievementsLoading = () => useAchievementStoreBase((state) => state.isLoading);
export const useAchievementsError = () => useAchievementStoreBase((state) => state.error);
export const useAchievementById = (achievementId: string) =>
  useAchievementStoreBase((state) => state.achievements.find((a) => a.id === achievementId));

export const useLoadAchievements = () => useAchievementStoreBase((state) => state.loadAchievements);
export const useInitializeDefaultAchievements = () => useAchievementStoreBase((state) => state.initializeDefaultAchievements);
export const useCheckAndUnlockAchievements = () => useAchievementStoreBase((state) => state.checkAndUnlockAchievements);
export const useUnlockAchievement = () => useAchievementStoreBase((state) => state.unlockAchievement);
export const useUpdateAchievementProgress = () => useAchievementStoreBase((state) => state.updateProgress);
export const useClearAchievementError = () => useAchievementStoreBase((state) => state.clearError);
export const useResetAchievements = () => useAchievementStoreBase((state) => state.resetAchievements);

export const useAchievementStore = useAchievementStoreBase;