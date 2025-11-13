import { create } from 'zustand';
import { Achievement, UserAchievementProgress } from '../types';
import { StorageService } from '../services/StorageService';
import { logger } from '../services/logger';

interface AchievementState {
  achievements: Achievement[];
  userProgress: UserAchievementProgress[];
  isLoading: boolean;
  error: string | null;
}

interface AchievementActions {
  loadAchievements: () => Promise<void>;
  initializeDefaultAchievements: () => Promise<void>;
  checkAndUnlockAchievements: (totalHours: number, streak: number, sessionCount: number) => Promise<Achievement[]>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  updateProgress: (achievementId: string, progress: number) => void;
}
type AchievementStore = AchievementState & AchievementActions;

const useAchievementStoreBase = create<AchievementStore>((set, get) => ({
  achievements: [],
  userProgress: [],
  isLoading: false,
  error: null,

  loadAchievements: async () => {
    set({ isLoading: true, error: null });
    try {
      const achievements = await StorageService.getAchievements();
      set({ achievements, isLoading: false });
    } catch (error) {
      logger.error('Failed to load achievements', error);
      set({ error: 'Failed to load achievements', isLoading: false });
    }
  },
initializeDefaultAchievements: async () => {
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
      set({ achievements: defaultAchievements });
    } catch (error) {
      logger.error('Failed to initialize achievements', error);
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

      get().updateProgress(achievement.id, progress);

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
    } catch (error) {
      logger.error('Failed to unlock achievement', error);
      throw error;
    }
  },

  getUnlockedAchievements: () => {
    return get().achievements.filter((a) => a.isUnlocked);
  },

  getLockedAchievements: () => {
    return get().achievements.filter((a) => !a.isUnlocked);
  },
  updateProgress: (achievementId: string, progress: number) => {
    set((state) => ({
      achievements: state.achievements.map((a) =>
        a.id === achievementId ? { ...a, progress } : a
      ),
    }));
  },
}));

export const useAchievements = () => useAchievementStoreBase((state) => state.achievements);
export const useUnlockedAchievements = () => useAchievementStoreBase((state) => state.getUnlockedAchievements());
export const useAchievementActions = () =>
  useAchievementStoreBase((state) => ({
    loadAchievements: state.loadAchievements,
    initializeDefaultAchievements: state.initializeDefaultAchievements,
    checkAndUnlockAchievements: state.checkAndUnlockAchievements,
    unlockAchievement: state.unlockAchievement,
  }));

export const useAchievementStore = useAchievementStoreBase;