import React from 'react';
import { useTranslation } from 'react-i18next';

import { CalendarDetailsModalPayload, ISurgicalBlock } from '../../utils/types';
import { CalendarLaneDefinition, formatTimelineTick } from './daily-ot-calendar-view.utils';
import DailyOtBlockCard from './daily-ot-block-card.component';
import styles from './daily-ot-calendar-view.scss';

interface DailyOtDesktopBoardProps {
  lanes: Array<CalendarLaneDefinition>;
  blocksByLane: Map<string, Array<ISurgicalBlock>>;
  boardHeight: number;
  gridTicks: Array<number>;
  rangeEndMinutes: number;
  rangeStartMinutes: number;
  positionForMinute: (minute: number) => number;
  onOpenDetails: (payload: CalendarDetailsModalPayload) => void;
}

const DailyOtDesktopBoard: React.FC<DailyOtDesktopBoardProps> = ({
  lanes,
  blocksByLane,
  boardHeight,
  gridTicks,
  rangeEndMinutes,
  rangeStartMinutes,
  positionForMinute,
  onOpenDetails,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles['desktop-board']}>
      <div className={styles['board-header']}>
        <div className={styles['time-header-cell']}>{t('time', 'Time')}</div>
        <div className={styles['lane-headers']} style={{ gridTemplateColumns: `repeat(${lanes.length}, minmax(0, 1fr))` }}>
          {lanes.map((lane) => (
            <div key={lane.key} className={`${styles['lane-header']} ${lane.placeholder ? styles['lane-header-placeholder'] : ''}`}>
              {lane.label}
            </div>
          ))}
        </div>
      </div>

      <div className={styles['board-body']}>
        <div className={styles['time-column']} style={{ height: boardHeight }}>
          {gridTicks
            .filter((tick) => tick < rangeEndMinutes && tick % 60 === 0)
            .map((tick) => (
              <div key={`time-${tick}`} className={styles['time-label']} style={{ top: positionForMinute(tick) + 8 }}>
                {formatTimelineTick(tick)}
              </div>
            ))}
        </div>

        <div className={styles['lanes-grid']} style={{ gridTemplateColumns: `repeat(${lanes.length}, minmax(0, 1fr))` }}>
          {lanes.map((lane) => {
            const laneBlocks = blocksByLane.get(lane.key) || [];

            return (
              <div key={lane.key} className={styles['lane-column']} style={{ height: boardHeight }}>
                {gridTicks
                  .filter((tick) => tick < rangeEndMinutes)
                  .map((tick) => (
                    <div
                      key={`${lane.key}-grid-${tick}`}
                      className={`${styles['grid-line']} ${tick % 60 === 0 ? styles['grid-line-hour'] : styles['grid-line-half']}`}
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
                    onOpenDetails={onOpenDetails}
                  />
                ))}

                {laneBlocks.length === 0 ? (
                  <div className={`${styles['lane-empty-state']} ${lane.placeholder ? styles['lane-empty-placeholder'] : ''}`}>
                    {lane.placeholder
                      ? t('emptyOtSlot', 'Reserved lane for OT')
                      : t('noBlocksForTheatre', 'No blocks for this theatre today')}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyOtDesktopBoard;
