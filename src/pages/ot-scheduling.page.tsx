import React, { useEffect, useMemo, useRef, useState } from 'react';

import DailyOtCalendarView from '../components/calendar-views/daily-ot-calendar-view.component';
import WeeklyOtCalendarView from '../components/calendar-views/weekly-ot-calendar-view.component';
import OperationTheaterHeader from '../components/headers/ot-header.component';
import SchedulingHeaderFilters from '../components/headers/scheduling-header-filters.component';
import SchedulingPrintContent from '../components/print/scheduling-print-content.component';
import SchedulingTableList from '../components/tables/scheduling-table-list.component';
import { SchedulingViewModes } from '../utils/constants';
import { printElement } from '../utils/printElement';
import { formatSchedulingPrintDateRange } from '../utils/schedulingRows';
import { buildSchedulingSearch, parseSchedulingUrlState } from '../utils/schedulingUrlState';
import { IFilters } from '../utils/types';

const OtSchedulingPage = () => {
  const initialState = useMemo(() => parseSchedulingUrlState(window.location.search), []);
  const [selectedFiltersPeriod, setSelectedFiltersPeriod] = useState(initialState.selectedFiltersPeriod);
  const [selectedDate, setSelectedDate] = useState(initialState.selectedDate);
  const [filters, setFilters] = useState<IFilters>(initialState.filters);
  const printContentRef = useRef<HTMLDivElement | null>(null);
  const viewType = useMemo(() => {
    const rawView = new URLSearchParams(window.location.search).get('view')?.toLowerCase();
    return rawView === SchedulingViewModes.LIST ? SchedulingViewModes.LIST : SchedulingViewModes.CALENDAR;
  }, [window.location.search]);
  const handlePrint = () =>
    printElement(printContentRef.current, {
      documentTitle: `OT Schedule - ${formatSchedulingPrintDateRange(selectedDate, selectedFiltersPeriod)}`,
    });

  useEffect(() => {
    const nextSearch = buildSchedulingSearch({
      search: window.location.search,
      selectedFiltersPeriod,
      selectedDate,
      filters,
    });
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  }, [filters, selectedDate, selectedFiltersPeriod]);

  return (
    <div>
      <OperationTheaterHeader />
      <SchedulingHeaderFilters
        selectedFiltersPeriod={selectedFiltersPeriod}
        setSelectedFiltersPeriod={setSelectedFiltersPeriod}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        filters={filters}
        setFilters={setFilters}
        onPrint={handlePrint}
      />
      {viewType === SchedulingViewModes.CALENDAR ? (
        selectedFiltersPeriod === 'week' ? (
          <WeeklyOtCalendarView selectedDate={selectedDate} filters={filters} />
        ) : (
          <DailyOtCalendarView selectedDate={selectedDate} filters={filters} />
        )
      ) : (
        <SchedulingTableList date={selectedDate} period={selectedFiltersPeriod} filters={filters} />
      )}
      <div ref={printContentRef}>
        <SchedulingPrintContent date={selectedDate} period={selectedFiltersPeriod} filters={filters} />
      </div>
    </div>
  );
};

export default OtSchedulingPage;
