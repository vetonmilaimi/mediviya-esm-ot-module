import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Formats a date with timezone offset for API submission
 * @param date - The date to format
 * @param time - Optional time string (e.g., "14:30")
 * @returns Formatted datetime string with offset (e.g., "2025-12-31T14:30:00.000+0100")
 */
export function formatWithOffset(date: Date, time?: string, ampm?: string): string {
  let dateTime = dayjs(date);

  if (time) {
    let [hours, minutes] = time.split(':').map(Number);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    dateTime = dateTime.hour(hours).minute(minutes);
  }

  return dateTime.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
}

/**
 * Combines date and time into a single datetime string
 * @param date - The date object
 * @param timeStr - Time string in format "HH:MM"
 * @returns ISO datetime string
 */
export function combineDateAndTime(date: Date, timeStr: string, ampm?: string): string {
  let [hours, minutes] = timeStr.split(':').map(Number);

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const combined = dayjs(date)
    .hour(hours)
    .minute(minutes)
    .second(0)
    .millisecond(0);

  return combined.toISOString();
}
