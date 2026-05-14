import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

import { IProvider } from '../utils/types';

export function useProviders() {
  const apiUrl = `${restBaseUrl}/provider`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<IProvider> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    providers: data ? data.data?.results : [],
    isLoading,
    error,
    isValidating,
  };
}