export const STORAGE_KEYS = {
  SESSIONS: '@flowtrix:sessions',
  CATEGORIES: '@flowtrix:categories',
  GOALS: '@flowtrix:goals',
  ACHIEVEMENTS: '@flowtrix:achievements',
  DASHBOARD_PREFERENCES: '@flowtrix:dashboard_preferences',
  NOTIFICATION_PREFERENCES: '@flowtrix:notification_preferences',
  STORAGE_VERSION: '@flowtrix:storage_version',
  BACKUP_PREFIX: '@flowtrix:backup:',
} as const;

export const APP_CONFIG = {
  STORAGE_VERSION: 1,
  STORAGE_RETRY_ATTEMPTS: 3,
  STORAGE_RETRY_DELAY_BASE_MS: 100,
  STORAGE_RETRY_MULTIPLIER: 2,
  MAX_SESSIONS_DISPLAY: 100,
  MAX_CATEGORIES: 20,
  MAX_GOALS: 50,
  CHART_DATA_POINTS_LIMIT: 30,
} as const;

export const SUCCESS_MESSAGES = {
  SESSION_SAVED: 'Session saved successfully!',
  SESSION_DELETED: 'Session deleted',
  SESSION_UPDATED: 'Session updated successfully!',
  CATEGORY_SAVED: 'Category created successfully!',
  CATEGORY_UPDATED: 'Category updated successfully!',
  CATEGORY_DELETED: 'Category deleted',
  GOAL_CREATED: 'Goal created successfully!',
  GOAL_UPDATED: 'Goal updated!',
  GOAL_DELETED: 'Goal deleted',
  GOAL_COMPLETED: 'Congratulations on completing your goal!',
  PREFERENCES_SAVED: 'Preferences saved',
  DATA_EXPORTED: 'Data exported successfully',
} as const;

export const ERROR_MESSAGES = {
  SESSION_SAVE_FAILED: 'Failed to save session',
  SESSION_DELETE_FAILED: 'Failed to delete session',
  SESSION_UPDATE_FAILED: 'Failed to update session',
  SESSION_LOAD_FAILED: 'Failed to load sessions',
  CATEGORY_SAVE_FAILED: 'Failed to create category',
  CATEGORY_UPDATE_FAILED: 'Failed to update category',
  CATEGORY_DELETE_FAILED: 'Failed to delete category',
  CATEGORY_LOAD_FAILED: 'Failed to load categories',
  CATEGORY_IN_USE: 'Cannot delete category that is in use',
  GOAL_SAVE_FAILED: 'Failed to create goal',
  GOAL_UPDATE_FAILED: 'Failed to update goal',
  GOAL_DELETE_FAILED: 'Failed to delete goal',
  GOAL_LOAD_FAILED: 'Failed to load goals',
  VALIDATION_FAILED: 'Please check your inputs',
  PREFERENCES_SAVE_FAILED: 'Failed to save preferences',
  DATA_EXPORT_FAILED: 'Failed to export data',
  PERMISSION_DENIED: 'Permission denied',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

export const VALIDATION_RULES = {
  CATEGORY_NAME_MIN_LENGTH: 1,
  CATEGORY_NAME_MAX_LENGTH: 30,
  SESSION_TITLE_MIN_LENGTH: 1,
  SESSION_TITLE_MAX_LENGTH: 100,
  SESSION_NOTES_MAX_LENGTH: 500,
  SESSION_MIN_DURATION_SECONDS: 1,
  SESSION_MAX_DURATION_HOURS: 24,
  SESSION_MIN_DURATION_MINUTES: 1,
  SESSION_MAX_DURATION_MINUTES: 1440,
  GOAL_TITLE_MIN_LENGTH: 1,
  GOAL_TITLE_MAX_LENGTH: 100,
  GOAL_DESCRIPTION_MAX_LENGTH: 500,
  GOAL_MIN_TARGET_MINUTES: 1,
  GOAL_MAX_TARGET_MINUTES: 10000,
} as const;

export const NOTIFICATION_DEFAULTS = {
  DAILY_REMINDER_TIME: '20:00',
  GOAL_REMINDER_DAYS_BEFORE: 1,
  STREAK_REMINDER_TIME: '19:00',
} as const;