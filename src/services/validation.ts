import { Session, Goal, Category } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationService {
  static validateSession(session: Partial<Session>): ValidationResult {
    const errors: string[] = [];

    if (!session.title || session.title.trim().length === 0) {
      errors.push('Session title is required');
    } else if (session.title.length > 100) {
      errors.push('Session title must be 100 characters or less');
    }

    if (session.durationMs !== undefined) {
      const minDuration = 60 * 1000;
      const maxDuration = 24 * 60 * 60 * 1000;
      
      if (session.durationMs < minDuration) {
        errors.push('Session must be at least 1 minute');
      } else if (session.durationMs > maxDuration) {
        errors.push('Session cannot exceed 24 hours');
      }
    }

    if (session.startedAt) {
      const startDate = new Date(session.startedAt);
      const now = new Date();
      
      if (isNaN(startDate.getTime())) {
        errors.push('Invalid start date');
      } else if (startDate > now) {
        errors.push('Start date cannot be in the future');
      }
    }

    if (session.endedAt && session.startedAt) {
      const startDate = new Date(session.startedAt);
      const endDate = new Date(session.endedAt);
      
      if (endDate < startDate) {
        errors.push('End date must be after start date');
      }
    }

    if (!session.categoryId || session.categoryId.trim().length === 0) {
      errors.push('Category is required');
    }

    if (session.notes && session.notes.length > 500) {
      errors.push('Notes must be 500 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateGoal(goal: Partial<Goal>): ValidationResult {
    const errors: string[] = [];

    if (!goal.title || goal.title.trim().length === 0) {
      errors.push('Goal title is required');
    } else if (goal.title.length > 100) {
      errors.push('Goal title must be 100 characters or less');
    }

    if (goal.targetMinutes !== undefined) {
      if (goal.targetMinutes < 1) {
        errors.push('Goal target must be at least 1 minute');
      } else if (goal.targetMinutes > 10000) {
        errors.push('Goal target cannot exceed 10,000 minutes');
      }
    }

    if (goal.startDate && goal.endDate) {
      const start = new Date(goal.startDate);
      const end = new Date(goal.endDate);
      
      if (isNaN(start.getTime())) {
        errors.push('Invalid start date');
      }
      
      if (isNaN(end.getTime())) {
        errors.push('Invalid end date');
      }
      
      if (end < start) {
        errors.push('End date must be after start date');
      }
    }

    if (goal.period && !['daily', 'weekly', 'monthly', 'custom'].includes(goal.period)) {
      errors.push('Invalid goal period');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateCategory(category: Partial<Category>): ValidationResult {
    const errors: string[] = [];

    if (!category.name || category.name.trim().length === 0) {
      errors.push('Category name is required');
    } else if (category.name.length > 50) {
      errors.push('Category name must be 50 characters or less');
    }

    if (category.color) {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(category.color)) {
        errors.push('Invalid color format (use hex color like #FF5733)');
      }
    }

    if (!category.icon || category.icon.trim().length === 0) {
      errors.push('Category icon is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }

  static isValidDate(date: any): boolean {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }

  static validateDurationFormat(duration: string): boolean {
    const durationRegex = /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/;
    return durationRegex.test(duration);
  }

  static durationToMs(duration: string): number {
    const parts = duration.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }
}

export const validation = ValidationService;