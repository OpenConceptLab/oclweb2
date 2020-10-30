import React from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, Chip, Tooltip,
} from '@material-ui/core';
import {
  ArrowForward as ForwardIcon
} from '@material-ui/icons';
import { map, isEmpty } from 'lodash';

const NestedMappingsTable = ({ mappings, isIndirect }) => {
  const conceptCodeAttr = isIndirect ? 'from_concept_code' : 'to_concept_code';
  const conceptCodeName = isIndirect ? 'from_concept_name' : 'to_concept_name';
  return (
    <Table size="small" aria-label="versions">
      <TableHead>
        <TableRow>
          <TableCell align='center'>Relationship</TableCell>
          <TableCell align='left'>Source</TableCell>
          <TableCell align='left'>Code</TableCell>
          <TableCell align='left'>Name</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          isEmpty(mappings) ?
          <TableRow colSpan='4'>
            <TableCell colSpan='4'>
              None
            </TableCell>
          </TableRow> :
          map(mappings, mapping => (
            <TableRow hover key={mapping.uuid}>
              <TableCell align='center'>
                {
                  mapping.external_id ?
                  <Tooltip placement='top-start' title='External Mapping'>
                    <Chip
                      size='small'
                      variant='outlined'
                      color='default'
                      icon={
                        <ForwardIcon
                          fontSize='small'
                                    color='default'
                                    style={{
                                      border: '1px solid', borderRadius: '10px',
                                      background: 'black', color: 'white',
                                      margin: '0px'
                                    }}
                        />
                      }
                      label={mapping.map_type}
                      style={{border: 'none'}}
                    />
                  </Tooltip> :
                  <Chip
                    size='small'
                    variant='outlined'
                    color='default'
                    style={{border: 'none'}}
                    label={mapping.map_type}
                  />
                }
              </TableCell>
              <TableCell align='left'>
                { `${mapping.owner} / ${mapping.source}` }
              </TableCell>
              <TableCell align='left'>
                { mapping[conceptCodeAttr] }
              </TableCell>
              <TableCell align='left'>
                { mapping[conceptCodeName] }
              </TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}

export default NestedMappingsTable;
