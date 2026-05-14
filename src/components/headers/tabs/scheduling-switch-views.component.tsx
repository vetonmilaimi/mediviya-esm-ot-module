import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs } from '@carbon/react';
import { navigate } from '@openmrs/esm-framework';

import styles from './scheduling-switch-views.scss';

const SchedulingSwitchViews: React.FC = () => {
  const { t } = useTranslation();
  const basePath = `${window.spaBase}/home/operation-theater/ot-scheduling`;
  const buildViewUrl = (view: 'calendar' | 'list') => {
    const params = new URLSearchParams(window.location.search);
    params.set('view', view);
    return `${basePath}?${params.toString()}`;
  };

  const getSelectedIndex = () => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'list') return 1;
    return 0;
  };

  const [selected, setSelected] = React.useState<number>(getSelectedIndex());

  useEffect(() => {
    setSelected(getSelectedIndex());
  }, [window.location.search]);

  return (
    <Tabs selectedIndex={selected}>
      <TabList className={styles['custom-tabs']}>
        <Tab onClick={() => navigate({ to: buildViewUrl('calendar') })}>{t('calendar', 'Calendar')}</Tab>
        <Tab onClick={() => navigate({ to: buildViewUrl('list') })}>{t('list', 'List')}</Tab>
      </TabList>
    </Tabs>
  );
};

export default SchedulingSwitchViews;
