import React, { useState } from 'react';

import OperationTheaterHeader from '../components/headers/ot-header.component';
import NewSurgicalBlockView from '../components/forms/new-surgical-block-view.component';
import { useSurgicalBlockById } from '../hooks/useSurgicalBlockById';

const SurgicalBlock: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const [surgicalBlockid, _] = useState<string | null>(id ?? null);
  const { surgicalBlock } = useSurgicalBlockById(surgicalBlockid);

  return (
    <div>
      <OperationTheaterHeader tabSelectedIndex={1} />
      <NewSurgicalBlockView isEdit={surgicalBlockid !== null} surgicalBlock={surgicalBlock} />
    </div>
  );
};

export default SurgicalBlock;
