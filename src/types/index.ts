import { StackNavigationProp } from '@react-navigation/stack';

export type GoalPeriod = 'daily' | 'weekly' | 'monthly';
export type GoalStatus = 'active' | 'completed' | 'failed' | 'archived';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  targetMinutes: number;
  period: GoalPeriod;
  startDate: string;
  endDate: string;
  currentProgress: number;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type AchievementCategory = 
  | 'milestone' 
  | 'streak' 
  | 'consistency' 
  | 'speed' 
  | 'variety' 
  | 'dedication';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  requirement: {
    type: 'totalHours' | 'streak' | 'sessionCount' | 'categoryCount' | 'custom';
    value: number;
  };
  unlockedAt?: string;
  isUnlocked: boolean;
  progress: number;
}

export interface UserAchievementProgress {
  achievementId: string;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  notificationShown: boolean;
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

export interface Session {
  id: string;
  title: string;
  categoryId: string;
  durationMs: number;
  notes?: string;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  isDefault?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface DashboardPreferences {
  visibleCategoryIds: string[];
}

export interface SessionFilter {
  categoryId?: string | null;
  dateRange?: DateRange | null;
  searchQuery?: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export type DateRangePreset = 'today' | 'week' | 'month' | 'custom';

export type RootStackParamList = {
  MainTabs: undefined;
  EditSession: { sessionId: string };
  SessionDetails: { sessionId: string };
  Calendar: undefined;
  CategoryManager: undefined;
  CustomizeDashboard: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  StartSession: undefined;
  Stats: undefined;
  Settings: undefined;
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;