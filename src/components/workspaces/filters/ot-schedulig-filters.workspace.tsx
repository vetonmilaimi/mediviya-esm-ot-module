import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FilterableMultiSelect, Form, Stack } from '@carbon/react';
import {
  type DefaultWorkspaceProps,
  ExtensionSlot,
  usePatient,
} from '@openmrs/esm-framework';
import { Controller, useForm } from 'react-hook-form';

import { useLocations } from '../../../hooks/useLocations';
import { useProviders } from '../../../hooks/useProviders';
import SelectedPatient from '../../selected-patient/selected-patient.component';

import styles from './ot-scheduling-filters.scss';
import { IFilterOption, IFilters } from '../../../utils/types';
import { normalizeFilterItems } from '../../../utils/schedulingFilters';

interface OtSchedulingFiltersProps extends DefaultWorkspaceProps {
  state: {
    filters: IFilters;
    setFilters: React.Dispatch<React.SetStateAction<IFilters>>;
  };
}

const OtSchedulingFilters: React.FC<OtSchedulingFiltersProps> = ({ closeWorkspace, state: workspaceState }) => {
  const { t } = useTranslation();

  const { locations } = useLocations();
  const { providers } = useProviders();

  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState<fhir.Patient | null>(null);
  const { patient: loadedPatient } = usePatient(patientId);

  const { control, handleSubmit, resetField } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      selectedPatient: '',
      surgeon: workspaceState.filters?.surgeon || [],
      location: workspaceState.filters?.location || [],
      status: workspaceState.filters?.status || [],
    },
  });

  const onSubmit = (data: { surgeon: IFilterOption[]; location: IFilterOption[]; status: IFilterOption[] }) => {
    const resolvedPatient = patient ?? loadedPatient ?? null;
    const nextPatient =
      resolvedPatient && resolvedPatient.identifier?.length
        ? { uuid: resolvedPatient.id, patientIdentifier: resolvedPatient.identifier[0].value }
        : patientId
          ? workspaceState.filters?.patient || null
          : null;

    workspaceState.setFilters({
      surgeon: normalizeFilterItems(data?.surgeon),
      location: normalizeFilterItems(data?.location),
      patient: nextPatient,
      status: normalizeFilterItems(data?.status),
    });
    closeWorkspace();
  };

  useEffect(() => {
    if (workspaceState.filters?.patient) {
      setPatientId(workspaceState.filters?.patient?.uuid);
    }
  }, []);

  return (
    <div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack className={styles.formWrapper} gap={6}>
          {!patientId ? (
            <ExtensionSlot
              name="patient-search-bar-slot"
              state={{
                selectPatientAction: (patientUuid) => {
                  setPatientId(patientUuid);
                },
              }}
            />
          ) : (
            <Controller
              name="selectedPatient"
              control={control}
              render={({ field }) => {
                return (
                  <SelectedPatient
                    patientUuid={patientId}
                    setPatientId={setPatientId}
                    resetField={resetField}
                    setPatient={setPatient}
                    fieldName="selectedPatient"
                    {...field}
                  />
                );
              }}
            />
          )}
          <Controller
            name="location"
            control={control}
            render={({ field }) => {
              return (
                <FilterableMultiSelect
                  id="location-filter"
                  titleText={t('filterByLocation', 'Filter by Location')}
                  helperText={t('selectOneOrMoreLocations', 'Select one or more Locations for filtering')}
                  items={locations.map((location) => ({ id: location.uuid, text: location.display }))}
                  itemToString={(item) => item && item.text}
                  selectedItems={field.value}
                  onChange={({ selectedItems }) => field.onChange(selectedItems)}
                />
              );
            }}
          />
          <Controller
            name="surgeon"
            control={control}
            render={({ field }) => {
              return (
                <FilterableMultiSelect
                  id="surgeon-filter"
                  titleText={t('filterBySurgeon', 'Filter by Surgeon')}
                  helperText={t('selectOneOrMoreSurgeons', 'Select one or more Surgeons for filtering')}
                  items={providers.map((provider) => ({ id: provider.uuid, text: provider.display }))}
                  itemToString={(item) => item && item.text}
                  selectedItems={field.value}
                  onChange={({ selectedItems }) => field.onChange(selectedItems)}
                />
              );
            }}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => {
              return (
                <FilterableMultiSelect
                  id="status-filter"
                  titleText={t('filterByStatus', 'Filter by Status')}
                  helperText={t('selectOneOrMoreStatus', 'Select one or more Status for filtering')}
                  items={[
                    { id: 'SCHEDULED', text: 'SCHEDULED' },
                    { id: 'COMPLETED', text: 'COMPLETED' },
                    { id: 'CANCELLED', text: 'CANCELLED' },
                  ]}
                  itemToString={(item) => item && item.text}
                  selectedItems={field.value}
                  onChange={({ selectedItems }) => field.onChange(selectedItems)}
                />
              );
            }}
          />
          <Stack orientation="horizontal" gap={4} className={styles.applyButton}>
            <Button kind="primary" type="submit">
              {t('applyFilters', 'Apply Filters')}
            </Button>
          </Stack>
        </Stack>
      </Form>
    </div>
  );
};

export default OtSchedulingFilters;
