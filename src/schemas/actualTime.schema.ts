import dayjs from 'dayjs';
import { z } from 'zod';

export const maxActualTimeNotesLength = 255;

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

export const mergeDateAndTime = (date: Date, time: string, meridiem: 'AM' | 'PM'): Date | undefined => {
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

export const actualTimeSchema = z
  .object({
    startDate: z.any().refine((value) => value instanceof Date && !Number.isNaN(value.getTime()), {
      message: 'Start date is required',
    }),
    startTime: z
      .string()
      .min(1, 'Start time is required')
      .refine((value) => Boolean(parseTime(value)), {
        message: 'Start time is invalid',
      }),
    startMeridiem: z.enum(['AM', 'PM']),
    endDate: z.any().refine((value) => value instanceof Date && !Number.isNaN(value.getTime()), {
      message: 'End date is required',
    }),
    endTime: z
      .string()
      .min(1, 'End time is required')
      .refine((value) => Boolean(parseTime(value)), {
        message: 'End time is invalid',
      }),
    endMeridiem: z.enum(['AM', 'PM']),
    notes: z.string().max(maxActualTimeNotesLength, 'Notes cannot exceed 255 characters'),
  })
  .superRefine((values, context) => {
    const start = mergeDateAndTime(values.startDate, values.startTime, values.startMeridiem);
    const end = mergeDateAndTime(values.endDate, values.endTime, values.endMeridiem);

    if (!start || !end) {
      return;
    }

    if (!dayjs(end).isAfter(dayjs(start))) {
      context.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'Actual start time should be less than actual end time',
      });
    }
  });

export type ActualTimeFormData = z.infer<typeof actualTimeSchema>;
