import { Button, Stack, Tile } from '@carbon/react';
import { getPatientName, PatientBannerPatientInfo, PatientPhoto, usePatient } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';

import styles from './selected-patient.scss';
import { useTranslation } from 'react-i18next';

interface SelectedPatientProps {
  patientUuid: string;
  setPatientId: React.Dispatch<React.SetStateAction<string>>;
  resetField: (name: string, options?: Partial<{ defaultValue: any }>) => void;
  setPatient?: React.Dispatch<React.SetStateAction<fhir.Patient | null>>;
  fieldName?: string;
}

const SelectedPatient: React.FC<SelectedPatientProps> = ({
  patientUuid,
  setPatientId,
  resetField,
  setPatient,
  fieldName = 'patient',
}) => {
  const { t } = useTranslation();
  const { patient } = usePatient(patientUuid);

  useEffect(() => {
    if (setPatient && patient) {
      setPatient(patient);
    }
  }, [patient]);

  return (
    <Tile>
      {patient && (
        <>
          <Stack gap={4} orientation="horizontal">
            <PatientPhoto patientName={getPatientName(patient)} patientUuid={patientUuid} />
            <PatientBannerPatientInfo patient={patient} />
          </Stack>
          <Stack className={styles.searchPatientClear} orientation="horizontal">
            <Button
              onClick={() => {
                setPatientId('');
                if (setPatient) setPatient(null);
                resetField(fieldName, { defaultValue: { uuid: '' } });
              }}
              kind="ghost"
            >
              {t('clear', 'Clear')}
            </Button>
          </Stack>
        </>
      )}
    </Tile>
  );
};

export default SelectedPatient;
