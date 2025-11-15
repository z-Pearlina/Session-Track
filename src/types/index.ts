import { NavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export interface Session {
  id: string;
  title: string;
  categoryId: string;
  durationMs: number;
  startedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  order?: number;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetMinutes: number;
  currentProgress: number;
  period: GoalPeriod;
  categoryId?: string;
  status: GoalStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';
export type GoalStatus = 'active' | 'completed' | 'archived' | 'failed';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  requirement: AchievementRequirement;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

export type AchievementCategory = 'milestone' | 'streak' | 'dedication' | 'variety' | 'speed';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AchievementRequirement {
  type: 'totalHours' | 'streak' | 'sessionCount' | 'categoryCount' | 'longestSession';
  value: number;
}

export interface UserAchievementProgress {
  achievementId: string;
  currentValue: number;
  lastUpdated: string;
}

export interface DashboardPreferences {
  visibleCategoryIds: string[];
}

export interface NotificationPreferences {
  enabled: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  streakReminderEnabled: boolean;
  goalReminderEnabled: boolean;
  achievementNotificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface SessionFilter {
  categoryId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

export type MainTabParamList = {
  Home: undefined;
  StartSession: undefined;
  Stats: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  EditSession: { sessionId: string };
  SessionDetails: { sessionId: string };
  Calendar: undefined;
  CategoryManager: undefined;
  CustomizeDashboard: undefined;
  Goals: undefined;
  GoalDetails: { goalId: string };
  CreateGoal: undefined;
  Achievements: undefined;
  NotificationSettings: undefined;
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = NavigationProp<MainTabParamList>;

export type EditSessionRouteProp = RouteProp<RootStackParamList, 'EditSession'>;
export type SessionDetailsRouteProp = RouteProp<RootStackParamList, 'SessionDetails'>;
export type GoalDetailsRouteProp = RouteProp<RootStackParamList, 'GoalDetails'>;

export type TimeRange = 'week' | 'month' | 'year' | 'all';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  date?: Date;
}

export interface StatisticsSummary {
  totalSessions: number;
  totalDurationMs: number;
  totalHours: number;
  averageSessionMinutes: number;
  longestSessionMs: number;
  currentStreak: number;
  activeDays: number;
}

export interface ExportData {
  appName: string;
  exportDate: string;
  version: string;
  data: {
    sessions: Session[];
    categories: Category[];
    goals?: Goal[];
    achievements?: Achievement[];
    preferences?: DashboardPreferences;
    notificationPreferences?: NotificationPreferences;
  };
  stats: {
    totalSessions: number;
    totalCategories: number;
    totalDurationMs: number;
    totalGoals?: number;
    unlockedAchievements?: number;
  };
}

export interface SessionFormData {
  title: string;
  categoryId: string;
  durationMs: number;
  notes?: string;
}

export interface CategoryFormData {
  name: string;
  color: string;
  icon: string;
}

export interface GoalFormData {
  title: string;
  description?: string;
  targetMinutes: number;
  period: GoalPeriod;
  categoryId?: string;
  startDate: string;
  endDate: string;
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}