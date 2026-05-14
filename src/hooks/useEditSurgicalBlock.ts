import useSWRMutation from 'swr/mutation';
import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';

export interface SurgicalBlockPayload {
  provider?: { uuid: string };
  location?: { uuid: string };
  startDatetime?: string;
  endDatetime?: string;
  voided?: boolean;
  voidReason?: string;
}

export interface SurgicalBlock {
  uuid: string;
  provider: { uuid: string; display: string };
  location: { uuid: string; name: string };
  startDatetime: string;
  endDatetime: string;
}

/**
 * Custom hook for creating surgical blocks using SWR mutations.
 * Follows OpenMRS O3 best practices for POST operations.
 * 
 * @returns Object containing the mutation trigger function, loading state, and error
 */
export function useEditSurgicalBlock(id: string) {
  const editSurgicalBlock = async (url: string, { arg }: { arg: SurgicalBlockPayload }) => {
    const response = await openmrsFetch<SurgicalBlock>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(arg),
    });
    return response;
  };

  const { trigger, isMutating, error } = useSWRMutation(
    `/ws/rest/v1/surgicalBlock/${id}`,
    editSurgicalBlock
  );

  return {
    editSurgicalBlock: trigger,
    isEditing: isMutating,
    error,
  };
}
