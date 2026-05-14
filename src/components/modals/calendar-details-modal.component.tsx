import React from 'react';
import { launchWorkspace, navigate, showModal } from '@openmrs/esm-framework';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { formatDate, formatDuration, formatTime } from '../../utils/helpers';
import { AddActualTimeModalPayload, CalendarDetailsModalPayload } from '../../utils/types';
import {
  getAppointmentAttributeMap,
  getAppointmentPlannedRange,
  getBlockLocationLabel,
  getBlockSurgeonLabel,
  getPatientIdentifier,
  getPatientName,
} from '../calendar-views/daily-ot-calendar-view.utils';
import styles from './calendar-details-modal.scss';

interface CalendarDetailsModalProps {
  onClose?: () => void;
  closeModal?: () => void;
  props?: CalendarDetailsModalPayload;
  kind?: CalendarDetailsModalPayload['kind'];
  block?: CalendarDetailsModalPayload['block'];
  appointment?: Extract<CalendarDetailsModalPayload, { kind: 'appointment' }>['appointment'];
  laneLabel?: string;
}

const CalendarDetailsModal: React.FC<CalendarDetailsModalProps> = ({
  onClose,
  closeModal,
  props,
  kind: topKind,
  block: topBlock,
  appointment: topAppointment,
  laneLabel: topLaneLabel,
}) => {
  const { t } = useTranslation();

  const close = closeModal ?? onClose ?? (() => {});
  const kind = props?.kind ?? topKind;
  const block = props?.block ?? topBlock;
  const laneLabel = props?.laneLabel ?? topLaneLabel ?? '-';
  const appointment = props?.kind === 'appointment' ? props.appointment : topAppointment;
  const basePath = `${window.spaBase}/home/operation-theater`;
  const formatDateTimeLabel = (iso?: string) => (iso ? dayjs(iso).format('DD MMM, h:mm a') : '-');
  const formatTimeRangeLabel = (startIso?: string, endIso?: string) =>
    startIso && endIso ? `${dayjs(startIso).format('h:mm a')} - ${dayjs(endIso).format('h:mm a')}` : '-';
  const closeAndOpen = (callback: () => void) => {
    close();
    window.setTimeout(callback, 0);
  };

  if (!kind || !block) {
    return null;
  }

  const openAddActualTimeModal = () => {
    if (!appointment) {
      return;
    }

    const payload: AddActualTimeModalPayload = {
      appointmentUuid: String(appointment.uuid),
      patientName: getPatientName(appointment),
      identifier: getPatientIdentifier(appointment),
      initialStartDatetime: appointment.actualStartDatetime || block.startDatetime,
      initialEndDatetime: appointment.actualEndDatetime || block.endDatetime,
      initialNotes: appointment.notes || '',
    };

    closeAndOpen(() => {
      const dispose = showModal('add-actual-time-modal', {
        onClose: () => dispose(),
        props: payload,
      });
    });
  };

  const openMoveModal = () => {
    if (!appointment) {
      return;
    }

    const attrs = getAppointmentAttributeMap(appointment);
    closeAndOpen(() => {
      const dispose = showModal('move-surgical-block-modal', {
        onClose: () => dispose(),
        props: {
          blockUuid: block.uuid,
          appointmentUuid: String(appointment.uuid),
          currentStartDatetime: block.startDatetime,
          currentEndDatetime: block.endDatetime,
          currentLocationUuid: block.location?.uuid || '',
          currentLocationName: getBlockLocationLabel(block),
          currentProviderUuid: block.provider?.uuid || '',
          currentProviderName: getBlockSurgeonLabel(block),
          patientName: getPatientName(appointment),
          identifier: getPatientIdentifier(appointment),
          estTimeMinutes: attrs.estTimeMinutes ? Number(attrs.estTimeMinutes) : 0,
        },
      });
    });
  };

  const openCancelBlockModal = () => {
    closeAndOpen(() => {
      const dispose = showModal('cancel-surgical-block-modal', {
        closeModal: () => dispose(),
        surgicalBlockId: block.uuid,
        onSuccess: () => {},
        startDatetime: block.startDatetime,
      });
    });
  };

  const openCancelAppointmentModal = () => {
    if (!appointment) {
      return;
    }

    closeAndOpen(() => {
      const dispose = showModal('cancel-surgical-appointment-modal', {
        closeModal: () => dispose(),
        surgicalAppointmentId: String(appointment.uuid),
        startDatetime: block.startDatetime,
      });
    });
  };

  const openEditAppointmentWorkspace = () => {
    if (!appointment) {
      return;
    }

    closeAndOpen(() => {
      launchWorkspace('add-surgical-appointment-workspace', {
        initialQuery: '',
        workspaceTitle: t('add-surgery', 'Add Surgery'),
        state: {
          surgicalBlock: block,
          surgicalAppointment: appointment,
        },
      });
    });
  };

  const appointmentAttrs = appointment ? getAppointmentAttributeMap(appointment) : {};
  const appointmentPlannedRange = appointment ? getAppointmentPlannedRange(appointment, block) : null;
  const procedures = appointmentAttrs.procedure || (appointment as any)?.procedures || '-';

  return (
    <React.Fragment>
      <ModalHeader
        closeModal={close}
        title={
          kind === 'block'
            ? t('surgicalBlockDetails', 'Surgical Block Details')
            : t('surgicalAppointmentDetails', 'Surgical Appointment Details')
        }
      />

      <ModalBody className={styles['calendar-details-modal-body']} hasScrollingContent>
        {kind === 'block' ? (
          <React.Fragment>
            <div className={styles['details-header']}>
              <div className={styles['details-title']}>{laneLabel}</div>
            </div>

            <dl className={styles['details-grid']}>
              <div className={styles['detail-item']}>
                <dt className={styles['detail-label']}>{t('surgeon', 'Surgeon')}</dt>
                <dd className={styles['detail-value']}>{getBlockSurgeonLabel(block)}</dd>
              </div>
              <div className={styles['detail-item']}>
                <dt className={styles['detail-label']}>{t('location', 'Location')}</dt>
                <dd className={styles['detail-value']}>{getBlockLocationLabel(block)}</dd>
              </div>
              <div className={styles['detail-item']}>
                <dt className={styles['detail-label']}>{t('date', 'Date')}</dt>
                <dd className={styles['detail-value']}>{formatDate(block.startDatetime)}</dd>
              </div>
              <div className={styles['detail-item']}>
                <dt className={styles['detail-label']}>{t('duration', 'Duration')}</dt>
                <dd className={styles['detail-value']}>
                  {formatTimeRangeLabel(block.startDatetime, block.endDatetime)}
                </dd>
              </div>
            </dl>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <dl className={styles['details-grid']}>
              <div className={styles['detail-item']}>
                <dt className={styles['detail-label']}>{t('patient', 'Patient')}</dt>
                <dd className={styles['detail-value']}>{getPatientName(appointment)}</dd>
              </div>
              <div className={styles['detail-item']}>
                <dt className={styles['detail-label']}>{t('location', 'Location')}</dt>
                <dd className={styles['detail-value']}>{laneLabel}</dd>
              </div>
              <div className={styles['detail-item']}>
                <dt className={styles['detail-label']}>{t('estimatedTime', 'Estimated Time')}</dt>
                <dd className={styles['detail-value']}>
                  {appointmentPlannedRange
                    ? `${appointmentPlannedRange.start.format('DD MMM, h:mm a')} - ${appointmentPlannedRange.end.format('DD MMM, h:mm a')}`
                    : '-'}
                </dd>
              </div>
              {appointment?.actualStartDatetime && appointment?.actualEndDatetime ? (
                <div className={styles['detail-item']}>
                  <dt className={styles['detail-label']}>{t('actualTime', 'Actual Time')}</dt>
                  <dd className={styles['detail-value']}>
                    {`${formatDateTimeLabel(appointment.actualStartDatetime)} - ${formatDateTimeLabel(appointment.actualEndDatetime)}`}
                  </dd>
                </div>
              ) : null}
              <div className={styles['detail-item']}>
                <dt className={styles['detail-label']}>{t('procedures', 'Procedure(s)')}</dt>
                <dd className={styles['detail-value']}>{procedures}</dd>
              </div>
              <div className={styles['detail-item']}>
                <dt className={styles['detail-label']}>{t('surgeon', 'Surgeon')}</dt>
                <dd className={styles['detail-value']}>{getBlockSurgeonLabel(block)}</dd>
              </div>
            </dl>
          </React.Fragment>
        )}
      </ModalBody>

      <ModalFooter>
        {kind === 'block' ? (
          <>
            <Button kind="danger" onClick={openCancelBlockModal}>
              {t('cancelBlock', 'Cancel Block')}
            </Button>
            <Button
              kind="primary"
              onClick={() => {
                close();
                navigate({ to: `${basePath}/surgical-block?id=${block.uuid}` });
              }}
            >
              {t('edit', 'Edit')}
            </Button>
          </>
        ) : (
          <>
            <Button kind="danger" onClick={openCancelAppointmentModal}>
              {t('cancelSurgery', 'Cancel Surgery')}
            </Button>
            <Button kind="secondary" onClick={openMoveModal}>
              {t('move', 'Move')}
            </Button>
            <Button kind="secondary" onClick={openAddActualTimeModal}>
              {t('addActualTime', 'Add Actual Time')}
            </Button>
            <Button kind="primary" onClick={openEditAppointmentWorkspace}>
              {t('edit', 'Edit')}
            </Button>
          </>
        )}
      </ModalFooter>
    </React.Fragment>
  );
};

export default CalendarDetailsModal;
