import {
  format,
  isPast,
  addDays,
  isValid,
  isToday,
  parseISO,
  endOfDay,
  addMonths,
  startOfDay,
  isTomorrow,
  isYesterday,
  differenceInDays,
  formatDistanceToNow,
} from 'date-fns';

export class DateUtil {
  /**
   * Format a date using date-fns format patterns
   * @param date - Date to format
   * @param formatPattern - Format pattern (default: 'yyyy-MM-dd')
   * @returns Formatted date string
   */
  static formatDate(date: Date, formatPattern = 'yyyy-MM-dd'): string {
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    return format(date, formatPattern);
  }

  /**
   * Format date and time to ISO string
   * @param date - Date to format
   * @returns ISO string
   */
  static formatDateTime(date: Date): string {
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    return date.toISOString();
  }

  /**
   * Add days to a date
   * @param date - Base date
   * @param days - Number of days to add
   * @returns New date with days added
   */
  static addDays(date: Date, days: number): Date {
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    return addDays(date, days);
  }

  /**
   * Add months to a date
   * @param date - Base date
   * @param months - Number of months to add
   * @returns New date with months added
   */
  static addMonths(date: Date, months: number): Date {
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    return addMonths(date, months);
  }

  /**
   * Check if a date is in the past
   * @param date - Date to check
   * @returns True if date is in the past
   */
  static isExpired(date: Date): boolean {
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    return isPast(date);
  }

  /**
   * Get the difference in days between two dates
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Number of days difference
   */
  static getDaysDifference(date1: Date, date2: Date): number {
    if (!isValid(date1) || !isValid(date2)) {
      throw new Error('Invalid date provided');
    }
    return Math.abs(differenceInDays(date1, date2));
  }

  /**
   * Parse ISO string to Date
   * @param isoString - ISO date string
   * @returns Parsed Date object
   */
  static parseISO(isoString: string): Date {
    const parsed = parseISO(isoString);
    if (!isValid(parsed)) {
      throw new Error('Invalid ISO string provided');
    }
    return parsed;
  }

  /**
   * Get start of day for a date
   * @param date - Date to get start of day for
   * @returns Start of day date
   */
  static startOfDay(date: Date): Date {
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    return startOfDay(date);
  }

  /**
   * Get end of day for a date
   * @param date - Date to get end of day for
   * @returns End of day date
   */
  static endOfDay(date: Date): Date {
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    return endOfDay(date);
  }

  /**
   * Check if date is today
   * @param date - Date to check
   * @returns True if date is today
   */
  static isToday(date: Date): boolean {
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    return isToday(date);
  }

  /**
   * Check if date is yesterday
   * @param date - Date to check
   * @returns True if date is yesterday
   */
  static isYesterday(date: Date): boolean {
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    return isYesterday(date);
  }

  /**
   * Check if date is tomorrow
   * @param date - Date to check
   * @returns True if date is tomorrow
   */
  static isTomorrow(date: Date): boolean {
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    return isTomorrow(date);
  }

  /**
   * Get human-readable time distance (e.g., "2 hours ago")
   * @param date - Date to get distance for
   * @returns Human-readable distance string
   */
  static getTimeDistance(date: Date): string {
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    return formatDistanceToNow(date, { addSuffix: true });
  }
}
