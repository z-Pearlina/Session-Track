/**
 * Validation Service
 *
 * Centralized validation logic for all user inputs.
 * Returns null if valid, or an error message string if invalid.
 *
 * Usage:
 * import { validation } from '../services/validation';
 *
 * const error = validation.validateCategoryName(name);
 * if (error) {
 *   Alert.alert('Validation Error', error);
 *   return;
 * }
 */

import { Category } from '../types';

// Configuration constants for validation rules
const VALIDATION_RULES = {
  CATEGORY_NAME_MIN_LENGTH: 1,
  CATEGORY_NAME_MAX_LENGTH: 30,
  SESSION_TITLE_MIN_LENGTH: 1,
  SESSION_TITLE_MAX_LENGTH: 100,
  SESSION_NOTES_MAX_LENGTH: 500,
  SESSION_MIN_DURATION_SECONDS: 1,
  SESSION_MAX_DURATION_HOURS: 24,
  SESSION_MIN_DURATION_MINUTES: 1,
  SESSION_MAX_DURATION_MINUTES: 1440, // 24 hours
} as const;

export { VALIDATION_RULES };

class ValidationService {
  /**
   * Validates category name
   * @param name - Category name to validate
   * @param existingCategories - Existing categories to check for duplicates (optional)
   * @param currentCategoryId - ID of current category being edited (for duplicate check, optional)
   * @returns Error message if invalid, null if valid
   */
  validateCategoryName(
    name: string,
    existingCategories?: Category[],
    currentCategoryId?: string
  ): string | null {
    // Check if name is empty or only whitespace
    if (!name || !name.trim()) {
      return 'Category name cannot be empty';
    }

    // Check minimum length
    if (name.trim().length < VALIDATION_RULES.CATEGORY_NAME_MIN_LENGTH) {
      return `Category name must be at least ${VALIDATION_RULES.CATEGORY_NAME_MIN_LENGTH} character`;
    }

    // Check maximum length
    if (name.length > VALIDATION_RULES.CATEGORY_NAME_MAX_LENGTH) {
      return `Category name must be ${VALIDATION_RULES.CATEGORY_NAME_MAX_LENGTH} characters or less`;
    }

    // Check for invalid characters (optional - allows letters, numbers, spaces, hyphens, underscores)
    const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validNamePattern.test(name)) {
      return 'Category name can only contain letters, numbers, spaces, hyphens, and underscores';
    }

    // Check for duplicate names (case-insensitive)
    if (existingCategories) {
      const trimmedName = name.trim().toLowerCase();
      const duplicate = existingCategories.find(
        (cat) =>
          cat.name.toLowerCase() === trimmedName &&
          cat.id !== currentCategoryId // Exclude current category when editing
      );

      if (duplicate) {
        return `A category named "${duplicate.name}" already exists`;
      }
    }

