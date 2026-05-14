import React, { useMemo } from 'react';
import { showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { useLocations } from '../../hooks/useLocations';
import { useSurgicalBlocks } from '../../hooks/useSurgicalBlocks';
import { PeriodEnum } from '../../utils/constants';
import { CalendarDetailsModalPayload, IFilters } from '../../utils/types';
import { filterSurgicalBlocks } from '../../utils/schedulingFilters';
import styles from './daily-ot-calendar-view.scss';
import {
  buildCalendarBoardMetrics,
  buildCalendarLayout,
  filterAndSortDayBlocks,
} from './daily-ot-calendar-view.utils';
import DailyOtDesktopBoard from './daily-ot-desktop-board.component';
import DailyOtMobileBoard from './daily-ot-mobile-board.component';

interface DailyOtCalendarViewProps {
  selectedDate?: Date;
  filters: IFilters;
}

const DailyOtCalendarView: React.FC<DailyOtCalendarViewProps> = ({ selectedDate, filters }) => {
  const { t } = useTranslation();
  const forDate = useMemo(
    () => dayjs(selectedDate ?? new Date()).format('YYYY-MM-DD'),
    [selectedDate],
  );

  const { locations, isLoading: isLocationsLoading, error: locationsError } = useLocations();
  const { surgicalBlocks, isLoading, error } = useSurgicalBlocks(forDate, PeriodEnum.DAILY);
  const dayBlocks = useMemo(
    () => filterAndSortDayBlocks(filterSurgicalBlocks(surgicalBlocks || [], filters), forDate),
    [filters, forDate, surgicalBlocks],
  );

  const laneSources = useMemo(
    () =>
      (locations || []).map((location) => ({
        key: location.uuid || location.display,
        label: location.display,
      })),
    [locations],
  );

  const { lanes, blocksByLane } = buildCalendarLayout(
    dayBlocks,
    laneSources,
    (index) => t('operationTheatreSlot', 'Operation Theatre {{index}}', { index }),
  );

  const { boardHeight, gridTicks, rangeEndMinutes, positionForMinute } = buildCalendarBoardMetrics(dayBlocks);
  const rangeStartMinutes = gridTicks[0] || 0;

  const openDetailsModal = (payload: CalendarDetailsModalPayload) => {
    const dispose = showModal('calendar-details-modal', {
      onClose: () => dispose(),
      props: payload,
    });
  };

  const hasLoadError = error || locationsError;
  const isCalendarLoading = isLoading || isLocationsLoading;
  const hasNoBlocks = !isCalendarLoading && dayBlocks.length === 0;

  return (
    <div className={styles['calendar-view']}>
      <section className={styles['calendar-main']} aria-label={t('surgicalSchedule', 'Surgical schedule')}>
        {hasLoadError ? (
          <div className={styles['state-message']}>
            {t('calendarLoadError', 'Unable to load surgical blocks for the calendar.')}
          </div>
        ) : null}

        {!hasLoadError && (
          <React.Fragment>
            <DailyOtDesktopBoard
              lanes={lanes}
              blocksByLane={blocksByLane}
              boardHeight={boardHeight}
              gridTicks={gridTicks}
              rangeEndMinutes={rangeEndMinutes}
              rangeStartMinutes={rangeStartMinutes}
              positionForMinute={positionForMinute}
              onOpenDetails={openDetailsModal}
            />

            <DailyOtMobileBoard lanes={lanes} blocksByLane={blocksByLane} onOpenDetails={openDetailsModal} />

            {isCalendarLoading ? (
              <div className={styles['state-message']}>{t('loadingCalendar', 'Loading calendar...')}</div>
            ) : null}
          </React.Fragment>
        )}
      </section>
    </div>
  );
};

export default DailyOtCalendarView;
