import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

import { baseApiUrl } from '../utils/constants';

export const useSurgicalAppointmentAttributeTypes = () => {
  const { data, isLoading, error, mutate } = useSWR<{
    data: { results: Array<{ uuid: string; name: string; format: string; sortWeight: number }> };
  }>(
    `${baseApiUrl}/surgicalAppointmentAttributeType`,
    openmrsFetch,
  );

  return {
    data: data?.data.results || [],
    isLoading,
    error,
    mutate,
  };
};
