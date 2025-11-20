import { NavigationProp, RouteProp, NavigatorScreenParams } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export interface SessionTemplate {
  id: string;
  name: string;
  categoryId: string;
  defaultDuration?: number; 
  notes?: string;
  icon: string;
  color: string;
  createdAt: string;
  usageCount: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Session {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  durationMs: number;
  startedAt: string;
  endedAt: string;
  notes?: string;
  goalId?: string;
  tags?: string[]; 
  templateId?: string; 
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  order?: number;
  createdAt: string;
  isDefault?: boolean;
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
  StartSession: { goalId?: string; categoryId?: string } | undefined;
  Stats: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
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
export type StartSessionRouteProp = RouteProp<MainTabParamList, 'StartSession'>;

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
  sessions: Session[];
  categories: Category[];
  goals: Goal[];
  exportedAt: string;
  version: string;
}

export interface SessionFormData {
  title: string;
  categoryId: string;
  durationMs: number;
  notes?: string;
  startedAt: string;
  endedAt: string;
}
