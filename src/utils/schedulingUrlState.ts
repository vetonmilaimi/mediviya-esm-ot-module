import { normalizeFilterItems } from './schedulingFilters';
import { IFilterOption, IFilters } from './types';

export const emptySchedulingFilters: IFilters = {
  surgeon: [],
  location: [],
  patient: null,
  status: [],
};

interface SchedulingUrlState {
  filters: IFilters;
  selectedDate: Date;
  selectedFiltersPeriod: string;
}

const safeParseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const parseFilterOptions = (value: string | null): Array<IFilterOption> => {
  const parsed = safeParseJson<Array<IFilterOption>>(value, []);
  return normalizeFilterItems(parsed);
};

const parsePatientFilter = (value: string | null): IFilters['patient'] => {
  const parsed = safeParseJson<IFilters['patient']>(value, null);
  if (!parsed?.uuid || !parsed?.patientIdentifier) {
    return null;
  }

  return parsed;
};

const formatDateParam = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateParam = (value: string | null): Date => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(Date.now());
  }

  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date(Date.now()) : parsed;
};

const setJsonParam = (params: URLSearchParams, key: string, value: unknown, shouldPersist: boolean) => {
  if (!shouldPersist) {
    params.delete(key);
    return;
  }

  params.set(key, JSON.stringify(value));
};

export const parseSchedulingUrlState = (search: string): SchedulingUrlState => {
  const params = new URLSearchParams(search);
  const selectedFiltersPeriod = params.get('period') === 'day' ? 'day' : 'week';

  return {
    selectedFiltersPeriod,
    selectedDate: parseDateParam(params.get('date')),
    filters: {
      surgeon: parseFilterOptions(params.get('surgeon')),
      location: parseFilterOptions(params.get('location')),
      patient: parsePatientFilter(params.get('patient')),
      status: parseFilterOptions(params.get('status')),
    },
  };
};

export const buildSchedulingSearch = ({
  search,
  filters,
  selectedDate,
  selectedFiltersPeriod,
}: SchedulingUrlState & { search: string }): string => {
  const params = new URLSearchParams(search);

  params.set('period', selectedFiltersPeriod);
  params.set('date', formatDateParam(selectedDate));
  setJsonParam(params, 'surgeon', filters.surgeon, normalizeFilterItems(filters.surgeon).length > 0);
  setJsonParam(params, 'location', filters.location, normalizeFilterItems(filters.location).length > 0);
  setJsonParam(params, 'status', filters.status, normalizeFilterItems(filters.status).length > 0);
  setJsonParam(params, 'patient', filters.patient, Boolean(filters.patient));

  return params.toString();
};

export const countActiveSchedulingFilters = (filters: IFilters): number =>
  normalizeFilterItems(filters.surgeon).length +
  normalizeFilterItems(filters.location).length +
  normalizeFilterItems(filters.status).length +
  (filters.patient ? 1 : 0);
