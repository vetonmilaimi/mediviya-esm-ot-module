import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export interface Location {
  uuid: string;
  display: string;
}

const OPERATION_THEATRE_TAGS = ['Operation Theater', 'Operation Theatre'];
type LocationsResponse = { data: { results: Array<Location> } };

export function useLocations() {
  const { data, error, isLoading, isValidating } = useSWR<Array<Location>, Error>(
    'operation-theatre-locations',
    async () => {
      const responses = await Promise.all(
        OPERATION_THEATRE_TAGS.map((tag) =>
          openmrsFetch<LocationsResponse['data']>(`${restBaseUrl}/location?tag=${encodeURIComponent(tag)}`),
        ),
      );

      const locationsByUuid = new Map<string, Location>();

      responses.forEach((response) => {
        response?.data?.results?.forEach((location) => {
          if (location?.uuid && !locationsByUuid.has(location.uuid)) {
            locationsByUuid.set(location.uuid, location);
          }
        });
      });

      return Array.from(locationsByUuid.values());
    },
  );

  return {
    locations: data ?? [],
    isLoading,
    error,
    isValidating,
  };
}
