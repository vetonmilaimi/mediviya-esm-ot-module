import useSWR from "swr";
import { openmrsFetch } from "@openmrs/esm-framework";

import { baseApiUrl, PeriodEnum } from "../utils/constants";
import { evaluateCalendarDates } from "../utils/helpers";
import { ISurgicalBlock } from "../utils/types";
import { useMemo } from "react";

export const useSurgicalBlocks = (forDate: string, period: PeriodEnum) => {
  const { startDate, endDate } = evaluateCalendarDates(forDate, period);

  const { data, isLoading, error, isValidating } = useSWR<{ data: { results: Array<ISurgicalBlock> } }>(
    `${baseApiUrl}/surgicalBlock?startDatetime=${startDate}&endDatetime=${endDate}`,
    openmrsFetch,
  )

  return useMemo(
    () => ({
      surgicalBlocks: data ? data.data?.results : [],
      isLoading,
      error,
      isValidating
    }),
    [data, isLoading, error, isValidating]
  )
};
