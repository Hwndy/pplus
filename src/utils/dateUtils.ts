import { format, parse, isValid, differenceInDays, addDays, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

/**
 * Format a date using the specified format string
 * @param date - The date to format
 * @param formatString - The format string (default: 'yyyy-MM-dd')
 * @returns Formatted date string or empty string if date is invalid
 */
export const formatDate = (date: Date | string | number | null | undefined, formatString = 'yyyy-MM-dd'): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
    
  return isValid(dateObj) ? format(dateObj, formatString) : '';
};

/**
 * Parse a date string using the specified format
 * @param dateString - The date string to parse
 * @param formatString - The format string (default: 'yyyy-MM-dd')
 * @returns Parsed Date object or null if invalid
 */
export const parseDate = (dateString: string, formatString = 'yyyy-MM-dd'): Date | null => {
  try {
    const parsedDate = parse(dateString, formatString, new Date());
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    return null;
  }
};

/**
 * Get the relative time description (today, yesterday, etc.)
 * @param date - The date to describe
 * @returns Relative time description
 */
export const getRelativeTimeDescription = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
    
  if (!isValid(dateObj)) return '';
  
  const today = new Date();
  const days = differenceInDays(today, dateObj);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days === -1) return 'Tomorrow';
  if (days > 1 && days < 7) return `${days} days ago`;
  if (days < 0 && days > -7) return `In ${Math.abs(days)} days`;
  
  return formatDate(dateObj, 'MMMM d, yyyy');
};

/**
 * Get date range for a specific period
 * @param period - The period type
 * @param date - The reference date (default: today)
 * @returns Object with start and end dates
 */
export const getDateRange = (
  period: 'day' | 'week' | 'month' | 'year',
  date: Date = new Date()
): { start: Date; end: Date } => {
  switch (period) {
    case 'day':
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      };
    case 'week':
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }), // Week starts on Monday
        end: endOfWeek(date, { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    case 'year':
      return {
        start: startOfYear(date),
        end: endOfYear(date),
      };
    default:
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      };
  }
};

/**
 * Check if a date is within a specified range
 * @param date - The date to check
 * @param startDate - The start date of the range
 * @param endDate - The end date of the range
 * @returns True if the date is within the range
 */
export const isDateInRange = (
  date: Date | string | number,
  startDate: Date | string | number,
  endDate: Date | string | number
): boolean => {
  const dateObj = new Date(date);
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  
  return dateObj >= startObj && dateObj <= endObj;
};

/**
 * Get an array of dates between start and end dates
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Array of dates
 */
export const getDatesBetween = (
  startDate: Date | string | number,
  endDate: Date | string | number
): Date[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: Date[] = [];
  
  let currentDate = start;
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

/**
 * Get a date that is a specified number of days from today
 * @param days - Number of days (positive for future, negative for past)
 * @returns The calculated date
 */
export const getDateFromToday = (days: number): Date => {
  return days >= 0 ? addDays(new Date(), days) : subDays(new Date(), Math.abs(days));
};
