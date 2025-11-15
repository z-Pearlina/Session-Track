export const APP_CONFIG = {
  MAX_VISIBLE_DASHBOARD_CATEGORIES: 4,
  TIMER_UPDATE_INTERVAL_MS: 1000,
  TIMER_MIN_DURATION_FOR_SAVE_MS: 1000,
  FILTER_DEBOUNCE_MS: 300,
  
  ANIMATION_DURATION_FAST_MS: 150,
  ANIMATION_DURATION_NORMAL_MS: 250,
  ANIMATION_DURATION_SLOW_MS: 400,

  SESSION_MIN_DURATION_SECONDS: 1,
  SESSION_MIN_DURATION_MINUTES: 1,
  SESSION_MAX_DURATION_HOURS: 24,
  SESSION_MAX_DURATION_MINUTES: 1440,
  SESSION_MAX_DURATION_MS: 24 * 60 * 60 * 1000,

  CATEGORY_NAME_MIN_LENGTH: 1,
  CATEGORY_NAME_MAX_LENGTH: 30,
  SESSION_TITLE_MAX_LENGTH: 100,
  SESSION_NOTES_MAX_LENGTH: 500,

  STORAGE_VERSION: 1,
  STORAGE_BACKUP_COUNT: 3,
  STORAGE_RETRY_ATTEMPTS: 3,
  STORAGE_RETRY_DELAY_BASE_MS: 100,
  STORAGE_RETRY_MULTIPLIER: 2,

  STATS_DAYS_IN_WEEK: 7,
  STATS_MONTHS_IN_YEAR: 12,
  STATS_SCROLL_PAGINATION_LIMIT: 100,

  EXPORT_CSV_DELIMITER: ',',
  EXPORT_FILENAME_DATE_FORMAT: 'YYYY-MM-DD',

  LIST_INITIAL_NUM_TO_RENDER: 10,
  LIST_MAX_TO_RENDER_PER_BATCH: 10,
  LIST_WINDOW_SIZE: 10,
} as const;

export const STORAGE_KEYS = {
  SESSIONS: '@session_track:sessions',
  CATEGORIES: '@session_track:categories',
  DASHBOARD_PREFERENCES: '@session_track:dashboard_prefs',
  GOALS: '@session_track:goals',
  ACHIEVEMENTS: '@session_track:achievements',
  NOTIFICATION_PREFERENCES: '@session_track:notification_prefs',
  STORAGE_VERSION: '@session_track:storage_version',
  BACKUP_PREFIX: '@session_track:backup_',
} as const;

export const DEFAULT_CATEGORY_IDS = {
  WORK: 'work',
  STUDY: 'study',
  HABITS: 'habits',
  FITNESS: 'fitness',
  GENERAL: 'general',
} as const;

export const ERROR_MESSAGES = {
  STORAGE_INIT_FAILED: 'Failed to initialize storage. Please restart the app.',
  STORAGE_SAVE_FAILED: 'Failed to save data. Please try again.',
  STORAGE_LOAD_FAILED: 'Failed to load data. Using defaults.',
  SESSION_SAVE_FAILED: 'Failed to save session. Please try again.',
  SESSION_DELETE_FAILED: 'Failed to delete session. Please try again.',
  CATEGORY_SAVE_FAILED: 'Failed to save category. Please try again.',
  CATEGORY_DELETE_FAILED: 'Failed to delete category. Please try again.',
  CATEGORY_HAS_SESSIONS: 'Cannot delete category with active sessions.',
  EXPORT_FAILED: 'Failed to export data. Please try again.',
  IMPORT_FAILED: 'Failed to import data. Please check the file format.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  GOAL_SAVE_FAILED: 'Failed to save goal. Please try again.',
  GOAL_DELETE_FAILED: 'Failed to delete goal. Please try again.',
  ACHIEVEMENT_UNLOCK_FAILED: 'Failed to unlock achievement.',
  NOTIFICATION_PERMISSION_DENIED: 'Notification permissions are required for reminders.',
} as const;

export const SUCCESS_MESSAGES = {
  SESSION_SAVED: 'Session saved successfully',
  SESSION_DELETED: 'Session deleted',
  CATEGORY_SAVED: 'Category saved successfully',
  CATEGORY_DELETED: 'Category deleted',
  DATA_EXPORTED: 'Data exported successfully',
  DATA_IMPORTED: 'Data imported successfully',
  PREFERENCES_SAVED: 'Preferences saved',
  GOAL_CREATED: 'Goal created successfully',
  GOAL_COMPLETED: 'Goal completed! 🎉',
  ACHIEVEMENT_UNLOCKED: 'Achievement unlocked! 🏆',
} as const;

export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: false,
  ENABLE_CLOUD_SYNC: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: false,
  ENABLE_ADVANCED_STATS: true,
  ENABLE_EXPORT: true,
  ENABLE_IMPORT: true,
  ENABLE_GOALS: true,
  ENABLE_ACHIEVEMENTS: true,
  ENABLE_DEBUG_MODE: __DEV__,
} as const;

export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM D, YYYY',
  DISPLAY_TIME: 'h:mm A',
  DISPLAY_DATETIME: 'MMM D, YYYY h:mm A',
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  FILENAME_DATE: 'YYYY-MM-DD_HHmmss',
} as const;

export const SCREEN_NAMES = {
  HOME: 'Home',
  TRACK: 'Track',
  STATS: 'Stats',
  SETTINGS: 'Settings',
  START_SESSION: 'StartSession',
  EDIT_SESSION: 'EditSession',
  SESSION_DETAILS: 'SessionDetails',
  CALENDAR: 'Calendar',
  CATEGORY_MANAGER: 'CategoryManager',
  CUSTOMIZE_DASHBOARD: 'CustomizeDashboard',
  GOALS: 'Goals',
  GOAL_DETAILS: 'GoalDetails',
  CREATE_GOAL: 'CreateGoal',
  ACHIEVEMENTS: 'Achievements',
  NOTIFICATION_SETTINGS: 'NotificationSettings',
} as const;

export const NOTIFICATION_CONFIG = {
  DEFAULT_REMINDER_TIME: '20:00',
  MIN_GOAL_REMINDER_MINUTES: 15,
  STREAK_REMINDER_TIME: '21:00',
} as const;

export const ACHIEVEMENT_IDS = {
  FIRST_SESSION: 'achievement_first_session',
  TEN_HOURS: 'achievement_10_hours',
  FIFTY_HOURS: 'achievement_50_hours',
  HUNDRED_HOURS: 'achievement_100_hours',
  STREAK_3: 'achievement_streak_3',
  STREAK_7: 'achievement_streak_7',
  STREAK_30: 'achievement_streak_30',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type DefaultCategoryId = typeof DEFAULT_CATEGORY_IDS[keyof typeof DEFAULT_CATEGORY_IDS];
export type ScreenName = typeof SCREEN_NAMES[keyof typeof SCREEN_NAMES];
export type AchievementId = typeof ACHIEVEMENT_IDS[keyof typeof ACHIEVEMENT_IDS];