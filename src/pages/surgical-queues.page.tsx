import React from 'react';

import OperationTheaterHeader from '../components/headers/ot-header.component';
import SurgicalQueuesTable from '../components/tables/surgical-queues-table.component';

const SurgicalQueues = () => {
  return (
    <div>
      <OperationTheaterHeader />
      <SurgicalQueuesTable />
    </div>
  );
};

export default SurgicalQueues;
