import React from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Button, DatePicker, DatePickerInput, IconButton, Stack } from '@carbon/react';
import { ArrowLeft, ArrowRight, Filter, Printer } from '@carbon/react/icons';
import { launchWorkspace, navigate } from '@openmrs/esm-framework';

import styles from './scheduling-header-filters.scss';
import { IFilters } from '../../utils/types';
import { countActiveSchedulingFilters } from '../../utils/schedulingUrlState';
import SchedulingSwitchViews from './tabs/scheduling-switch-views.component';

interface ISchedulingHeaderFilters {
  selectedFiltersPeriod: string;
  setSelectedFiltersPeriod: React.Dispatch<React.SetStateAction<string>>;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  filters: IFilters;
  setFilters: React.Dispatch<
    React.SetStateAction<IFilters>
  >;
  onPrint?: () => void;
}

const SchedulingHeaderFilters: React.FC<ISchedulingHeaderFilters> = ({
  selectedFiltersPeriod,
  setSelectedFiltersPeriod,
  selectedDate,
  setSelectedDate,
  filters,
  setFilters,
  onPrint,
}) => {
  const { t } = useTranslation();
  const activeFiltersCount = countActiveSchedulingFilters(filters);

  const changeFiltersPeriod = (index: string) => {
    setSelectedFiltersPeriod(index);
  };

  const changeToActualTime = () => {
    setSelectedDate(new Date(Date.now()));
  };

  const shiftDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const launchFilters = (t: TFunction<'translation', undefined>) => {
    launchWorkspace('ot-scheduling-filters-workspace', {
      initialQuery: '',
      workspaceTitle: t('scheduling-filters', 'Scheduling Filters'),
      state: {
        filters,
        setFilters,
      },
    });
  };

  return (
    <Stack orientation="vertical">
      <Stack orientation="horizontal" gap={3}>
        <div className={styles['new-surgical-block-button']}>
          <Button
            onClick={() => launchFilters(t)}
            kind="tertiary"
            size="md"
            renderIcon={() => <Filter alignmentBaseline="middle" />}
          >
            <span className={styles['filters-button-label']}>
              {t('filters', 'Filters')}
              {activeFiltersCount > 0 && <span className={styles['filters-button-count']}>{activeFiltersCount}</span>}
            </span>
          </Button>
          <Button
            kind="primary"
            size="md"
            onClick={() => navigate({ to: `${window.spaBase}/home/operation-theater/surgical-block?mode=new` })}
          >
            {t('new-surgical-block', 'New Surgical Block')}
          </Button>
        </div>
      </Stack>

      <div className={styles['scheduling-header-filters']}>
        <div className={styles['scheduling-header-filters__left']}>
          <div className={styles['top-filters']}>
            <IconButton
              label="Previous"
              kind="tertiary"
              size="sm"
              onClick={() => shiftDate(selectedFiltersPeriod === 'week' ? -7 : -1)}
            >
              <ArrowLeft />
            </IconButton>
            <Button className={styles['time-period-btn']} kind="tertiary" size="sm" onClick={changeToActualTime}>
              {selectedFiltersPeriod === 'week' ? t('this-week', 'This Week') : t('today', 'Today')}
            </Button>
            <IconButton
              label="Next"
              kind="tertiary"
              size="sm"
              onClick={() => shiftDate(selectedFiltersPeriod === 'week' ? 7 : 1)}
            >
              <ArrowRight />
            </IconButton>
          </div>
          <div className={styles['top-filters']}>
            <Button
              className={styles['period-btn']}
              onClick={() => changeFiltersPeriod('week')}
              kind={selectedFiltersPeriod === 'week' ? 'primary' : 'tertiary'}
              size="sm"
            >
              {t('week', 'Week')}
            </Button>
            <Button
              className={styles['period-btn']}
              onClick={() => changeFiltersPeriod('day')}
              kind={selectedFiltersPeriod === 'day' ? 'primary' : 'tertiary'}
              size="sm"
            >
              {t('day', 'Day')}
            </Button>
          </div>
          <div className={styles['top-filters']}>
            <div>
              <IconButton
                label="Previous Day"
                kind="tertiary"
                size="sm"
                onClick={() => shiftDate(selectedFiltersPeriod === 'week' ? -7 : -1)}
              >
                <ArrowLeft />
              </IconButton>
            </div>
            <div className={styles['date-picker-container']}>
              <div style={{ display: selectedFiltersPeriod === 'week' ? 'flex' : 'none' }}>
                <DatePicker
                  datePickerType="range"
                  value={[
                    new Date(selectedDate.getTime() - selectedDate.getDay() * 24 * 60 * 60 * 1000),
                    new Date(selectedDate.getTime() + (6 - selectedDate.getDay()) * 24 * 60 * 60 * 1000),
                  ]}
                  onChange={(dates) => {
                    if (dates[0]) {
                      setSelectedDate(dates[0]);
                    }
                  }}
                >
                  <DatePickerInput id="date-picker-start" labelText="" placeholder="mm/dd/yyyy" size="sm" />
                  <DatePickerInput id="date-picker-end" labelText="" placeholder="mm/dd/yyyy" size="sm" />
                </DatePicker>
              </div>
              <div style={{ display: selectedFiltersPeriod === 'day' ? 'flex' : 'none' }}>
                <DatePicker
                  datePickerType="single"
                  value={selectedDate}
                  onChange={(dates) => {
                    setSelectedDate(dates[0]);
                  }}
                >
                  <DatePickerInput id="date-picker-input-id" labelText="" placeholder="mm/dd/yyyy" size="sm" />
                </DatePicker>
              </div>
            </div>
            <div>
              <IconButton
                label="Next Day"
                kind="tertiary"
                size="sm"
                onClick={() => shiftDate(selectedFiltersPeriod === 'week' ? 7 : 1)}
              >
                <ArrowRight />
              </IconButton>
            </div>
          </div>
        </div>
        <div id="scheduling-switch-views" className={styles['scheduling-header-filters__right']}>
          <IconButton label={t('print', 'Print')} kind="tertiary" size="sm" onClick={() => (onPrint ? onPrint() : window.print())}>
            <Printer />
          </IconButton>
          <SchedulingSwitchViews />
        </div>
      </div>
    </Stack>
  );
};

export default SchedulingHeaderFilters;
