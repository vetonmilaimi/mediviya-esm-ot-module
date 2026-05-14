import React, { ReactElement, useMemo } from 'react';
import { isDesktop, navigate, showModal, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';

import { useProviders } from '../../hooks/useProviders';
import { AddActualTimeModalPayload, IFilters, ISurgicalBlock } from '../../utils/types';
import { useSurgicalBlocks } from '../../hooks/useSurgicalBlocks';
import { PeriodEnum } from '../../utils/constants';
import { filterSurgicalBlocks } from '../../utils/schedulingFilters';
import { buildSchedulingRows } from '../../utils/schedulingRows';

import styles from './scheduling-table-list.scss';

const headers = [
  { key: 'status', header: 'Status' },
  { key: 'patientName', header: 'Patient Name' },
  { key: 'identifier', header: 'Identifier' },
  { key: 'date', header: 'Date' },
  { key: 'startTime', header: 'Start Time' },
  { key: 'ot', header: 'OT#' },
  { key: 'day', header: 'Day' },
  { key: 'patientAge', header: 'Patient Age' },
  { key: 'estTime', header: 'Est Time' },
  { key: 'actualTime', header: 'Actual Time' },
  { key: 'surgeon', header: 'Surgeon' },
  { key: 'procedures', header: 'Procedure(s)' },
  { key: 'otherSurgeon', header: 'Other Surgeon' },
  { key: 'surgicalAssistant', header: 'Surgical Assistant' },
  { key: 'anaesthetist', header: 'Anaesthetist' },
  { key: 'scrubNurse', header: 'Scrub Nurse' },
  { key: 'circulatingNurse', header: 'Circulating Nurse' },
  { key: 'notes', header: 'Notes' },
  { key: 'bedLocation', header: 'Bed Location' },
  { key: 'bedNumber', header: 'Bed Number' },
  { key: 'actions', header: 'Actions' },
  { key: 'patientUuid', header: 'patientUuid' },
];

interface ISchedulingTableList {
  date: Date;
  period: string;
  filters: IFilters;
}

const SchedulingTableList: React.FC<ISchedulingTableList> = ({ date, period, filters }) => {
  const layout = useLayoutType();
  const { t } = useTranslation();
  const { providers } = useProviders();
  const { surgicalBlocks } = useSurgicalBlocks(
    date.toDateString(),
    period === 'week' ? PeriodEnum.WEEKLY : PeriodEnum.DAILY,
  );
  const filteredBlocks = useMemo(() => filterSurgicalBlocks(surgicalBlocks || [], filters), [filters, surgicalBlocks]);
  const schedulingRows = useMemo(() => buildSchedulingRows(filteredBlocks, providers), [filteredBlocks, providers]);
  const basePath = `${window.spaBase}/home/operation-theater`;

  const collapsedColumnCount = isDesktop(layout) ? 6 : 3;

  const translatedHeaders = headers.map((h) => ({ ...h, header: t(h.key, h.header) }));

  const filteredRows = schedulingRows.map(({ block, appointment, ...row }) => {
    const attrArray = Array.isArray(appointment?.surgicalAppointmentAttributes)
      ? appointment.surgicalAppointmentAttributes
      : [];
    const attrMap = attrArray.reduce<Record<string, string>>((acc, attribute) => {
      const name = attribute?.surgicalAppointmentAttributeType?.name;
      if (name) {
        acc[name] = attribute.value;
      }
      return acc;
    }, {});
    const menuActionId = `set-actual-time-${appointment?.uuid ? String(appointment.uuid) : row.id}`;
    const surgicalBlockActionId = `surgical-block-${block.uuid}`;

    const actions: ReactElement = (
      <div className={styles['actions-group']}>
        <Layer className={styles['actions-layer']}>
          <OverflowMenu
            aria-label={t('actionsMenu', 'Actions menu')}
            align="left"
            flipped
            selectorPrimaryFocus={`#${surgicalBlockActionId}`}
          >
            <OverflowMenuItem
              id={surgicalBlockActionId}
              className={styles['actions-menu-item']}
              itemText={t('surgicalBlock', 'Surgical Block')}
              onClick={() => navigate({ to: `${basePath}/surgical-block?id=${block.uuid}` })}
            />
            <OverflowMenuItem
              id={menuActionId}
              className={styles['actions-menu-item']}
              itemText={t('addActualTime', 'Add actual Time')}
              onClick={() => {
                if (appointment?.uuid) {
                  const modalPayload: AddActualTimeModalPayload = {
                    appointmentUuid: String(appointment.uuid),
                    patientName: row.patientName,
                    identifier: row.identifier,
                    initialStartDatetime: appointment.actualStartDatetime || block.startDatetime,
                    initialEndDatetime: appointment.actualEndDatetime || block.endDatetime,
                    initialNotes: row.notes,
                  };
                  const dispose = showModal('add-actual-time-modal', {
                    onClose: () => dispose(),
                    props: modalPayload,
                  });
                  return;
                }

                showSnackbar({
                  title: t('actualTimeUnavailable', 'Unable to add actual time'),
                  subtitle: t(
                    'actualTimeUnavailableNoAppointment',
                    'No surgical appointment exists for this block yet.',
                  ),
                  kind: 'error',
                  isLowContrast: true,
                });
              }}
            />
            <OverflowMenuItem
              className={styles['actions-menu-item']}
              itemText={t('move', 'Move')}
              onClick={() => {
                const dispose = showModal('move-surgical-block-modal', {
                  onClose: () => dispose(),
                  props: {
                    blockUuid: block.uuid,
                    appointmentUuid: String(appointment?.uuid || ''),
                    currentStartDatetime: block.startDatetime,
                    currentEndDatetime: block.endDatetime,
                    currentLocationUuid: block.location?.uuid,
                    currentLocationName: row.ot,
                    currentProviderUuid: block.provider?.uuid,
                    currentProviderName: row.surgeon,
                    patientName: row.patientName,
                    identifier: row.identifier,
                    estTimeMinutes: attrMap['estTimeMinutes'] ? Number(attrMap['estTimeMinutes']) : 0,
                  },
                });
              }}
            />
          </OverflowMenu>
        </Layer>
      </div>
    );

    return {
      ...row,
      patientUuid: appointment?.patient?.uuid || '',
      actions,
    };
  });

  return (
    <TableContainer className={styles['scheduling-table-wrapper']}>
      <DataTable isSortable rows={filteredRows} headers={translatedHeaders}>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
          <TableContainer>
            <Table {...getTableProps()} size={isDesktop(layout) ? 'sm' : 'lg'}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map((headerItem, headerIndex) => {
                    if (headerIndex < collapsedColumnCount) {
                      return (
                        <TableHeader key={headerItem.key} {...getHeaderProps({ header: headerItem })}>
                          {headerItem.header}
                        </TableHeader>
                      );
                    }

                    return (
                      <TableHeader
                        key={headerItem.key}
                        {...getHeaderProps({ header: headerItem })}
                        className={styles['sr-only']}
                      >
                        {headerItem.header}
                      </TableHeader>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {!rows ||
                  (rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={headers.length + 1} style={{ textAlign: 'center', color: 'red' }}>
                        {t('noDataFound', 'No data found')}
                      </TableCell>
                    </TableRow>
                  ))}
                {rows.map((row) => {
                  const inferredOriginal = row.cells.reduce<Record<string, string>>((acc, cell) => {
                    const parts = String(cell.id).split(':');
                    const key = parts.length > 1 ? parts[1] : parts[0];
                    acc[key] = cell.value;
                    return acc;
                  }, {});

                  const rowWithOriginal = row as unknown as { original?: ISurgicalBlock | Record<string, string> };
                  if (!rowWithOriginal.original || Object.keys(rowWithOriginal.original).length === 0) {
                    rowWithOriginal.original = inferredOriginal;
                  }
                  const data = (rowWithOriginal.original as Record<string, any>) || {};

                  return (
                    <React.Fragment key={row.id}>
                      <TableExpandRow className={styles['hover-row']} {...getRowProps({ row })}>
                        {row.cells.slice(0, collapsedColumnCount).map((cell) => {
                          if (cell.info.header === 'patientName') {
                            return (
                              <TableCell
                                className={styles['link-cell']}
                                onClick={() =>
                                  navigate({
                                    to: `${window.spaBase}/patient/${data.patientUuid}/chart`,
                                  })
                                }
                                key={cell.id}
                              >
                                <a>{cell.value || '-'}</a>
                              </TableCell>
                            );
                          }
                          return <TableCell key={cell.id}>{cell.value}</TableCell>;
                        })}
                        <TableCell key={row.id}>{data.actions ? data.actions : '-'}</TableCell>
                      </TableExpandRow>

                      <TableExpandedRow colSpan={headers.length + 1}>
                        <div className={styles['expanded-content']}>
                          <div className={styles['expanded-card']}>
                            <div className={styles['expanded-summary']}>
                              <div className={styles['patient-info']}>
                                <div className={styles['patient-name']}>{data.patientName || '-'}</div>
                                <div className={styles['patient-meta']}>
                                  <span className={styles['identifier']}>{data.identifier || '-'}</span>
                                  <span className={styles['date']}>{data.date || '-'}</span>
                                </div>
                              </div>

                              <div className={styles['summary-right']}>
                                <span className={styles['status-badge']}>{data.status || '-'}</span>
                                <div className={styles['summary-meta']}>
                                  <div>{data.startTime || '-'}</div>
                                  <div>{data.ot || '-'}</div>
                                </div>
                              </div>
                            </div>

                            <div className={styles['details-grid']}>
                              <div className={styles['detail']}>
                                <dt>{t('surgeon', 'Surgeon')}</dt>
                                <dd>{data.surgeon || '-'}</dd>
                              </div>
                              <div className={styles['detail']}>
                                <dt>{t('procedures', 'Procedure(s)')}</dt>
                                <dd>{data.procedures || '-'}</dd>
                              </div>
                              <div className={styles['detail']}>
                                <dt>{t('otherSurgeon', 'Other Surgeon')}</dt>
                                <dd>{data.otherSurgeon || '-'}</dd>
                              </div>
                              <div className={styles['detail']}>
                                <dt>{t('surgicalAssistant', 'Surgical Assistant')}</dt>
                                <dd>{data.surgicalAssistant || '-'}</dd>
                              </div>
                              <div className={styles['detail']}>
                                <dt>{t('anaesthetist', 'Anaesthetist')}</dt>
                                <dd>{data.anaesthetist || '-'}</dd>
                              </div>
                              <div className={styles['detail']}>
                                <dt>{t('scrubNurse', 'Scrub Nurse')}</dt>
                                <dd>{data.scrubNurse || '-'}</dd>
                              </div>
                              <div className={styles['detail']}>
                                <dt>{t('circulatingNurse', 'Circulating Nurse')}</dt>
                                <dd>{data.circulatingNurse || '-'}</dd>
                              </div>
                              <div className={styles['detail']}>
                                <dt>{t('estTime', 'Estimated Time')}</dt>
                                <dd>{data.estTime || '-'}</dd>
                              </div>
                              <div className={styles['detail']}>
                                <dt>{t('actualTime', 'Actual Time')}</dt>
                                <dd>{data.actualTime || '-'}</dd>
                              </div>
                              <div className={styles['detail']}>
                                <dt>{t('bedLocation', 'Bed Location')}</dt>
                                <dd>{data.bedLocation || '-'}</dd>
                              </div>
                              <div className={styles['detail']}>
                                <dt>{t('age', 'Age')}</dt>
                                <dd>{data.patientAge || '-'}</dd>
                              </div>
                              <div className={styles['detail']}>
                                <dt>{t('bedNumber', 'Bed Number')}</dt>
                                <dd>{data.bedNumber || '-'}</dd>
                              </div>
                            </div>

                            <div className={styles['notes-box']}>
                              <strong>{t('notes', 'Notes')}</strong>
                              <div className={styles['notes-text']}>{data.notes || '-'}</div>
                            </div>
                          </div>
                        </div>
                      </TableExpandedRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </TableContainer>
  );
};

export default SchedulingTableList;
