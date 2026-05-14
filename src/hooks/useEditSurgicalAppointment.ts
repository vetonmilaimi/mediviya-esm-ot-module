import useSWRMutation from 'swr/mutation';
import { openmrsFetch } from '@openmrs/esm-framework';

import { ISurgicalAppointment } from '../utils/types';
import { baseApiUrl } from '../utils/constants';

export function useEditSurgicalAppointment(surgicalAppointmentId: string) {
  const editSurgicalAppointment = async (url: string, { arg }: { arg: object }) => {
    const response = await openmrsFetch<ISurgicalAppointment>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(arg),
    });
    return response;
  };

  const { trigger, isMutating, error } = useSWRMutation(
    `${baseApiUrl}/surgicalAppointment/${surgicalAppointmentId}`,
    editSurgicalAppointment
  );

  return {
    editSurgicalAppointment: trigger,
    isEditing: isMutating,
    error,
  };
}
