import { Achievement, Session, Goal, AchievementRequirement } from '../types';
import { StorageService } from './StorageService';
import { NotificationService } from './NotificationService';
import { logger } from './logger';

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first session',
    category: 'milestone',
    tier: 'bronze',
    icon: 'footsteps',
    requirement: { type: 'sessionCount', value: 1 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'getting_started',
    title: 'Getting Started',
    description: 'Complete 5 sessions',
    category: 'milestone',
    tier: 'bronze',
    icon: 'rocket',
    requirement: { type: 'sessionCount', value: 5 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'session_master',
    title: 'Session Master',
    description: 'Complete 25 sessions',
    category: 'milestone',
    tier: 'silver',
    icon: 'star',
    requirement: { type: 'sessionCount', value: 25 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'productivity_pro',
    title: 'Productivity Pro',
    description: 'Complete 50 sessions',
    category: 'milestone',
    tier: 'gold',
    icon: 'trophy',
    requirement: { type: 'sessionCount', value: 50 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Complete 100 sessions',
    category: 'milestone',
    tier: 'platinum',
    icon: 'medal',
    requirement: { type: 'sessionCount', value: 100 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'hour_one',
    title: 'First Hour',
    description: 'Track 1 hour total',
    category: 'dedication',
    tier: 'bronze',
    icon: 'time',
    requirement: { type: 'totalHours', value: 1 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'ten_hour_club',
    title: '10 Hour Club',
    description: 'Track 10 hours total',
    category: 'dedication',
    tier: 'bronze',
    icon: 'hourglass',
    requirement: { type: 'totalHours', value: 10 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'half_century',
    title: 'Half Century',
    description: 'Track 50 hours total',
    category: 'dedication',
    tier: 'silver',
    icon: 'timer',
    requirement: { type: 'totalHours', value: 50 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'time_lord',
    title: 'Time Lord',
    description: 'Track 100 hours total',
    category: 'dedication',
    tier: 'gold',
    icon: 'infinite',
    requirement: { type: 'totalHours', value: 100 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'time_master',
    title: 'Time Master',
    description: 'Track 500 hours total',
    category: 'dedication',
    tier: 'platinum',
    icon: 'sparkles',
    requirement: { type: 'totalHours', value: 500 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'consistency',
    title: 'Consistency',
    description: 'Track sessions for 3 days in a row',
    category: 'streak',
    tier: 'bronze',
    icon: 'flame',
    requirement: { type: 'streak', value: 3 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Track sessions for 7 days in a row',
    category: 'streak',
    tier: 'silver',
    icon: 'calendar',
    requirement: { type: 'streak', value: 7 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'fortnight_fighter',
    title: 'Fortnight Fighter',
    description: 'Track sessions for 14 days in a row',
    category: 'streak',
    tier: 'gold',
    icon: 'calendar-sharp',
    requirement: { type: 'streak', value: 14 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'monthly_champion',
    title: 'Monthly Champion',
    description: 'Track sessions for 30 days in a row',
    category: 'streak',
    tier: 'platinum',
    icon: 'ribbon',
    requirement: { type: 'streak', value: 30 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'goal_getter',
    title: 'Goal Getter',
    description: 'Complete your first goal',
    category: 'milestone',
    tier: 'bronze',
    icon: 'flag',
    requirement: { type: 'completedGoals', value: 1 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'goal_crusher',
    title: 'Goal Crusher',
    description: 'Complete 5 goals',
    category: 'milestone',
    tier: 'silver',
    icon: 'flag-sharp',
    requirement: { type: 'completedGoals', value: 5 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'goal_master',
    title: 'Goal Master',
    description: 'Complete 10 goals',
    category: 'milestone',
    tier: 'gold',
    icon: 'trophy-sharp',
    requirement: { type: 'completedGoals', value: 10 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'goal_legend',
    title: 'Goal Legend',
    description: 'Complete 25 goals',
    category: 'milestone',
    tier: 'platinum',
    icon: 'diamond',
    requirement: { type: 'completedGoals', value: 25 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'focused_session',
    title: 'Focused',
    description: 'Complete a session longer than 2 hours',
    category: 'dedication',
    tier: 'silver',
    icon: 'eye',
    requirement: { type: 'longestSession', value: 120 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'marathon_session',
    title: 'Marathon',
    description: 'Complete a session longer than 4 hours',
    category: 'dedication',
    tier: 'gold',
    icon: 'fitness',
    requirement: { type: 'longestSession', value: 240 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a session before 6 AM',
    category: 'speed',
    tier: 'bronze',
    icon: 'sunny',
    requirement: { type: 'earlyBird', value: 1 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a session after 10 PM',
    category: 'speed',
    tier: 'bronze',
    icon: 'moon',
    requirement: { type: 'nightOwl', value: 1 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Complete 10 sessions on weekends',
    category: 'variety',
    tier: 'silver',
    icon: 'beer',
    requirement: { type: 'weekend', value: 10 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'category_explorer',
    title: 'Category Explorer',
    description: 'Use 5 different categories',
    category: 'variety',
    tier: 'bronze',
    icon: 'grid',
    requirement: { type: 'categoryCount', value: 5 },
    isUnlocked: false,
    progress: 0,
  },
];

export class AchievementService {
  static async checkSessionAchievements(session: Session, allSessions: Session[]): Promise<void> {
    try {
      const achievements = await this.loadAchievements();
      const newlyUnlocked: Achievement[] = [];

      const metrics = this.calculateMetrics(allSessions);

      for (const achievement of achievements) {
        if (achievement.isUnlocked) {
          continue;
        }

        const { shouldUnlock, progress } = this.checkAchievement(
          achievement,
          metrics,
          session
        );

        achievement.progress = progress;

        if (shouldUnlock && !achievement.isUnlocked) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(achievement);
          
          logger.success(`Achievement unlocked: ${achievement.title}`);
        }
      }

      await this.saveAchievements(achievements);

      for (const achievement of newlyUnlocked) {
        await NotificationService.sendAchievementUnlocked(
          achievement.title,
          achievement.description
        );
      }
    } catch (error) {
      logger.error('Failed to check session achievements', error);
    }
  }

  static async checkGoalAchievements(completedGoals: Goal[]): Promise<void> {
    try {
      const achievements = await this.loadAchievements();
      const newlyUnlocked: Achievement[] = [];

      const completedGoalCount = completedGoals.filter(
        g => g.status === 'completed'
      ).length;

      for (const achievement of achievements) {
        if (achievement.isUnlocked) {
          continue;
        }

        if (achievement.requirement.type === 'completedGoals') {
          const progress = completedGoalCount;
          achievement.progress = progress;

          if (progress >= achievement.requirement.value) {
            achievement.isUnlocked = true;
            achievement.unlockedAt = new Date().toISOString();
            newlyUnlocked.push(achievement);
            
            logger.success(`Goal achievement unlocked: ${achievement.title}`);
          }
        }
      }

      await this.saveAchievements(achievements);

      for (const achievement of newlyUnlocked) {
        await NotificationService.sendAchievementUnlocked(
          achievement.title,
          achievement.description
        );
      }
    } catch (error) {
      logger.error('Failed to check goal achievements', error);
    }
  }

  private static calculateMetrics(sessions: Session[]) {
    const sessionCount = sessions.length;

    const totalMs = sessions.reduce((sum, s) => sum + s.durationMs, 0);
    const totalHours = totalMs / (1000 * 60 * 60);

    const currentStreak = this.calculateCurrentStreak(sessions);

    const longestSessionMinutes = sessions.length > 0
      ? Math.max(...sessions.map(s => s.durationMs / (1000 * 60)))
      : 0;

    const uniqueCategories = new Set(sessions.map(s => s.categoryId));
    const categoryCount = uniqueCategories.size;

    const weekendSessions = sessions.filter(s => {
      const day = new Date(s.startedAt).getDay();
      return day === 0 || day === 6;
    }).length;

    const earlyBirdSessions = sessions.filter(s => {
      const hour = new Date(s.startedAt).getHours();
      return hour < 6;
    }).length;

    const nightOwlSessions = sessions.filter(s => {
      const hour = new Date(s.startedAt).getHours();
      return hour >= 22;
    }).length;

    return {
      sessionCount,
      totalHours,
      currentStreak,
      longestSessionMinutes,
      categoryCount,
      weekendSessions,
      earlyBirdSessions,
      nightOwlSessions,
    };
  }

  private static calculateCurrentStreak(sessions: Session[]): number {
    if (sessions.length === 0) return 0;

    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    const uniqueDays = new Set<string>();
    sortedSessions.forEach(session => {
      const dateStr = new Date(session.startedAt).toDateString();
      uniqueDays.add(dateStr);
    });

    const days = Array.from(uniqueDays).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (days[0] !== today && days[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < days.length; i++) {
      const currentDate = new Date(days[i]);
      const previousDate = new Date(days[i - 1]);
      const diffDays = Math.floor(
        (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private static checkAchievement(
    achievement: Achievement,
    metrics: ReturnType<typeof this.calculateMetrics>,
    currentSession: Session
  ): { shouldUnlock: boolean; progress: number } {
    const { type, value } = achievement.requirement;

    switch (type) {
      case 'sessionCount':
        return {
          shouldUnlock: metrics.sessionCount >= value,
          progress: metrics.sessionCount,
        };

      case 'totalHours':
        return {
          shouldUnlock: metrics.totalHours >= value,
          progress: Math.floor(metrics.totalHours),
        };

      case 'streak':
        return {
          shouldUnlock: metrics.currentStreak >= value,
          progress: metrics.currentStreak,
        };

      case 'longestSession':
        return {
          shouldUnlock: metrics.longestSessionMinutes >= value,
          progress: Math.floor(metrics.longestSessionMinutes),
        };

      case 'categoryCount':
        return {
          shouldUnlock: metrics.categoryCount >= value,
          progress: metrics.categoryCount,
        };

      case 'weekend':
        return {
          shouldUnlock: metrics.weekendSessions >= value,
          progress: metrics.weekendSessions,
        };

      case 'earlyBird':
        return {
          shouldUnlock: metrics.earlyBirdSessions >= value,
          progress: metrics.earlyBirdSessions,
        };

      case 'nightOwl':
        return {
          shouldUnlock: metrics.nightOwlSessions >= value,
          progress: metrics.nightOwlSessions,
        };

      case 'completedGoals':
        return {
          shouldUnlock: false,
          progress: achievement.progress,
        };

      default:
        return { shouldUnlock: false, progress: 0 };
    }
  }

  private static async loadAchievements(): Promise<Achievement[]> {
    try {
      const stored = await StorageService.getAchievements();
      
      if (stored.length === 0) {
        await this.saveAchievements(ACHIEVEMENT_DEFINITIONS);
        return [...ACHIEVEMENT_DEFINITIONS];
      }

      return this.mergeAchievements(stored, ACHIEVEMENT_DEFINITIONS);
    } catch (error) {
      logger.error('Failed to load achievements', error);
      return [...ACHIEVEMENT_DEFINITIONS];
    }
  }

  private static mergeAchievements(
    stored: Achievement[],
    definitions: Achievement[]
  ): Achievement[] {
    const merged: Achievement[] = [];

    for (const def of definitions) {
      const existing = stored.find(a => a.id === def.id);
      
      if (existing) {
        merged.push({
          ...def,
          isUnlocked: existing.isUnlocked,
          unlockedAt: existing.unlockedAt,
          progress: existing.progress,
        });
      } else {
        merged.push({ ...def });
      }
    }

    return merged;
  }

  private static async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await StorageService.saveAchievements(achievements);
    } catch (error) {
      logger.error('Failed to save achievements', error);
      throw error;
    }
  }

  static async getAllAchievements(): Promise<Achievement[]> {
    return await this.loadAchievements();
  }

  static async getUnlockedCount(): Promise<number> {
    const achievements = await this.loadAchievements();
    return achievements.filter(a => a.isUnlocked).length;
  }

  static async getAchievementById(id: string): Promise<Achievement | undefined> {
    const achievements = await this.loadAchievements();
    return achievements.find(a => a.id === id);
  }

  static async recalculateAllProgress(
    sessions: Session[],
    goals: Goal[]
  ): Promise<void> {
    const achievements = await this.loadAchievements();
    const metrics = this.calculateMetrics(sessions);
    const completedGoalCount = goals.filter(g => g.status === 'completed').length;

    for (const achievement of achievements) {
      if (achievement.isUnlocked) continue;

      const { type, value } = achievement.requirement;

      switch (type) {
        case 'sessionCount':
          achievement.progress = metrics.sessionCount;
          break;
        case 'totalHours':
          achievement.progress = Math.floor(metrics.totalHours);
          break;
        case 'streak':
          achievement.progress = metrics.currentStreak;
          break;
        case 'longestSession':
          achievement.progress = Math.floor(metrics.longestSessionMinutes);
          break;
        case 'categoryCount':
          achievement.progress = metrics.categoryCount;
          break;
        case 'weekend':
          achievement.progress = metrics.weekendSessions;
          break;
        case 'earlyBird':
          achievement.progress = metrics.earlyBirdSessions;
          break;
        case 'nightOwl':
          achievement.progress = metrics.nightOwlSessions;
          break;
        case 'completedGoals':
          achievement.progress = completedGoalCount;
          break;
      }

      if (achievement.progress >= value && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date().toISOString();
      }
    }

    await this.saveAchievements(achievements);
    logger.info('Recalculated all achievement progress');
  }
}