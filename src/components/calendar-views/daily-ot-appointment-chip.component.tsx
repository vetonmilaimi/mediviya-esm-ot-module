import React from 'react';
import { useTranslation } from 'react-i18next';

import { CalendarDetailsModalPayload, ISurgicalAppointment, ISurgicalBlock } from '../../utils/types';
import {
  getActualTimeLabel,
  getEstimatedTimeLabel,
  getPatientName,
} from './daily-ot-calendar-view.utils';
import styles from './daily-ot-calendar-view.scss';

interface AppointmentChipProps {
  block: ISurgicalBlock;
  appointment: ISurgicalAppointment;
  laneLabel: string;
  onOpenDetails: (payload: CalendarDetailsModalPayload) => void;
  style?: React.CSSProperties;
}

const DailyOtAppointmentChip: React.FC<AppointmentChipProps> = ({ block, appointment, laneLabel, onOpenDetails, style }) => {
  const { t } = useTranslation();
  const className = style
    ? `${styles['appointment-chip']} ${styles['appointment-chip-positioned']}`
    : styles['appointment-chip'];

  return (
    <button
      type="button"
      className={className}
      onClick={(event) => {
        event.stopPropagation();
        onOpenDetails({ kind: 'appointment', block, appointment, laneLabel });
      }}
      style={style}
    >
      <span className={styles['appointment-chip-header']}>
        <span className={styles['appointment-patient']}>{getPatientName(appointment)}</span>
      </span>
      <span className={styles['appointment-detail']}>
        {t('estimatedTimeShort', 'Est')}: {getEstimatedTimeLabel(appointment, block)}
      </span>
      {appointment?.actualStartDatetime && appointment?.actualEndDatetime ? (
        <span className={styles['appointment-detail']}>
          {t('actualTimeShort', 'Actual Time')} - {getActualTimeLabel(appointment)}
        </span>
      ) : null}
    </button>
  );
};

export default DailyOtAppointmentChip;
