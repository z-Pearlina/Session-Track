/**
 * Application Configuration Constants
 *
 * Centralized configuration for magic numbers and app settings.
 * Makes the codebase more maintainable and easier to tune.
 *
 * Usage:
 * import { APP_CONFIG } from '../config/constants';
 *
 * const maxCategories = APP_CONFIG.MAX_VISIBLE_DASHBOARD_CATEGORIES;
 */

/**
 * Application-wide configuration
 */
export const APP_CONFIG = {
  /**
   * Dashboard Settings
   */
  MAX_VISIBLE_DASHBOARD_CATEGORIES: 4,

  /**
   * Timer Settings
   */
  TIMER_UPDATE_INTERVAL_MS: 1000, // Update every 1 second (optimized from 100ms)
  TIMER_MIN_DURATION_FOR_SAVE_MS: 1000, // Minimum 1 second to save session

  /**
   * UI/UX Settings
   */
  FILTER_DEBOUNCE_MS: 300, // Debounce time for search/filter inputs
  ANIMATION_DURATION_FAST_MS: 150,
  ANIMATION_DURATION_NORMAL_MS: 250,
  ANIMATION_DURATION_SLOW_MS: 400,

  /**
   * Session Limits
   */
  SESSION_MIN_DURATION_SECONDS: 1,
  SESSION_MIN_DURATION_MINUTES: 1,
  SESSION_MAX_DURATION_HOURS: 24,
  SESSION_MAX_DURATION_MINUTES: 1440, // 24 hours in minutes
  SESSION_MAX_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours in milliseconds

  /**
   * Input Validation Limits
   */
  CATEGORY_NAME_MIN_LENGTH: 1,
  CATEGORY_NAME_MAX_LENGTH: 30,
  SESSION_TITLE_MAX_LENGTH: 100,
  SESSION_NOTES_MAX_LENGTH: 500,

  /**
   * Storage Settings
   */
  STORAGE_VERSION: 1,
  STORAGE_BACKUP_COUNT: 3, // Keep 3 most recent backups
  STORAGE_RETRY_ATTEMPTS: 3,
  STORAGE_RETRY_DELAY_BASE_MS: 100, // Base delay for exponential backoff
  STORAGE_RETRY_MULTIPLIER: 2, // Exponential backoff multiplier

  /**
   * Chart/Stats Settings
   */
  STATS_DAYS_IN_WEEK: 7,
  STATS_MONTHS_IN_YEAR: 12,
  STATS_SCROLL_PAGINATION_LIMIT: 100, // Max data points before pagination

  /**
   * Export Settings
   */
  EXPORT_CSV_DELIMITER: ',',
  EXPORT_FILENAME_DATE_FORMAT: 'YYYY-MM-DD',

  /**
   * Performance Settings
   */
  LIST_INITIAL_NUM_TO_RENDER: 10, // FlatList initial items
  LIST_MAX_TO_RENDER_PER_BATCH: 10, // FlatList batch size
  LIST_WINDOW_SIZE: 10, // FlatList window size
} as const;

/**
 * Storage Keys
 * Centralized keys for AsyncStorage to prevent typos
 */
export const STORAGE_KEYS = {
  SESSIONS: '@trackora_sessions',
  CATEGORIES: '@trackora_categories',
  DASHBOARD_PREFERENCES: '@trackora_dashboard_preferences',
  STORAGE_VERSION: '@trackora_storage_version',
  BACKUP_PREFIX: '@trackora_backup_',
} as const;

/**
 * Default Category IDs
 * Reference IDs for default categories that cannot be deleted
 */
export const DEFAULT_CATEGORY_IDS = {
  WORK: 'work',
  STUDY: 'study',
  HABITS: 'habits',
  FITNESS: 'fitness',
  GENERAL: 'general',
} as const;

/**
 * Error Messages
 * Centralized user-facing error messages
 */
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
} as const;

/**
 * Success Messages
 * Centralized user-facing success messages
 */
export const SUCCESS_MESSAGES = {
  SESSION_SAVED: 'Session saved successfully',
  SESSION_DELETED: 'Session deleted',
  CATEGORY_SAVED: 'Category saved successfully',
  CATEGORY_DELETED: 'Category deleted',
  DATA_EXPORTED: 'Data exported successfully',
  DATA_IMPORTED: 'Data imported successfully',
  PREFERENCES_SAVED: 'Preferences saved',
} as const;

/**
 * Feature Flags
 * Enable/disable features for development or A/B testing
 */
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: false, // Analytics tracking
  ENABLE_CLOUD_SYNC: false, // Cloud synchronization
  ENABLE_NOTIFICATIONS: false, // Push notifications
  ENABLE_DARK_MODE: false, // Dark mode toggle
  ENABLE_ADVANCED_STATS: true, // Advanced statistics features
  ENABLE_EXPORT: true, // Data export features
  ENABLE_IMPORT: true, // Data import features
  ENABLE_DEBUG_MODE: __DEV__, // Debug features
} as const;

/**
 * Date/Time Formats
 * Standardized date/time formatting strings
 */
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM D, YYYY', // Jan 1, 2024
  DISPLAY_TIME: 'h:mm A', // 2:30 PM
  DISPLAY_DATETIME: 'MMM D, YYYY h:mm A', // Jan 1, 2024 2:30 PM
  ISO_DATE: 'YYYY-MM-DD', // 2024-01-01
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ', // ISO 8601
  FILENAME_DATE: 'YYYY-MM-DD_HHmmss', // 2024-01-01_143045
} as const;

/**
 * Screen Names
 * Navigation screen identifiers
 */
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
} as const;

/**
 * Type exports for TypeScript
 */
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type DefaultCategoryId = typeof DEFAULT_CATEGORY_IDS[keyof typeof DEFAULT_CATEGORY_IDS];
export type ScreenName = typeof SCREEN_NAMES[keyof typeof SCREEN_NAMES];
