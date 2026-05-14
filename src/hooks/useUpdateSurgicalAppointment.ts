import useSWRMutation from 'swr/mutation';
import { openmrsFetch } from '@openmrs/esm-framework';

export interface UpdateSurgicalAppointmentPayload {
  actualStartDatetime?: string;
  actualEndDatetime?: string;
  notes?: string;
  surgicalBlock?: string;
}

interface UpdateSurgicalAppointmentArg {
  uuid: string;
  payload: UpdateSurgicalAppointmentPayload;
}

const updateSurgicalAppointment = async (_key: string, { arg }: { arg: UpdateSurgicalAppointmentArg }) => {
  return openmrsFetch(`/ws/rest/v1/surgicalAppointment/${arg.uuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg.payload),
  });
};

export const useUpdateSurgicalAppointment = () => {
  const { trigger, isMutating, error } = useSWRMutation('/ws/rest/v1/surgicalAppointment', updateSurgicalAppointment);

  return {
    updateSurgicalAppointment: (uuid: string, payload: UpdateSurgicalAppointmentPayload) => trigger({ uuid, payload }),
    isUpdating: isMutating,
    error,
  };
};
