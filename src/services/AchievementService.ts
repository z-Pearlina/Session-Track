import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, Goal, Achievement, AchievementTier } from '../types';
import { NotificationService } from './NotificationService';
import { logger } from './logger';

const STORAGE_KEY = '@flowtrix:achievements';

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'isUnlocked' | 'unlockedAt' | 'progress'>[] = [
  // Milestone Achievements
  {
    id: 'first_session',
    title: 'First Steps',
    description: 'Complete your first session',
    category: 'milestone',
    tier: 'bronze',
    icon: 'footsteps',
    requirement: { type: 'sessionCount', value: 1 },
  },
  {
    id: 'ten_sessions',
    title: 'Getting Started',
    description: 'Complete 10 sessions',
    category: 'milestone',
    tier: 'silver',
    icon: 'star',
    requirement: { type: 'sessionCount', value: 10 },
  },
  {
    id: 'fifty_sessions',
    title: 'Dedicated Learner',
    description: 'Complete 50 sessions',
    category: 'milestone',
    tier: 'gold',
    icon: 'medal',
    requirement: { type: 'sessionCount', value: 50 },
  },
  {
    id: 'hundred_sessions',
    title: 'Century Club',
    description: 'Complete 100 sessions',
    category: 'milestone',
    tier: 'platinum',
    icon: 'trophy',
    requirement: { type: 'sessionCount', value: 100 },
  },

  // Total Hours Achievements
  {
    id: 'ten_hours',
    title: 'First 10 Hours',
    description: 'Accumulate 10 hours of focus time',
    category: 'dedication',
    tier: 'bronze',
    icon: 'time',
    requirement: { type: 'totalHours', value: 10 },
  },
  {
    id: 'fifty_hours',
    title: 'Half Century',
    description: 'Accumulate 50 hours of focus time',
    category: 'dedication',
    tier: 'silver',
    icon: 'hourglass',
    requirement: { type: 'totalHours', value: 50 },
  },
  {
    id: 'hundred_hours',
    title: 'Centurion',
    description: 'Accumulate 100 hours of focus time',
    category: 'dedication',
    tier: 'gold',
    icon: 'flame',
    requirement: { type: 'totalHours', value: 100 },
  },
  {
    id: 'thousand_hours',
    title: 'Master',
    description: 'Accumulate 1000 hours of focus time',
    category: 'dedication',
    tier: 'platinum',
    icon: 'trophy',
    requirement: { type: 'totalHours', value: 1000 },
  },

  // Streak Achievements
  {
    id: 'three_day_streak',
    title: 'Building Momentum',
    description: 'Maintain a 3-day streak',
    category: 'streak',
    tier: 'bronze',
    icon: 'flame',
    requirement: { type: 'streak', value: 3 },
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    category: 'streak',
    tier: 'silver',
    icon: 'flash',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'month_streak',
    title: 'Consistency King',
    description: 'Maintain a 30-day streak',
    category: 'streak',
    tier: 'gold',
    icon: 'rocket',
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'hundred_day_streak',
    title: 'Unstoppable',
    description: 'Maintain a 100-day streak',
    category: 'streak',
    tier: 'platinum',
    icon: 'shield',
    requirement: { type: 'streak', value: 100 },
  },

  // Speed Achievements
  {
    id: 'long_session_2h',
    title: 'Deep Dive',
    description: 'Complete a 2-hour session',
    category: 'speed',
    tier: 'bronze',
    icon: 'timer',
    requirement: { type: 'longestSession', value: 120 },
  },
  {
    id: 'long_session_4h',
    title: 'Marathon Runner',
    description: 'Complete a 4-hour session',
    category: 'speed',
    tier: 'silver',
    icon: 'speedometer',
    requirement: { type: 'longestSession', value: 240 },
  },
  {
    id: 'long_session_8h',
    title: 'Ultra Endurance',
    description: 'Complete an 8-hour session',
    category: 'speed',
    tier: 'gold',
    icon: 'battery-full',
    requirement: { type: 'longestSession', value: 480 },
  },

  // Goal Achievements
  {
    id: 'first_goal',
    title: 'Goal Setter',
    description: 'Complete your first goal',
    category: 'milestone',
    tier: 'bronze',
    icon: 'flag',
    requirement: { type: 'completedGoals', value: 1 },
  },
  {
    id: 'ten_goals',
    title: 'Achiever',
    description: 'Complete 10 goals',
    category: 'milestone',
    tier: 'silver',
    icon: 'checkbox',
    requirement: { type: 'completedGoals', value: 10 },
  },
  {
    id: 'fifty_goals',
    title: 'Goal Master',
    description: 'Complete 50 goals',
    category: 'milestone',
    tier: 'gold',
    icon: 'ribbon',
    requirement: { type: 'completedGoals', value: 50 },
  },

  // Variety Achievements
  {
    id: 'five_categories',
    title: 'Jack of All Trades',
    description: 'Track time in 5 different categories',
    category: 'variety',
    tier: 'silver',
    icon: 'apps',
    requirement: { type: 'categoryCount', value: 5 },
  },
  {
    id: 'ten_categories',
    title: 'Renaissance Person',
    description: 'Track time in 10 different categories',
    category: 'variety',
    tier: 'gold',
    icon: 'grid',
    requirement: { type: 'categoryCount', value: 10 },
  },
];

