import { DateTime } from 'luxon';
import { DEFAULT_SITECORE_DATE } from '@/constants/appConstants';

export const parseDate = (dateString?: string): Date | null => {
  if (!dateString) return null;
  const parsedDate = new Date(dateString);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export function formatDateAuthor(dateInput: string | Date | number): string {
  return DateTime.fromJSDate(new Date(dateInput)).toFormat('MMM dd, yyyy');
}
export const formatDate = (timestamp: string): string => {
  if (!timestamp || timestamp === DEFAULT_SITECORE_DATE) return '';

  // Parse Sitecore ISO date string format: YYYY-MM-DDTHH:MM:SSZ
  // Extract date components directly from the string to avoid timezone issues
  const year = parseInt(timestamp.substring(0, 4));
  const month = parseInt(timestamp.substring(5, 7));
  const day = parseInt(timestamp.substring(8, 10));

  const date = new Date(year, month - 1, day);

  const hour = parseInt(timestamp.substring(11, 13));

  // If the hour is 13 (1 PM UTC), this suggests the original date was shifted
  // due to timezone conversion. Add one day to compensate.
  if (hour === 13) {
    date.setDate(date.getDate() + 1);
  }

  const formattedDay = date.getDate().toString().padStart(2, '0');
  const formattedMonth = date.toLocaleDateString('en-US', { month: 'short' });
  const formattedYear = date.getFullYear();

  return `${formattedDay} ${formattedMonth} ${formattedYear}`;
};

export const isValidDate = (rawDate: any): boolean => {
  const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
  return date instanceof Date && !isNaN(date.getTime()) && date.getFullYear() > 1900;
};
