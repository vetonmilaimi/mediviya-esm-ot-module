import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@carbon/react/lib/components/PageHeader';
import { AppointmentsPictogram, PageHeaderContent } from '@openmrs/esm-framework';

import styles from './ot-header.scss';
import HeaderTabs from './tabs/header-tabs.component';

interface OperationTheaterHeaderProps {
  tabSelectedIndex?: number;
}

const OperationTheaterHeader: React.FC<OperationTheaterHeaderProps> = ({ tabSelectedIndex }) => {
  const { t } = useTranslation();

  return (
    <PageHeader className={styles.header} data-testid="ot-page-header">
      <PageHeaderContent illustration={<AppointmentsPictogram />} title={t('operationTheater', 'Operation Theater')} />
      <div>
        {/* <HeaderTabs selectedIndex={tabSelectedIndex} /> */}
      </div>
    </PageHeader>
  );
};

export default OperationTheaterHeader;