export class AchievementService {
  /**
   * Load all achievements with progress
   */
  static async loadAchievements(): Promise<Achievement[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (stored) {
        const unlocked = JSON.parse(stored);
        
        // Merge with definitions to ensure all achievements exist
        return ACHIEVEMENT_DEFINITIONS.map(def => {
          const unlockedData = unlocked.find((u: Achievement) => u.id === def.id);
          return {
            ...def,
            isUnlocked: unlockedData?.isUnlocked || false,
            unlockedAt: unlockedData?.unlockedAt,
            progress: unlockedData?.progress || 0,
          };
        });
      }
      
      // First time - return all locked
      return ACHIEVEMENT_DEFINITIONS.map(def => ({
        ...def,
        isUnlocked: false,
        progress: 0,
      }));
    } catch (error) {
      logger.error('Failed to load achievements', error);
      return [];
    }
  }

  /**
   * Save achievements
   */
  static async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
    } catch (error) {
      logger.error('Failed to save achievements', error);
    }
  }

  /**
   * Unlock an achievement
   */
  static async unlockAchievement(achievementId: string): Promise<void> {
    try {
      const achievements = await this.loadAchievements();
      const achievement = achievements.find(a => a.id === achievementId);
      
      if (!achievement || achievement.isUnlocked) {
        return; // Already unlocked or doesn't exist
      }

      // Mark as unlocked
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date().toISOString();
      achievement.progress = achievement.requirement.value;

      await this.saveAchievements(achievements);

      // ==========================================
      // FAIR NOTIFICATION TRIGGER
      // ==========================================
      await NotificationService.sendAchievementUnlocked(
        achievement.title,
        achievement.tier
      );

      logger.success(`Achievement unlocked: ${achievement.title} (${achievement.tier})`);
    } catch (error) {
      logger.error('Failed to unlock achievement', error);
    }
  }

  /**
   * Check session-based achievements
   */
  static async checkSessionAchievements(
    session: Session,
    allSessions: Session[]
  ): Promise<void> {
    try {
      const achievements = await this.loadAchievements();
      const stats = this.calculateStats(allSessions);

      // Session count achievements
      const sessionCountAchievements = achievements.filter(
        a => a.requirement.type === 'sessionCount' && !a.isUnlocked
      );

      for (const achievement of sessionCountAchievements) {
        if (stats.totalSessions >= achievement.requirement.value) {
          await this.unlockAchievement(achievement.id);
        }
      }

      // Total hours achievements
      const hoursAchievements = achievements.filter(
        a => a.requirement.type === 'totalHours' && !a.isUnlocked
      );

      for (const achievement of hoursAchievements) {
        if (stats.totalHours >= achievement.requirement.value) {
          await this.unlockAchievement(achievement.id);
        }
      }

      // Longest session achievements
      const longestSessionAchievements = achievements.filter(
        a => a.requirement.type === 'longestSession' && !a.isUnlocked
      );

      const sessionMinutes = session.durationMs / (1000 * 60);
      for (const achievement of longestSessionAchievements) {
        if (sessionMinutes >= achievement.requirement.value) {
          await this.unlockAchievement(achievement.id);
        }
      }

      // Category count achievements
      const categoryAchievements = achievements.filter(
        a => a.requirement.type === 'categoryCount' && !a.isUnlocked
      );

      for (const achievement of categoryAchievements) {
        if (stats.uniqueCategories >= achievement.requirement.value) {
          await this.unlockAchievement(achievement.id);
        }
      }

      // Streak achievements
      const streakAchievements = achievements.filter(
        a => a.requirement.type === 'streak' && !a.isUnlocked
      );

      for (const achievement of streakAchievements) {
        if (stats.currentStreak >= achievement.requirement.value) {
          await this.unlockAchievement(achievement.id);
        }
      }
    } catch (error) {
      logger.error('Failed to check session achievements', error);
    }
  }

  /**
   * Check goal-based achievements
   */
  static async checkGoalAchievements(completedGoals: Goal[]): Promise<void> {
    try {
      const achievements = await this.loadAchievements();

      const goalAchievements = achievements.filter(
        a => a.requirement.type === 'completedGoals' && !a.isUnlocked
      );

      for (const achievement of goalAchievements) {
        if (completedGoals.length >= achievement.requirement.value) {
          await this.unlockAchievement(achievement.id);
        }
      }
    } catch (error) {
      logger.error('Failed to check goal achievements', error);
    }
  }

  /**
   * Calculate stats from sessions
   */
  private static calculateStats(sessions: Session[]) {
    const totalSessions = sessions.length;
    const totalMs = sessions.reduce((sum, s) => sum + s.durationMs, 0);
    const totalHours = totalMs / (1000 * 60 * 60);
    
    const uniqueCategories = new Set(sessions.map(s => s.categoryId)).size;
    
    // Calculate streak (simplified - checks consecutive days)
    const currentStreak = this.calculateStreak(sessions);

    return {
      totalSessions,
      totalHours,
      uniqueCategories,
      currentStreak,
    };
  }

  /**
   * Calculate current streak
   */
  private static calculateStreak(sessions: Session[]): number {
    if (sessions.length === 0) return 0;

    // Sort sessions by date (newest first)
    const sorted = [...sessions].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if there's a session today or yesterday
    const lastSession = new Date(sorted[0].startedAt);
    lastSession.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor(
      (currentDate.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > 1) {
      return 0; // Streak broken
    }

    // Count consecutive days
    const uniqueDays = new Set<string>();
    for (const session of sorted) {
      const sessionDate = new Date(session.startedAt);
      sessionDate.setHours(0, 0, 0, 0);
      const dateKey = sessionDate.toISOString().split('T')[0];
      uniqueDays.add(dateKey);
    }

    const days = Array.from(uniqueDays).sort().reverse();
    
    for (let i = 0; i < days.length; i++) {
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedKey = expectedDate.toISOString().split('T')[0];
      
      if (days[i] === expectedKey) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get achievement progress
   */
  static async getProgress(achievementId: string): Promise<number> {
    try {
      const achievements = await this.loadAchievements();
      const achievement = achievements.find(a => a.id === achievementId);
      return achievement?.progress || 0;
    } catch (error) {
      logger.error('Failed to get achievement progress', error);
      return 0;
    }
  }

  /**
   * Get unlocked count by tier
   */
  static async getUnlockedByTier(): Promise<Record<AchievementTier, number>> {
    try {
      const achievements = await this.loadAchievements();
      const unlocked = achievements.filter(a => a.isUnlocked);

      return {
        bronze: unlocked.filter(a => a.tier === 'bronze').length,
        silver: unlocked.filter(a => a.tier === 'silver').length,
        gold: unlocked.filter(a => a.tier === 'gold').length,
        platinum: unlocked.filter(a => a.tier === 'platinum').length,
      };
    } catch (error) {
      logger.error('Failed to get unlocked by tier', error);
      return { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    }
  }
}

export default AchievementService;