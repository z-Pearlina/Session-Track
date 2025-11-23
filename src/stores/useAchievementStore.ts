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

// Singleton lock to prevent concurrent initialization
let isInitializing = false;
let initializationPromise: Promise<void> | null = null;

function deduplicateAchievements(achievements: Achievement[]): Achievement[] {
  const seen = new Map<string, Achievement>();
  achievements.forEach(achievement => {
    const existing = seen.get(achievement.id);
    // Keep the one with more progress or unlocked status
    if (!existing || 
        achievement.isUnlocked || 
        (!existing.isUnlocked && achievement.progress > existing.progress)) {
      seen.set(achievement.id, achievement);
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
      
      // Always deduplicate when loading
      achievements = deduplicateAchievements(achievements);
      
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
    
    // Already initialized in state
    if (isInitialized) {
      logger.info('Achievements already initialized in state, skipping');
      return;
    }

    // If already initializing, wait for that to complete
    if (isInitializing && initializationPromise) {
      logger.info('Initialization already in progress, waiting...');
      await initializationPromise;
      return;
    }

    // Set the lock
    isInitializing = true;
    
    initializationPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        let existingAchievements = await StorageService.getAchievements();
        
        if (existingAchievements.length > 0) {
          // Deduplicate existing achievements
          const deduped = deduplicateAchievements(existingAchievements);
          
          // If duplicates were found, clean up storage
          if (existingAchievements.length !== deduped.length) {
            logger.warn(`Found ${existingAchievements.length - deduped.length} duplicates, cleaning up...`);
            await StorageService.clearAchievements();
            for (const achievement of deduped) {
              await StorageService.saveAchievement(achievement);
            }
          }
          
          set({ achievements: deduped, isLoading: false, isInitialized: true });
          logger.info(`Using ${deduped.length} existing achievements`);
          return;
        }

        // No existing achievements, initialize defaults
        logger.info('No existing achievements, initializing defaults...');
        await StorageService.clearAchievements();
        
        const allAchievements = ACHIEVEMENT_DEFINITIONS.map(achievement => ({ 
          ...achievement,
          isUnlocked: false,
          progress: 0,
        }));
        
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
      } finally {
        isInitializing = false;
        initializationPromise = null;
      }
    })();

    await initializationPromise;
  },

  resetAchievements: async () => {
    // Reset the initialization lock
    isInitializing = false;
    initializationPromise = null;
    
    set({ isLoading: true, error: null, isInitialized: false });
    try {
      await StorageService.clearAchievements();
      
      const allAchievements = ACHIEVEMENT_DEFINITIONS.map(achievement => ({ 
        ...achievement,
        isUnlocked: false,
        progress: 0,
      }));
      
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
    const { achievements, isInitialized } = get();

    // Don't check if not initialized
    if (!isInitialized || achievements.length === 0) {
      return unlockedAchievements;
    }

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

    case 'completedGoals':
      progress = Math.min((stats.completedGoals / achievement.requirement.value) * 100, 100);
      shouldUnlock = stats.completedGoals >= achievement.requirement.value;
      break;

    case 'earlyBird':
      progress = Math.min((stats.earlyBirdSessions / achievement.requirement.value) * 100, 100);
      shouldUnlock = stats.earlyBirdSessions >= achievement.requirement.value;
      break;

    case 'nightOwl':
      progress = Math.min((stats.nightOwlSessions / achievement.requirement.value) * 100, 100);
      shouldUnlock = stats.nightOwlSessions >= achievement.requirement.value;
      break;

    case 'weekend':
      progress = Math.min((stats.weekendSessions / achievement.requirement.value) * 100, 100);
      shouldUnlock = stats.weekendSessions >= achievement.requirement.value;
      break;

    case 'categoryMaster':
      const maxCategorySessions = Math.max(...Array.from(stats.categorySessionCounts.values()), 0);
      progress = Math.min((maxCategorySessions / achievement.requirement.value) * 100, 100);
      shouldUnlock = maxCategorySessions >= achievement.requirement.value;
      break;

    case 'weeklyStreak':
      progress = Math.min((stats.weeklyStreakDays.size / 7) * 100, 100);
      shouldUnlock = stats.weeklyStreakDays.size >= 7;
      break;

    case 'focusedSessions':
      progress = Math.min((stats.focusedSessions / achievement.requirement.value) * 100, 100);
      shouldUnlock = stats.focusedSessions >= achievement.requirement.value;
      break;

    default:
      logger.warn(`Unknown achievement requirement type: ${achievement.requirement.type}`);
      break;
  }

  return { shouldUnlock, progress: Math.round(progress) };
}

// Selector hooks with deduplication at render time
export const useAchievements = () => {
  const achievements = useAchievementStoreBase((state) => state.achievements);
  // Deduplicate at render time as a safety measure
  return deduplicateAchievements(achievements);
};

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