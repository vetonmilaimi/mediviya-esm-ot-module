import React from 'react';
import { useTranslation } from 'react-i18next';

import { CalendarDetailsModalPayload, ISurgicalBlock } from '../../utils/types';
import { formatDuration, formatTime } from '../../utils/helpers';
import {
  asKeyboardButton,
  buildAppointmentLayout,
  getBlockAppointments,
  getBlockPosition,
} from './daily-ot-calendar-view.utils';
import DailyOtAppointmentChip from './daily-ot-appointment-chip.component';
import styles from './daily-ot-calendar-view.scss';

interface BlockCardProps {
  block: ISurgicalBlock;
  laneLabel: string;
  boardHeight: number;
  rangeEndMinutes: number;
  rangeStartMinutes: number;
  onOpenDetails: (payload: CalendarDetailsModalPayload) => void;
}

const DailyOtBlockCard: React.FC<BlockCardProps> = ({
  block,
  laneLabel,
  boardHeight,
  rangeEndMinutes,
  rangeStartMinutes,
  onOpenDetails,
}) => {
  const { t } = useTranslation();
  const appointments = getBlockAppointments(block);
  const { top, height } = getBlockPosition(block, rangeStartMinutes, rangeEndMinutes, boardHeight);
  const appointmentLayout = buildAppointmentLayout(appointments, block, height);

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles['block-card']}
      style={{ top, height }}
      onClick={() => onOpenDetails({ kind: 'block', block, laneLabel })}
      onKeyDown={(event) => asKeyboardButton(event, () => onOpenDetails({ kind: 'block', block, laneLabel }))}
      aria-label={t('surgicalBlockAtLocation', 'Surgical block at {{location}}', { location: laneLabel })}
    >
      <div className={styles['appointment-list']}>
        {appointments.length > 0 ? (
          appointmentLayout.map(({ appointment, topPercent, heightPercent }) => (
            <DailyOtAppointmentChip
              key={appointment.uuid}
              block={block}
              appointment={appointment}
              laneLabel={laneLabel}
              onOpenDetails={onOpenDetails}
              style={{ top: `${topPercent}%`, height: `${heightPercent}%` }}
            />
          ))
        ) : (
          <div className={styles['no-appointments']}>{t('noAppointmentsInBlock', 'No surgical appointments')}</div>
        )}
      </div>
    </div>
  );
};

export default DailyOtBlockCard;
