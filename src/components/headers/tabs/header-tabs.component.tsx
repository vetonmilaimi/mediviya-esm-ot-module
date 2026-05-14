import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs } from '@carbon/react';
import { navigate } from '@openmrs/esm-framework';

interface HeaderTabsProps {
  selectedIndex?: number;
}

const HeaderTabs: React.FC<HeaderTabsProps> = ({ selectedIndex }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = `${window.spaBase}/home/operation-theater`;

  const getSelectedIndex = () => {
    const path = decodeURIComponent(location.pathname || '');
    if (path.endsWith('/ot-scheduling')) return 1;
    return 0;
  };

  const [selected, setSelected] = useState<number>(selectedIndex ?? getSelectedIndex());

  useEffect(() => {
    if (!!selectedIndex) {
      setSelected(selectedIndex);
    }
  }, [location.pathname]);

  return (
    <Tabs selectedIndex={selected}>
      <TabList>
        <Tab onClick={() => navigate({ to: `${basePath}/` })}>{t('surgical-queues', 'Surgical Queues')}</Tab>
        {/* <Tab onClick={() => navigate({ to: `${basePath}/ot-scheduling?view=calendar` })}>
          {t('ot-scheduling', 'OT Scheduling')}
        </Tab> */}
        <Tab onClick={() => navigate({ to: `${basePath}/ot-scheduling` })}>{t('ot-scheduling', 'OT Scheduling')}</Tab>
      </TabList>
    </Tabs>
  );
};

export default HeaderTabs;
