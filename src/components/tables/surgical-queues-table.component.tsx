import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@carbon/react';

// TODO: Not done yet, Fetch data from API and map through it to create rows dynamically
// Also tranlation should be handled
const SurgicalQueuesTable = () => {
  return (
    <Table size="lg">
      <TableHead>
        <TableRow>
          <TableHeader>Identifier</TableHeader>
          <TableHeader>Name</TableHeader>
          <TableHeader>Date Of Surgery</TableHeader>
          <TableHeader>Location</TableHeader>
          <TableHeader>Primary Provider</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>ABC200000</TableCell>
          <TableCell>John Doe</TableCell>
          <TableCell>19/01/2026</TableCell>
          <TableCell>General OT</TableCell>
          <TableCell>Super Man</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default SurgicalQueuesTable;
