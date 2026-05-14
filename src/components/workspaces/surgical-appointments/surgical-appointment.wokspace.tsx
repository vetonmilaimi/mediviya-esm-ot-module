import React from 'react';
import { type DefaultWorkspaceProps } from '@openmrs/esm-framework';

import SurgicalAppointmentForm from '../../forms/surgical-appointment.form';
import { ISurgicalAppointment, ISurgicalBlock } from '../../../utils/types';

interface WorkspaceState extends DefaultWorkspaceProps {
  state: { surgicalBlock: ISurgicalBlock; surgicalAppointment?: ISurgicalAppointment };
}

const AddSurgicalAppointment: React.FC<WorkspaceState> = ({ closeWorkspace, state }) => {
  return <SurgicalAppointmentForm state={state} closeWorkspace={closeWorkspace} />;
};

export default AddSurgicalAppointment;
