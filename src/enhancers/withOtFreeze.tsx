import { useSession } from '@openmrs/esm-framework';
import React, { ComponentType } from 'react';
import { otAdminRole } from '../utils/constants';

interface Props {}

export default function withOtFreeze<T extends Props>(ChildComponent: ComponentType<T>) {
  return (hocProps: T) => {
    const session = useSession();

    const isOtAdmin = session.user.roles.some((r) => r.display === otAdminRole);

    return <ChildComponent {...hocProps} isOtAdmin={isOtAdmin} />;
  };
}