    return null;
  }

  /**
   * Validates session title
   * @param title - Session title to validate
   * @returns Error message if invalid, null if valid
   */
  validateSessionTitle(title: string): string | null {
    // Title can be empty (will default to "Untitled Session"), but if provided, must be valid
    if (!title || !title.trim()) {
      return null; // Empty is OK - will use default
    }

    // Check maximum length
    if (title.length > VALIDATION_RULES.SESSION_TITLE_MAX_LENGTH) {
      return `Session title must be ${VALIDATION_RULES.SESSION_TITLE_MAX_LENGTH} characters or less`;
    }

    return null;
  }

  /**
   * Validates session notes
   * @param notes - Session notes to validate
   * @returns Error message if invalid, null if valid
   */
  validateSessionNotes(notes: string): string | null {
    // Notes are optional
    if (!notes || !notes.trim()) {
      return null;
    }

    // Check maximum length
    if (notes.length > VALIDATION_RULES.SESSION_NOTES_MAX_LENGTH) {
      return `Notes must be ${VALIDATION_RULES.SESSION_NOTES_MAX_LENGTH} characters or less`;
    }

    return null;
  }

  /**
   * Validates session duration in minutes
   * @param minutes - Duration in minutes
   * @returns Error message if invalid, null if valid
   */
  validateSessionDurationMinutes(minutes: number): string | null {
    // Check if it's a valid number
    if (!Number.isFinite(minutes)) {
      return 'Please enter a valid duration';
    }

    // Check if it's a positive number
    if (minutes <= 0) {
      return 'Duration must be greater than 0';
    }

    // Check minimum duration
    if (minutes < VALIDATION_RULES.SESSION_MIN_DURATION_MINUTES) {
      return `Duration must be at least ${VALIDATION_RULES.SESSION_MIN_DURATION_MINUTES} minute`;
    }

    // Check maximum duration
    if (minutes > VALIDATION_RULES.SESSION_MAX_DURATION_MINUTES) {
      return `Duration cannot exceed ${VALIDATION_RULES.SESSION_MAX_DURATION_HOURS} hours (${VALIDATION_RULES.SESSION_MAX_DURATION_MINUTES} minutes)`;
    }

    return null;
  }

  /**
   * Validates session duration in milliseconds
   * @param milliseconds - Duration in milliseconds
   * @returns Error message if invalid, null if valid
   */
  validateSessionDurationMs(milliseconds: number): string | null {
    // Check if it's a valid number
    if (!Number.isFinite(milliseconds)) {
      return 'Invalid duration';
    }

    // Check if it's a positive number
    if (milliseconds <= 0) {
      return 'Duration must be greater than 0';
    }

    // Check minimum duration (1 second)
    const minMs = VALIDATION_RULES.SESSION_MIN_DURATION_SECONDS * 1000;
    if (milliseconds < minMs) {
      return `Duration must be at least ${VALIDATION_RULES.SESSION_MIN_DURATION_SECONDS} second`;
    }

    // Check maximum duration (24 hours)
    const maxMs = VALIDATION_RULES.SESSION_MAX_DURATION_HOURS * 60 * 60 * 1000;
    if (milliseconds > maxMs) {
      return `Duration cannot exceed ${VALIDATION_RULES.SESSION_MAX_DURATION_HOURS} hours`;
    }

    return null;
  }

  /**
   * Validates a category ID exists in the provided categories
   * @param categoryId - Category ID to validate
   * @param categories - Available categories
   * @returns Error message if invalid, null if valid
   */
  validateCategoryExists(categoryId: string, categories: Category[]): string | null {
    if (!categoryId) {
      return 'Please select a category';
    }

    const categoryExists = categories.some((cat) => cat.id === categoryId);
    if (!categoryExists) {
      return 'Selected category does not exist';
    }

    return null;
  }

  /**
   * Validates a color hex code
   * @param color - Hex color code to validate
   * @returns Error message if invalid, null if valid
   */
  validateColorHex(color: string): string | null {
    if (!color) {
      return 'Color is required';
    }

    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    if (!hexPattern.test(color)) {
      return 'Invalid color format (must be hex like #FFFFFF)';
    }

    return null;
  }

  /**
   * Validates an icon name (basic check)
   * @param icon - Icon name to validate
   * @returns Error message if invalid, null if valid
   */
  validateIconName(icon: string): string | null {
    if (!icon || !icon.trim()) {
      return 'Icon is required';
    }

    return null;
  }

  /**
   * Helper: Parse duration string to number safely
   * @param input - String input to parse
   * @returns Parsed number or NaN
   */
  parseDuration(input: string): number {
    const parsed = parseFloat(input);
    return Number.isNaN(parsed) ? NaN : Math.floor(parsed);
  }

  /**
   * Helper: Check if a string is empty or only whitespace
   * @param str - String to check
   * @returns true if empty/whitespace, false otherwise
   */
  isEmpty(str: string | null | undefined): boolean {
    return !str || !str.trim();
  }
}

// Export singleton instance
export const validation = new ValidationService();
