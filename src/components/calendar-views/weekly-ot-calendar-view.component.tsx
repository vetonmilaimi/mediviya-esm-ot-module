import React, { useMemo } from 'react';
import { showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { useLocations } from '../../hooks/useLocations';
import { useSurgicalBlocks } from '../../hooks/useSurgicalBlocks';
import { PeriodEnum } from '../../utils/constants';
import { CalendarDetailsModalPayload, IFilters, ISurgicalBlock } from '../../utils/types';
import { filterSurgicalBlocks } from '../../utils/schedulingFilters';
import styles from './daily-ot-calendar-view.scss';
import {
  buildCalendarBoardMetrics,
  buildCompactCalendarLayout,
  filterAndSortDayBlocks,
  formatTimelineTick,
} from './daily-ot-calendar-view.utils';
import DailyOtBlockCard from './daily-ot-block-card.component';
import DailyOtMobileBoard from './daily-ot-mobile-board.component';

interface WeeklyOtCalendarViewProps {
  selectedDate?: Date;
  filters: IFilters;
}

type WeeklyDayLayout = {
  date: dayjs.Dayjs;
  dateKey: string;
  dayBlocks: Array<ISurgicalBlock>;
  lanes: ReturnType<typeof buildCompactCalendarLayout>['lanes'];
  blocksByLane: ReturnType<typeof buildCompactCalendarLayout>['blocksByLane'];
};

const WeeklyOtCalendarView: React.FC<WeeklyOtCalendarViewProps> = ({ selectedDate, filters }) => {
  const { t } = useTranslation();
  const selectedDay = useMemo(() => dayjs(selectedDate ?? new Date()), [selectedDate]);
  const weekStart = useMemo(() => selectedDay.startOf('week'), [selectedDay]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => weekStart.add(index, 'day')),
    [weekStart],
  );
  const forDate = useMemo(() => selectedDay.format('YYYY-MM-DD'), [selectedDay]);

  const { locations, isLoading: isLocationsLoading, error: locationsError } = useLocations();
  const { surgicalBlocks, isLoading, error } = useSurgicalBlocks(forDate, PeriodEnum.WEEKLY);
  const filteredBlocks = useMemo(
    () => filterSurgicalBlocks(surgicalBlocks || [], filters),
    [filters, surgicalBlocks],
  );
  const weekDateKeys = useMemo(() => new Set(weekDays.map((date) => date.format('YYYY-MM-DD'))), [weekDays]);
  const weekBlocks = useMemo(
    () =>
      filteredBlocks.filter((block) =>
        weekDateKeys.has(dayjs(block.startDatetime).format('YYYY-MM-DD')),
      ),
    [filteredBlocks, weekDateKeys],
  );
  const laneSources = useMemo(
    () =>
      (locations || []).map((location) => ({
        key: location.uuid || location.display,
        label: location.display,
      })),
    [locations],
  );

  const weekLayouts = useMemo<Array<WeeklyDayLayout>>(
    () =>
      weekDays.map((date) => {
        const dateKey = date.format('YYYY-MM-DD');
        const dayBlocks = filterAndSortDayBlocks(weekBlocks, dateKey);
        const { lanes, blocksByLane } = buildCompactCalendarLayout(dayBlocks, laneSources);

        return {
          date,
          dateKey,
          dayBlocks,
          lanes,
          blocksByLane,
        };
      }),
    [laneSources, weekBlocks, weekDays],
  );

  const { boardHeight, gridTicks, rangeEndMinutes, positionForMinute } = buildCalendarBoardMetrics(weekBlocks);
  const rangeStartMinutes = gridTicks[0] || 0;
  const dayColumnTemplate = `repeat(${weekLayouts.length}, minmax(14rem, 1fr))`;

  const openDetailsModal = (payload: CalendarDetailsModalPayload) => {
    const dispose = showModal('calendar-details-modal', {
      onClose: () => dispose(),
      props: payload,
    });
  };

  const hasLoadError = error || locationsError;
  const isCalendarLoading = isLoading || isLocationsLoading;
  const hasNoBlocks = !isCalendarLoading && weekBlocks.length === 0;

  return (
    <div className={styles['calendar-view']}>
      <section className={styles['calendar-main']} aria-label={t('weeklySurgicalSchedule', 'Weekly surgical schedule')}>
        {hasLoadError ? (
          <div className={styles['state-message']}>
            {t('calendarLoadError', 'Unable to load surgical blocks for the calendar.')}
          </div>
        ) : null}

        {!hasLoadError && (
          <React.Fragment>
            <div className={styles['weekly-desktop-board']}>
              <div className={styles['weekly-board-header']}>
                <div className={styles['time-header-cell']}>{t('time', 'Time')}</div>
                <div className={styles['weekly-days-grid']} style={{ gridTemplateColumns: dayColumnTemplate }}>
                  {weekLayouts.map(({ date, dateKey, lanes }) => (
                    <div key={`header-${dateKey}`} className={styles['weekly-day-header']}>
                      <div className={styles['weekly-day-header-top']}>
                        <span className={styles['weekly-day-name']}>{date.format('ddd')}</span>
                        <span className={styles['weekly-day-number']}>{date.format('DD')}</span>
                      </div>
                      {lanes.length > 0 ? (
                        <div
                          className={styles['weekly-day-lane-headers']}
                          style={{ gridTemplateColumns: `repeat(${lanes.length}, minmax(0, 1fr))` }}
                        >
                          {lanes.map((lane) => (
                            <div key={`${dateKey}-${lane.key}`} className={styles['weekly-day-lane-header']}>
                              {lane.label}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles['weekly-board-body']}>
                <div className={styles['time-column']} style={{ height: boardHeight }}>
                  {gridTicks
                    .filter((tick) => tick < rangeEndMinutes && tick % 60 === 0)
                    .map((tick) => (
                      <div key={`week-time-${tick}`} className={styles['time-label']} style={{ top: positionForMinute(tick) + 8 }}>
                        {formatTimelineTick(tick)}
                      </div>
                    ))}
                </div>

                <div className={styles['weekly-days-grid']} style={{ gridTemplateColumns: dayColumnTemplate }}>
                  {weekLayouts.map(({ dateKey, dayBlocks, lanes, blocksByLane }) => (
                    <div key={`body-${dateKey}`} className={styles['weekly-day-column']} style={{ height: boardHeight }}>
                      {lanes.length > 0 ? (
                        <div
                          className={styles['weekly-day-lanes']}
                          style={{ gridTemplateColumns: `repeat(${lanes.length}, minmax(0, 1fr))` }}
                        >
                          {lanes.map((lane) => {
                            const laneBlocks = blocksByLane.get(lane.key) || [];

                            return (
                              <div key={`${dateKey}-${lane.key}-column`} className={styles['weekly-day-lane-column']}>
                                {gridTicks
                                  .filter((tick) => tick < rangeEndMinutes)
                                  .map((tick) => (
                                    <div
                                      key={`${dateKey}-${lane.key}-grid-${tick}`}
                                      className={`${styles['grid-line']} ${
                                        tick % 60 === 0 ? styles['grid-line-hour'] : styles['grid-line-half']
                                      }`}
                                      style={{ top: positionForMinute(tick) }}
                                    />
                                  ))}

                                {laneBlocks.map((block) => (
                                  <DailyOtBlockCard
                                    key={block.uuid}
                                    block={block}
                                    laneLabel={lane.label}
                                    boardHeight={boardHeight}
                                    rangeEndMinutes={rangeEndMinutes}
                                    rangeStartMinutes={rangeStartMinutes}
                                    onOpenDetails={openDetailsModal}
                                  />
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={styles['weekly-day-empty']}>
                          {dayBlocks.length === 0
                            ? t('noBlocksForDay', 'No blocks for this day')
                            : t('noVisibleTheatresForDay', 'No visible OTs for this day')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles['weekly-mobile-board']}>
              {weekLayouts.map(({ date, dateKey, dayBlocks, lanes, blocksByLane }) => (
                <section key={`mobile-${dateKey}`} className={styles['weekly-mobile-day']}>
                  <div className={styles['weekly-mobile-day-header']}>
                    <span className={styles['weekly-day-name']}>{date.format('ddd')}</span>
                    <span className={styles['weekly-day-number']}>{date.format('DD')}</span>
                  </div>

                  <DailyOtMobileBoard lanes={lanes} blocksByLane={blocksByLane} onOpenDetails={openDetailsModal} />
                </section>
              ))}
            </div>

            {isCalendarLoading ? (
              <div className={styles['state-message']}>{t('loadingCalendar', 'Loading calendar...')}</div>
            ) : null}
          </React.Fragment>
        )}
      </section>
    </div>
  );
};

export default WeeklyOtCalendarView;
