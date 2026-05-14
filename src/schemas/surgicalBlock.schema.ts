import dayjs from 'dayjs';
import { z } from 'zod';

const timePattern = /^(\d{1,2}):(\d{2})$/;

const parseTime = (value: string): { hours: number; minutes: number } | null => {
  const parsed = timePattern.exec(value.trim());
  if (!parsed) {
    return null;
  }

  const hours = Number(parsed[1]);
  const minutes = Number(parsed[2]);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
};

const mergeDateAndTime = (date: Date, time: string, meridiem: 'AM' | 'PM'): Date | undefined => {
  const parsed = parseTime(time);
  if (!parsed) {
    return undefined;
  }

  let hours = parsed.hours % 12;
  if (meridiem === 'PM') {
    hours += 12;
  }

  return dayjs(date).hour(hours).minute(parsed.minutes).second(0).millisecond(0).toDate();
};

export const surgicalBlockSchema = z
  .object({
    surgeon: z.string().min(1, 'Surgeon is required'),
    location: z.string().min(1, 'Location is required'),
    startDate: z.any().refine((value) => value instanceof Date && !Number.isNaN(value.getTime()), {
      message: 'Start date is required',
    }),

  startTime: z.string().min(1, 'Start time is required'),
  startAmPm: z.string(),

  endDate: z
    .any()
    .refine((val) => val instanceof Date, {
      message: 'End date is required',
    }),

  endTime: z.string().min(1, 'End time is required'),
  endAmPm: z.string(),
}).refine(
  (data) => {

    if (data.startDate && data.startTime) {
      const startDateTime = combineDateAndTime(data.startDate, data.startTime, data.startAmPm);
      const now = new Date();

      if (startDateTime < now) {
        return false;
      }
    }
    return true;
  },
  {
    message: 'Start date and time cannot be in the past',
    path: ['startDate'],
  }
).refine(
  (data) => {
    if (data.endDate && data.endTime) {
      const endDateTime = combineDateAndTime(data.endDate, data.endTime, data.endAmPm);
      const now = new Date();

      if (endDateTime < now) {
        return false;
      }
    }
    return true;
  },
  {
    message: 'End date and time cannot be in the past',
    path: ['endDate'],
  }
).refine(
  (data) => {
    if (data.startDate && data.startTime && data.endDate && data.endTime) {
      const startDateTime = combineDateAndTime(data.startDate, data.startTime, data.startAmPm);
      const endDateTime = combineDateAndTime(data.endDate, data.endTime, data.endAmPm);

      return endDateTime > startDateTime;
    }
    return true;
  },
  {
    message: 'End date and time must be after start date and time',
    path: ['endDate'],
  }
);

function combineDateAndTime(date: Date, timeStr: string, ampm: string): Date {

  if (!timeStr || typeof timeStr !== 'string') {
    return date;
  }

  let [hours, minutes] = timeStr.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) {
    return date;
  }

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);

  return combined;
}

export type SurgicalBlockFormData = z.infer<typeof surgicalBlockSchema>;
