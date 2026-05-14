import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import dayjs from 'dayjs';

import { SurgicalAppointmentStatusEnum } from '../../utils/constants';
import { formatDuration, formatMinutes, formatTime } from '../../utils/helpers';
import { ISurgicalAppointment, ISurgicalBlock } from '../../utils/types';

export const MAX_VISIBLE_OT_LANES = 3;
export const DEFAULT_START_HOUR = 6;
export const DEFAULT_END_HOUR = 20;
export const PX_PER_HOUR = 56;
export const MIN_BLOCK_HEIGHT = 88;
export const MIN_APPOINTMENT_HEIGHT = 48;

export type CalendarLaneDefinition = {
  key: string;
  label: string;
  placeholder: boolean;
};

export type CalendarLaneSource = {
  key: string;
  label: string;
};

export type CalendarLayoutData = {
  lanes: Array<CalendarLaneDefinition>;
  blocksByLane: Map<string, Array<ISurgicalBlock>>;
};

export type CalendarBoardMetrics = {
  boardHeight: number;
  gridTicks: Array<number>;
  rangeEndMinutes: number;
  positionForMinute: (minute: number) => number;
};

export type AppointmentLayoutItem = {
  appointment: ISurgicalAppointment;
  topPercent: number;
  heightPercent: number;
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
const normalizeLaneKey = (value?: string | null): string => String(value || '').trim().toLowerCase();

export const getBlockLocationLabel = (block: ISurgicalBlock): string =>
  block.location?.display || block.location?.name || 'Operation Theatre';

export const getBlockLaneKey = (block: ISurgicalBlock): string => {
  return normalizeLaneKey(block.location?.uuid || block.location?.display || block.location?.name || 'unknown-ot');
};

export const getBlockSurgeonLabel = (block: ISurgicalBlock): string =>
  block.provider?.display || block.provider?.person?.display || block.provider?.name || 'Unknown Provider';

export const getPatientName = (appointment?: ISurgicalAppointment | null): string =>
  appointment?.patient?.person?.display || appointment?.patient?.display || '-';

export const getPatientIdentifier = (appointment?: ISurgicalAppointment | null): string => {
  const identifierRaw = appointment?.patient?.identifiers?.[0]?.display || '';
  if (!identifierRaw) {
    return '-';
  }

  return identifierRaw.includes('=') ? identifierRaw.split('=')[1].trim() : identifierRaw;
};

export const getBlockAppointments = (block: ISurgicalBlock): Array<ISurgicalAppointment> =>
  Array.isArray(block.surgicalAppointments)
    ? block.surgicalAppointments.filter((appointment) => appointment?.status !== SurgicalAppointmentStatusEnum.CANCELLED)
    : [];

export const getAppointmentAttributeMap = (appointment?: ISurgicalAppointment | null): Record<string, string> => {
  if (!appointment?.surgicalAppointmentAttributes?.length) {
    return {};
  }

  return appointment.surgicalAppointmentAttributes.reduce<Record<string, string>>((acc, attribute) => {
    const name = attribute?.surgicalAppointmentAttributeType?.name;
    if (name) {
      acc[name] = attribute.value;
    }
    return acc;
  }, {});
};

export const getEstimatedMinutes = (appointment: ISurgicalAppointment | undefined, block: ISurgicalBlock): number | null => {
  const attrs = getAppointmentAttributeMap(appointment);
  const hours = Number(attrs.estTimeHours || 0);
  const minutes = Number(attrs.estTimeMinutes || 0);
  const estimatedMinutes = hours * 60 + minutes;

  if (!Number.isNaN(estimatedMinutes) && estimatedMinutes > 0) {
    return estimatedMinutes;
  }

  if (block.startDatetime && block.endDatetime) {
    const diff = dayjs(block.endDatetime).diff(dayjs(block.startDatetime), 'minute');
    return diff > 0 ? diff : null;
  }

  return null;
};

export const getCleaningMinutes = (appointment?: ISurgicalAppointment | null): number => {
  const attrs = getAppointmentAttributeMap(appointment);
  const parsed = Number(attrs.cleaningTime || 0);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

export const getPlannedAppointmentMinutes = (appointment: ISurgicalAppointment | undefined, block: ISurgicalBlock): number => {
  const estimatedMinutes = getEstimatedMinutes(appointment, block) || 0;
  const cleaningMinutes = getCleaningMinutes(appointment);
  return Math.max(estimatedMinutes + cleaningMinutes, estimatedMinutes, 0);
};

export const getEstimatedTimeLabel = (appointment: ISurgicalAppointment | undefined, block: ISurgicalBlock): string => {
  const estimatedMinutes = getEstimatedMinutes(appointment, block);
  return formatMinutes(estimatedMinutes || undefined) || formatDuration(block.startDatetime, block.endDatetime);
};

export const getCleaningTimeLabel = (appointment?: ISurgicalAppointment | null): string =>
  formatMinutes(getCleaningMinutes(appointment) || undefined) || '-';

export const getActualTimeLabel = (appointment?: ISurgicalAppointment | null): string =>
  appointment?.actualStartDatetime && appointment?.actualEndDatetime
    ? `${formatTime(appointment.actualStartDatetime)} - ${formatTime(appointment.actualEndDatetime)}`
    : '-';

export const getAppointmentPlannedRange = (
  appointment: ISurgicalAppointment | undefined,
  block: ISurgicalBlock,
): { start: dayjs.Dayjs; end: dayjs.Dayjs } | null => {
  if (!appointment?.uuid || !block.startDatetime) {
    return null;
  }

  const appointments = getBlockAppointments(block);
  const currentIndex = appointments.findIndex((item) => item.uuid === appointment.uuid);

  if (currentIndex < 0) {
    return null;
  }

  const minutesBefore = appointments
    .slice(0, currentIndex)
    .reduce((sum, item) => sum + getPlannedAppointmentMinutes(item, block), 0);
  const currentMinutes = getPlannedAppointmentMinutes(appointment, block);
  const start = dayjs(block.startDatetime).add(minutesBefore, 'minute');
  const end = start.add(currentMinutes, 'minute');

  return { start, end };
};

export const getMinutesFromIso = (iso?: string): number => {
  if (!iso) {
    return 0;
  }

  const parsed = dayjs(iso);
  if (!parsed.isValid()) {
    return 0;
  }

  return parsed.hour() * 60 + parsed.minute();
};

export const formatTimelineTick = (totalMinutes: number): string => dayjs().startOf('day').add(totalMinutes, 'minute').format('h:mm A');

export const isSameDayAsKey = (iso: string, dateKey: string): boolean => dayjs(iso).format('YYYY-MM-DD') === dateKey;

export const filterAndSortDayBlocks = (blocks: Array<ISurgicalBlock>, forDate: string): Array<ISurgicalBlock> => {
  return blocks
    .filter((block) => isSameDayAsKey(block.startDatetime, forDate))
    .sort((a, b) => dayjs(a.startDatetime).valueOf() - dayjs(b.startDatetime).valueOf());
};

export const buildCalendarLayout = (
  dayBlocks: Array<ISurgicalBlock>,
  configuredLaneSources: Array<CalendarLaneSource>,
  createPlaceholderLabel: (index: number) => string,
): CalendarLayoutData => {
  const laneSourceMap = new Map<string, CalendarLaneSource>();

  configuredLaneSources.forEach((lane) => {
    const laneKey = normalizeLaneKey(lane.key);
    if (laneKey && !laneSourceMap.has(laneKey)) {
      laneSourceMap.set(laneKey, { key: laneKey, label: lane.label });
    }
  });

  if (laneSourceMap.size === 0) {
    dayBlocks.forEach((block) => {
      const laneKey = getBlockLaneKey(block);
      if (!laneSourceMap.has(laneKey)) {
        laneSourceMap.set(laneKey, { key: laneKey, label: getBlockLocationLabel(block) });
      }
    });
  }

  const laneSources = Array.from(laneSourceMap.values());

  const visibleLaneSources = laneSources.slice(0, MAX_VISIBLE_OT_LANES);
  const visibleLaneKeys = new Set(visibleLaneSources.map((lane) => lane.key));
  const lanes: Array<CalendarLaneDefinition> = visibleLaneSources.map((lane) => ({ ...lane, placeholder: false }));

  while (lanes.length < MAX_VISIBLE_OT_LANES) {
    const index = lanes.length + 1;
    lanes.push({
      key: `placeholder-ot-${index}`,
      label: createPlaceholderLabel(index),
      placeholder: true,
    });
  }

  const blocksByLane = new Map<string, Array<ISurgicalBlock>>();
  lanes.forEach((lane) => blocksByLane.set(lane.key, []));

  dayBlocks.forEach((block) => {
    const laneKey = getBlockLaneKey(block);
    if (!visibleLaneKeys.has(laneKey)) {
      return;
    }

    const laneBlocks = blocksByLane.get(laneKey);
    if (laneBlocks) {
      laneBlocks.push(block);
    }
  });

  return { lanes, blocksByLane };
};

export const buildCompactCalendarLayout = (
  dayBlocks: Array<ISurgicalBlock>,
  configuredLaneSources: Array<CalendarLaneSource>,
): CalendarLayoutData => {
  const laneSourceMap = new Map<string, CalendarLaneSource>();

  configuredLaneSources.forEach((lane) => {
    const laneKey = normalizeLaneKey(lane.key);
    if (laneKey && !laneSourceMap.has(laneKey)) {
      laneSourceMap.set(laneKey, { key: laneKey, label: lane.label });
    }
  });

  if (laneSourceMap.size === 0) {
    dayBlocks.forEach((block) => {
      const laneKey = getBlockLaneKey(block);
      if (!laneSourceMap.has(laneKey)) {
        laneSourceMap.set(laneKey, { key: laneKey, label: getBlockLocationLabel(block) });
      }
    });
  }

  const blockLaneKeys = new Set(dayBlocks.map((block) => getBlockLaneKey(block)));
  const visibleLaneSources = Array.from(laneSourceMap.values())
    .filter((lane) => blockLaneKeys.has(lane.key))
    .slice(0, MAX_VISIBLE_OT_LANES);
  const visibleLaneKeys = new Set(visibleLaneSources.map((lane) => lane.key));
  const lanes: Array<CalendarLaneDefinition> = visibleLaneSources.map((lane) => ({ ...lane, placeholder: false }));
  const blocksByLane = new Map<string, Array<ISurgicalBlock>>();

  lanes.forEach((lane) => blocksByLane.set(lane.key, []));

  dayBlocks.forEach((block) => {
    const laneKey = getBlockLaneKey(block);
    if (!visibleLaneKeys.has(laneKey)) {
      return;
    }

    const laneBlocks = blocksByLane.get(laneKey);
    if (laneBlocks) {
      laneBlocks.push(block);
    }
  });

  return { lanes, blocksByLane };
};

export const buildCalendarBoardMetrics = (dayBlocks: Array<ISurgicalBlock>): CalendarBoardMetrics => {
  const defaultStartMinutes = DEFAULT_START_HOUR * 60;
  const defaultEndMinutes = DEFAULT_END_HOUR * 60;

  const dayBlockStartMinutes = dayBlocks.map((block) => getMinutesFromIso(block.startDatetime));
  const dayBlockEndMinutes = dayBlocks.map((block) => getMinutesFromIso(block.endDatetime));

  const minBlockMinute = dayBlockStartMinutes.length ? Math.min(...dayBlockStartMinutes) : defaultStartMinutes;
  const maxBlockMinute = dayBlockEndMinutes.length ? Math.max(...dayBlockEndMinutes) : defaultEndMinutes;

  const rangeStartMinutes = Math.max(0, Math.floor((Math.min(defaultStartMinutes, minBlockMinute) - 60) / 60) * 60);
  const rangeEndMinutes = Math.min(
    24 * 60,
    Math.ceil((Math.max(defaultEndMinutes, maxBlockMinute) + 60) / 60) * 60,
  );
  const safeRangeEndMinutes = rangeEndMinutes <= rangeStartMinutes ? rangeStartMinutes + 8 * 60 : rangeEndMinutes;
  const totalRangeMinutes = safeRangeEndMinutes - rangeStartMinutes;
  const boardHeight = Math.max((totalRangeMinutes / 60) * PX_PER_HOUR, PX_PER_HOUR * 8);

  const gridTicks: Array<number> = [];
  for (let tick = rangeStartMinutes; tick <= safeRangeEndMinutes; tick += 30) {
    gridTicks.push(tick);
  }

  return {
    boardHeight,
    gridTicks,
    rangeEndMinutes: safeRangeEndMinutes,
    positionForMinute: (minute: number) => ((minute - rangeStartMinutes) / totalRangeMinutes) * boardHeight,
  };
};

export const getBlockPosition = (
  block: ISurgicalBlock,
  rangeStartMinutes: number,
  rangeEndMinutes: number,
  boardHeight: number,
) => {
  const totalRangeMinutes = Math.max(1, rangeEndMinutes - rangeStartMinutes);
  const blockStartMinutes = clamp(getMinutesFromIso(block.startDatetime), rangeStartMinutes, rangeEndMinutes);
  const rawBlockEndMinutes = clamp(getMinutesFromIso(block.endDatetime), rangeStartMinutes, rangeEndMinutes);
  const blockEndMinutes = Math.max(blockStartMinutes + 15, rawBlockEndMinutes);

  const rawTop = ((blockStartMinutes - rangeStartMinutes) / totalRangeMinutes) * boardHeight;
  const rawHeight = ((blockEndMinutes - blockStartMinutes) / totalRangeMinutes) * boardHeight;
  const height = Math.min(Math.max(rawHeight, MIN_BLOCK_HEIGHT), boardHeight);
  const top = Math.min(rawTop, Math.max(0, boardHeight - height));

  return { top, height };
};

export const buildAppointmentLayout = (
  appointments: Array<ISurgicalAppointment>,
  block: ISurgicalBlock,
  blockHeight: number,
): Array<AppointmentLayoutItem> => {
  if (!appointments.length) {
    return [];
  }

  const blockDurationMinutes = Math.max(dayjs(block.endDatetime).diff(dayjs(block.startDatetime), 'minute'), 1);
  const plannedMinutes = appointments.map((appointment) => getPlannedAppointmentMinutes(appointment, block));
  const totalPlannedMinutes = plannedMinutes.reduce((sum, value) => sum + value, 0);
  const denominator = Math.max(blockDurationMinutes, totalPlannedMinutes, 1);
  const minimumHeightPercent = Math.min((MIN_APPOINTMENT_HEIGHT / Math.max(blockHeight, 1)) * 100, 100);

  let cursorMinutes = 0;

  return appointments
    .sort((a, b) => a.id - b.id)
    .map((appointment, index) => {
      const currentMinutes = plannedMinutes[index] || 0;
      const rawTopPercent = (cursorMinutes / denominator) * 100;
      const rawHeightPercent = (currentMinutes / denominator) * 100;
      const heightPercent = Math.max(rawHeightPercent, minimumHeightPercent);
      const topPercent = Math.min(rawTopPercent, Math.max(0, 100 - heightPercent));
      cursorMinutes += currentMinutes;

      return {
        appointment,
        topPercent,
        heightPercent,
      };
    });
};

export const asKeyboardButton = (event: ReactKeyboardEvent, handler: () => void) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handler();
  }
};
