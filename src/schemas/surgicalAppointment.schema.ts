import {z} from 'zod';

export const surgicalAppointmentSchema = z.object({
  patient: z.string().min(1, 'Patient ID is required'),

      procedures: z.string().optional(),
      estTimeHours: z.string().optional(),
      estTimeMinutes: z.string().optional(),
      cleaningTime: z.string().optional(),
      otherSurgeon: z.string().optional(),
      surgicalAssistant: z.string().optional(),
      anaesthetist: z.string().optional(),
      scrubNurse: z.string().optional(),
      circulatingNurse: z.string().optional(),
      notes: z.string().optional(),
});

export type SurgicalAppointmentFormData = z.infer<typeof surgicalAppointmentSchema>;