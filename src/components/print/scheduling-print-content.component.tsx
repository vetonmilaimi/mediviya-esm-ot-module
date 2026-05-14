import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useProviders } from '../../hooks/useProviders';
import { useSurgicalBlocks } from '../../hooks/useSurgicalBlocks';
import { PeriodEnum } from '../../utils/constants';
import { buildSchedulingRows, formatSchedulingPrintDateRange } from '../../utils/schedulingRows';
import { filterSurgicalBlocks } from '../../utils/schedulingFilters';
import { IFilters } from '../../utils/types';
import styles from './scheduling-print-content.scss';

interface SchedulingPrintContentProps {
  date: Date;
  period: string;
  filters: IFilters;
}

const SchedulingPrintContent: React.FC<SchedulingPrintContentProps> = ({ date, period, filters }) => {
  const { t } = useTranslation();
  const { providers } = useProviders();
  const { surgicalBlocks, isLoading } = useSurgicalBlocks(
    date.toDateString(),
    period === 'week' ? PeriodEnum.WEEKLY : PeriodEnum.DAILY,
  );

  const filteredBlocks = useMemo(() => filterSurgicalBlocks(surgicalBlocks || [], filters), [filters, surgicalBlocks]);
  const printRows = useMemo(
    () => buildSchedulingRows(filteredBlocks, providers).map(({ block, appointment, ...row }) => row),
    [filteredBlocks, providers],
  );

  return (
    <div className={styles['print-page']}>
      <div className={styles['print-header']}>
        <h2 className={styles['print-title']}>{t('ot-schedule', 'OT Schedule')}</h2>
        <p className={styles['print-date']}>{formatSchedulingPrintDateRange(date, period)}</p>
      </div>

      <table className={styles['print-table']}>
        <thead>
          <tr>
            <th>{t('day', 'Day')}</th>
            <th>{t('date', 'Date')}</th>
            <th>{t('identifier', 'Identifier')}</th>
            <th>{t('patient-name', 'Patient Name')}</th>
            <th>{t('patient-age', 'Patient Age')}</th>
            <th>{t('est-time', 'Est Time')}</th>
            <th>{t('procedures', 'Procedure(s)')}</th>
            <th>{t('notes', 'Notes')}</th>
            <th>{t('surgeon', 'Surgeon')}</th>
            <th>{t('status', 'Status')}</th>
            <th>{t('bed-location', 'Bed Location')}</th>
            <th>{t('bed-id', 'Bed ID')}</th>
          </tr>
        </thead>
        <tbody>
          {printRows.map((row) => (
            <tr key={`print-${row.id}`}>
              <td>{row.day?.substring(0, 3) || '-'}</td>
              <td>{row.date || '-'}</td>
              <td>{row.identifier || '-'}</td>
              <td>{row.patientName || '-'}</td>
              <td>{row.patientAge || '-'}</td>
              <td>{row.estTime || '-'}</td>
              <td>{row.procedures || '-'}</td>
              <td>{row.notes || '-'}</td>
              <td>{row.surgeon || '-'}</td>
              <td>{row.status || '-'}</td>
              <td>{row.bedLocation || '-'}</td>
              <td>{row.bedNumber || '-'}</td>
            </tr>
          ))}
          {!isLoading && printRows.length === 0 && (
            <tr>
              <td colSpan={12}>{t('no-surgeries-found', 'No surgeries found')}</td>
            </tr>
          )}
          {isLoading && (
            <tr>
              <td colSpan={12}>{t('loadingSchedule', 'Loading schedule...')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SchedulingPrintContent;
