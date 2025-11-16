import { create } from 'zustand';
import { Achievement, UserAchievementProgress } from '../types';
import { StorageService } from '../services/StorageService';
import { logger } from '../services/logger';

interface AchievementState {
  achievements: Achievement[];
  userProgress: UserAchievementProgress[];
  isLoading: boolean;
  error: string | null;

  loadAchievements: () => Promise<void>;
  initializeDefaultAchievements: () => Promise<void>;
  checkAndUnlockAchievements: (totalHours: number, streak: number, sessionCount: number) => Promise<Achievement[]>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateProgress: (achievementId: string, progress: number) => Promise<void>;
  clearError: () => void;
}

const useAchievementStoreBase = create<AchievementState>((set, get) => ({
  achievements: [],
  userProgress: [],
  isLoading: false,
  error: null,

  loadAchievements: async () => {
    set({ isLoading: true, error: null });
    try {
      const achievements = await StorageService.getAchievements();
      set({ achievements, isLoading: false });
      logger.info(`Loaded ${achievements.length} achievements`);
    } catch (error) {
      logger.error('Failed to load achievements', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load achievements',
        isLoading: false 
      });
    }
  },

  initializeDefaultAchievements: async () => {
    set({ isLoading: true, error: null });
    const defaultAchievements: Achievement[] = [
      {
        id: 'achievement_first_session',
        title: 'First Steps',
        description: 'Complete your first session',
        category: 'milestone',
        tier: 'bronze',
        icon: 'rocket',
        requirement: { type: 'sessionCount', value: 1 },
        isUnlocked: false,
        progress: 0,
      },
      {
        id: 'achievement_10_hours',
        title: '10 Hour Club',
        description: 'Track 10 hours total',
        category: 'milestone',
        tier: 'bronze',
        icon: 'time',
        requirement: { type: 'totalHours', value: 10 },
        isUnlocked: false,
        progress: 0,
      },
      {
        id: 'achievement_50_hours',
        title: 'Half Century',
        description: 'Track 50 hours total',
        category: 'milestone',
        tier: 'silver',
        icon: 'trophy',
        requirement: { type: 'totalHours', value: 50 },
        isUnlocked: false,
        progress: 0,
      },
      {
        id: 'achievement_100_hours',
        title: 'Century Club',
        description: 'Track 100 hours total',
        category: 'milestone',
        tier: 'gold',
        icon: 'medal',
        requirement: { type: 'totalHours', value: 100 },
        isUnlocked: false,
        progress: 0,
      },
      {
        id: 'achievement_streak_3',
        title: 'Getting Started',
        description: 'Track for 3 days in a row',
        category: 'streak',
        tier: 'bronze',
        icon: 'flame',
        requirement: { type: 'streak', value: 3 },
        isUnlocked: false,
        progress: 0,
      },
      {
        id: 'achievement_streak_7',
        title: 'Week Warrior',
        description: 'Track for 7 days in a row',
        category: 'streak',
        tier: 'silver',
        icon: 'flash',
        requirement: { type: 'streak', value: 7 },
        isUnlocked: false,
        progress: 0,
      },
      {
        id: 'achievement_streak_30',
        title: 'Monthly Master',
        description: 'Track for 30 days in a row',
        category: 'streak',
        tier: 'gold',
        icon: 'star',
        requirement: { type: 'streak', value: 30 },
        isUnlocked: false,
        progress: 0,
      },
    ];

    try {
      for (const achievement of defaultAchievements) {
        await StorageService.saveAchievement(achievement);
      }
      set({ achievements: defaultAchievements, isLoading: false });
      logger.success('Default achievements initialized');
    } catch (error) {
      logger.error('Failed to initialize achievements', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize achievements',
        isLoading: false 
      });
    }
  },

  checkAndUnlockAchievements: async (totalHours: number, streak: number, sessionCount: number) => {
    const unlockedAchievements: Achievement[] = [];
    const { achievements } = get();

    for (const achievement of achievements) {
      if (achievement.isUnlocked) continue;

      let shouldUnlock = false;
      let progress = 0;

      switch (achievement.requirement.type) {
        case 'totalHours':
          progress = Math.min((totalHours / achievement.requirement.value) * 100, 100);
          shouldUnlock = totalHours >= achievement.requirement.value;
          break;
        case 'streak':
          progress = Math.min((streak / achievement.requirement.value) * 100, 100);
          shouldUnlock = streak >= achievement.requirement.value;
          break;
        case 'sessionCount':
          progress = Math.min((sessionCount / achievement.requirement.value) * 100, 100);
          shouldUnlock = sessionCount >= achievement.requirement.value;
          break;
      }

      await get().updateProgress(achievement.id, progress);

      if (shouldUnlock) {
        await get().unlockAchievement(achievement.id);
        unlockedAchievements.push(achievement);
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

// ✅ FIXED: Simple selectors only
export const useAchievements = () => useAchievementStoreBase((state) => state.achievements);
export const useAchievementsLoading = () => useAchievementStoreBase((state) => state.isLoading);
export const useAchievementsError = () => useAchievementStoreBase((state) => state.error);
export const useAchievementById = (achievementId: string) =>
  useAchievementStoreBase((state) => state.achievements.find((a) => a.id === achievementId));

// ✅ FIXED: Return individual functions, not objects
export const useLoadAchievements = () => useAchievementStoreBase((state) => state.loadAchievements);
export const useInitializeDefaultAchievements = () => useAchievementStoreBase((state) => state.initializeDefaultAchievements);
export const useCheckAndUnlockAchievements = () => useAchievementStoreBase((state) => state.checkAndUnlockAchievements);
export const useUnlockAchievement = () => useAchievementStoreBase((state) => state.unlockAchievement);
export const useUpdateAchievementProgress = () => useAchievementStoreBase((state) => state.updateProgress);
export const useClearAchievementError = () => useAchievementStoreBase((state) => state.clearError);

export const useAchievementStore = useAchievementStoreBase;