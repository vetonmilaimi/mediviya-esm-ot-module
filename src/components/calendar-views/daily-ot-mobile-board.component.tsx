import React from 'react';
import { useTranslation } from 'react-i18next';

import { CalendarDetailsModalPayload, ISurgicalBlock } from '../../utils/types';
import {
  asKeyboardButton,
  CalendarLaneDefinition,
  getBlockAppointments,
} from './daily-ot-calendar-view.utils';
import DailyOtAppointmentChip from './daily-ot-appointment-chip.component';
import styles from './daily-ot-calendar-view.scss';

interface DailyOtMobileBoardProps {
  lanes: Array<CalendarLaneDefinition>;
  blocksByLane: Map<string, Array<ISurgicalBlock>>;
  onOpenDetails: (payload: CalendarDetailsModalPayload) => void;
}

const DailyOtMobileBoard: React.FC<DailyOtMobileBoardProps> = ({ lanes, blocksByLane, onOpenDetails }) => {
  const { t } = useTranslation();

  return (
    <div className={styles['mobile-board']}>
      {lanes.map((lane) => {
        const laneBlocks = blocksByLane.get(lane.key) || [];

        return (
          <section key={`mobile-${lane.key}`} className={styles['mobile-lane']}>
            <div className={styles['mobile-lane-header']}>
              <span>{lane.label}</span>
              {lane.placeholder ? <span className={styles['mobile-lane-tag']}>{t('planned', 'Planned')}</span> : null}
            </div>

            {laneBlocks.length > 0 ? (
              <div className={styles['mobile-lane-content']}>
                {laneBlocks.map((block) => {
                  const appointments = getBlockAppointments(block);

                  return (
                    <div
                      key={block.uuid}
                      className={styles['mobile-block']}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenDetails({ kind: 'block', block, laneLabel: lane.label })}
                      onKeyDown={(event) => asKeyboardButton(event, () => onOpenDetails({ kind: 'block', block, laneLabel: lane.label }))}
                    >
                      <div className={styles['mobile-appointments']}>
                        {appointments.length > 0 ? (
                          appointments.map((appointment) => (
                            <DailyOtAppointmentChip
                              key={appointment.uuid}
                              block={block}
                              appointment={appointment}
                              laneLabel={lane.label}
                              onOpenDetails={onOpenDetails}
                            />
                          ))
                        ) : (
                          <div className={styles['no-appointments']}>{t('noAppointmentsInBlock', 'No surgical appointments')}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles['mobile-empty']}>
                {lane.placeholder
                  ? t('reservedOtLaneDescription', 'This lane is reserved so the layout supports 3 OTs.')
                  : t('noBlocksForTheatre', 'No blocks for this theatre today')}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default DailyOtMobileBoard;
