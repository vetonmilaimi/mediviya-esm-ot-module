import { IProvider, ISchedulingRowData, ISurgicalAppointment, ISurgicalBlock } from './types';
import { formatDate, formatDuration, formatMinutes, formatTime } from './helpers';

export type SchedulingRowSource = Omit<ISchedulingRowData, 'actions'> & {
  block: ISurgicalBlock;
  appointment: ISurgicalAppointment | null;
};

export const buildSchedulingRows = (
  filteredBlocks: Array<ISurgicalBlock>,
  providers: Array<IProvider> = [],
): Array<SchedulingRowSource> => {
  const providersByUuid = new Map(providers.map((provider) => [provider.uuid, provider.display]));

  return filteredBlocks.length > 0
    ? [...filteredBlocks]
        .sort((firstBlock, secondBlock) => {
          const firstStart = new Date(firstBlock.startDatetime);
          const secondStart = new Date(secondBlock.startDatetime);

          const firstDate = new Date(firstStart.getFullYear(), firstStart.getMonth(), firstStart.getDate()).getTime();
          const secondDate = new Date(
            secondStart.getFullYear(),
            secondStart.getMonth(),
            secondStart.getDate(),
          ).getTime();

          if (firstDate !== secondDate) {
            return firstDate - secondDate;
          }

          return firstStart.getTime() - secondStart.getTime();
        })
        .flatMap((block) => {
          const blockStart = block.startDatetime;
          const blockEnd = block.endDatetime;
          const ot = block.location?.display || block.location?.name || '-';
          const surgeon = block.provider?.display || block.provider?.person?.display || '-';

          const appointments =
            Array.isArray(block.surgicalAppointments) &&
            block.surgicalAppointments.filter((appointment) => appointment?.status !== 'CANCELLED').length > 0
              ? block.surgicalAppointments
              : [null];

          return appointments
            .filter((appointment) => appointment?.status !== 'CANCELLED')
            .map((appointment, index): SchedulingRowSource => {
              const rowId = appointment?.uuid ? String(appointment.uuid) : `${block.id}-${index}`;
              const patient = appointment?.patient;
              const patientPerson = patient?.person;
              const identifierRaw = (patient?.identifiers && patient.identifiers[0]?.display) || '';
              const identifier = identifierRaw.includes('=') ? identifierRaw.split('=')[1].trim() : identifierRaw || '-';

              const status = appointment?.status || '-';
              const patientName = patientPerson?.display || patient?.display || '-';
              const bedLocation = appointment?.bedLocation || '-';
              const bedNumber = appointment?.bedNumber || '-';
              const patientAge =
                patientPerson?.age !== undefined && patientPerson?.age !== null ? String(patientPerson.age) : '-';
              const startTime =
                appointment?.actualStartDatetime || appointment?.actualStartDatetime === null
                  ? formatTime(appointment?.actualStartDatetime || blockStart)
                  : formatTime(blockStart);
              const actualTime =
                appointment?.actualStartDatetime && appointment?.actualEndDatetime
                  ? formatDuration(appointment.actualStartDatetime, appointment.actualEndDatetime)
                  : '-';
              const date = formatDate(blockStart);
              const day = blockStart ? new Date(blockStart).toLocaleDateString(undefined, { weekday: 'long' }) : '-';

              const attrArray = Array.isArray(appointment?.surgicalAppointmentAttributes)
                ? appointment.surgicalAppointmentAttributes
                : [];
              const attrMap = attrArray.reduce<Record<string, string>>((acc, attribute) => {
                const name = attribute?.surgicalAppointmentAttributeType?.name;
                if (name) {
                  acc[name] = attribute.value;
                }
                return acc;
              }, {});

              const estFromAttr = formatMinutes(attrMap['estTimeMinutes']);
              const estTime = estFromAttr || formatDuration(blockStart, blockEnd);
              const anaesthetist = attrMap.anaesthetist || (appointment as any)?.anaesthetist || '';
              const surgicalAssistant = attrMap.surgicalAssistant || (appointment as any)?.surgicalAssistant || '';
              const otherSurgeonAttrRaw = attrMap.otherSurgeon || (appointment as any)?.otherSurgeon || '';
              const otherSurgeon = providersByUuid.get(otherSurgeonAttrRaw) || otherSurgeonAttrRaw;
              const scrubNurse = attrMap.scrubNurse || (appointment as any)?.scrubNurse || '';
              const circulatingNurse = attrMap.circulatingNurse || (appointment as any)?.circulatingNurse || '';
              const procedures = attrMap.procedure || (appointment as any)?.procedures || '';
              const notes = attrMap.notes || appointment?.notes || '';

              return {
                id: rowId,
                status,
                patientName,
                identifier,
                date,
                startTime,
                ot,
                day,
                patientAge,
                estTime,
                actualTime,
                surgeon,
                procedures,
                otherSurgeon,
                surgicalAssistant,
                anaesthetist,
                scrubNurse,
                circulatingNurse,
                notes,
                bedLocation,
                bedNumber,
                block,
                appointment,
              };
            });
        })
    : [];
};

export const formatSchedulingPrintDateRange = (date: Date, period: string) => {
  if (period === 'week') {
    return `${new Date(date.getTime() - date.getDay() * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date(
      date.getTime() + (6 - date.getDay()) * 24 * 60 * 60 * 1000,
    ).toLocaleDateString()}`;
  }

  return `${date.toLocaleDateString()} (${date.toLocaleDateString(undefined, { weekday: 'short' })})`;
};
