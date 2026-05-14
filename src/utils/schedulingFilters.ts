import { IFilterOption, IFilters, ISurgicalAppointment, ISurgicalBlock } from './types';

const normalizeText = (value?: string | null): string => String(value || '').trim().toLowerCase();

const getAppointmentIdentifier = (appointment?: ISurgicalAppointment | null): string => {
  const identifierRaw = appointment?.patient?.identifiers?.[0]?.display || '';
  return identifierRaw.includes('=') ? identifierRaw.split('=')[1].trim() : identifierRaw;
};

export const normalizeFilterItems = (items?: Array<IFilterOption> | null): Array<IFilterOption> =>
  (items || []).filter((item) => item?.id && item.id !== 'select-all' && !item.isSelectAll);

const matchesOption = (valueId: string | undefined, valueLabel: string | undefined, options: Array<IFilterOption>): boolean => {
  if (options.length === 0) {
    return true;
  }

  const normalizedLabel = normalizeText(valueLabel);
  return options.some((option) => option.id === valueId || normalizeText(option.text) === normalizedLabel);
};

const matchesPatient = (appointment: ISurgicalAppointment, filters: IFilters): boolean => {
  if (!filters.patient) {
    return true;
  }

  const appointmentPatientUuid = appointment.patient?.uuid;
  const appointmentIdentifier = getAppointmentIdentifier(appointment);
  return (
    appointmentPatientUuid === filters.patient.uuid ||
    appointmentIdentifier === filters.patient.patientIdentifier ||
    appointmentIdentifier.includes(filters.patient.patientIdentifier)
  );
};

const matchesStatus = (appointment: ISurgicalAppointment, statuses: Array<IFilterOption>): boolean => {
  if (statuses.length === 0) {
    return true;
  }

  return statuses.some((status) => normalizeText(status.text) === normalizeText(appointment.status));
};

export const filterSurgicalBlocks = (blocks: Array<ISurgicalBlock>, filters: IFilters): Array<ISurgicalBlock> => {
  const surgeonFilters = normalizeFilterItems(filters.surgeon);
  const locationFilters = normalizeFilterItems(filters.location);
  const statusFilters = normalizeFilterItems(filters.status);
  const hasAppointmentFilters = Boolean(filters.patient) || statusFilters.length > 0;

  return (blocks || []).flatMap((block) => {
    const matchesLocation = matchesOption(
      block.location?.uuid,
      block.location?.display || block.location?.name,
      locationFilters,
    );
    const matchesSurgeon = matchesOption(
      block.provider?.uuid,
      block.provider?.display || block.provider?.person?.display || block.provider?.name,
      surgeonFilters,
    );

    if (!matchesLocation || !matchesSurgeon) {
      return [];
    }

    if (!hasAppointmentFilters) {
      return [block];
    }

    const filteredAppointments = (block.surgicalAppointments || []).filter(
      (appointment) => matchesStatus(appointment, statusFilters) && matchesPatient(appointment, filters),
    );

    if (filteredAppointments.length === 0) {
      return [];
    }

    return [{ ...block, surgicalAppointments: filteredAppointments }];
  });
};
