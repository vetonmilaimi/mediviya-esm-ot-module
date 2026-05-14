import useSWR from "swr"
import { openmrsFetch } from "@openmrs/esm-framework"

import { ISurgicalBlock } from "../utils/types"
import { baseApiUrl } from "../utils/constants"

export const useSurgicalBlockById = (id: string | null) => {
  const { data, isLoading, error, isValidating } = useSWR<{ data: ISurgicalBlock }>(
    `${baseApiUrl}/surgicalBlock/${id}?v=full`,
    openmrsFetch
  )

  return {
    surgicalBlock: data?.data ?? null,
    isLoading: isLoading,
    error,
    isValidating,
  }
}
