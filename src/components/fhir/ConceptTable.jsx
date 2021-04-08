import React from 'react';
import {
  Table, TableHead, TableBody, TableCell, TableRow,
} from '@material-ui/core';
import { find, get, map, isEmpty } from 'lodash';
import { BLUE, WHITE } from '../../common/constants';

const ConceptTable = ({ concepts, hapi }) => {
  const theadStyles = {
    backgroundColor: BLUE,
    border: `1px solid ${BLUE}`,
  }
  const headCellStyles = {
    color: WHITE,
    fontWeight: 'bold',
  }
  const getValue = (concept, attr, valueType) => get(find(get(concept, 'property', []), {code: attr}), valueType)

  return (
    <Table size="small" aria-label="fhir-concepts">
      <TableHead style={theadStyles}>
        <TableRow>
          <TableCell align='left' style={headCellStyles}>Code</TableCell>
          <TableCell align='left' style={headCellStyles}>Display</TableCell>
          {
            !hapi &&
            <React.Fragment>
              <TableCell align='left' style={headCellStyles}>Concept Class</TableCell>
              <TableCell align='left' style={headCellStyles}>Data Type</TableCell>
            </React.Fragment>
          }
        </TableRow>
      </TableHead>
      <TableBody>
        {
          isEmpty(concepts) ?
          <TableRow hover>
            <TableCell align='center' colSpan={4}>We found 0 codes.</TableCell>
          </TableRow> :
          map(concepts, concept => {
            const isInactive = getValue(concept, 'inactive', 'valueBoolean')
            const className = isInactive ? 'retired' : '';
            return (
              <TableRow hover key={concept.code}>
                <TableCell>{concept.code}</TableCell>
                <TableCell className={className}>{concept.display}</TableCell>
                {
                  !hapi &&
                  <React.Fragment>
                    <TableCell>{getValue(concept, 'conceptclass', 'valueString')}</TableCell>
                    <TableCell>{getValue(concept, 'datatype', 'valueString')}</TableCell>
                  </React.Fragment>
                }
              </TableRow>
            )
          })
        }
      </TableBody>
    </Table>
  )
}

export default ConceptTable;
