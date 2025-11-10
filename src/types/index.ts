import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface Session {
  id: string;
  title: string;
  categoryId: string;
  durationMs: number;
  notes?: string;
  startedAt: string;  // ISO 8601 timestamp
  endedAt: string;    // ISO 8601 timestamp
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  isDefault?: boolean; // Can't be deleted
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  createdAt: string;
}

// Filter types
export interface SessionFilter {
  categoryId?: string | null;
  dateRange?: DateRange | null;
  searchQuery?: string;
}

export interface DateRange {
  start: string; // ISO date
  end: string;   // ISO date
}

export type DateRangePreset = 'today' | 'week' | 'month' | 'custom';

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  EditSession: { sessionId: string };
};

export type MainTabParamList = {
  Home: undefined;
  StartSession: undefined;
  Stats: undefined;
  Settings: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;