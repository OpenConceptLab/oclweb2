import React from 'react';
import {
  Table, TableHead, TableBody, TableCell, TableRow, CircularProgress
} from '@mui/material';
import { Pagination } from '@mui/material';
import { find, get, map, isEmpty } from 'lodash';
import { BLUE, WHITE } from '../../common/constants';
import PageResultsLabel from '../search/PageResultsLabel';
import NavigationButtonGroup from '../search/NavigationButtonGroup';

const ConceptTable = ({ concepts, hapi, onPageChange, isLoading, noPaginate }) => {
  const theadStyles = {
    backgroundColor: BLUE,
    border: `1px solid ${BLUE}`,
  }
  const headCellStyles = {
    color: WHITE,
    fontWeight: 'bold',
  }
  const getValue = (concept, attr, valueType) => get(find(get(concept, 'property', []), {code: attr}), valueType)

  const onNavClick = next => onPageChange(next ? concepts.pageNumber + 1 : concepts.pageNumber - 1);
  const hasNext = () => concepts.pages > concepts.pageNumber;
  const hasPrev = () => concepts.pageNumber !== 1;

  return (
    <div className='col-md-12 no-side-padding'>
      {
        !hapi && !noPaginate &&
        <div className='col-md-12 flex-vertical-center' style={{justifyContent: 'flex-end'}}>
          <span>
            <PageResultsLabel disabled results={concepts} limit={100} />
          </span>
          <span>
            <NavigationButtonGroup onClick={onNavClick} next={hasNext()} prev={hasPrev()} />
          </span>
        </div>
      }
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
            isLoading ?
            <TableRow hover>
              <TableCell align='center' colSpan={4}><CircularProgress /></TableCell>
            </TableRow> :
            (
              isEmpty(concepts.results) ?
              <TableRow hover>
                <TableCell align='center' colSpan={4}>We found 0 codes.</TableCell>
              </TableRow> :
              <React.Fragment>
                {
                  map(concepts.results, (concept, index) => {
                    const isInactive = getValue(concept, 'inactive', 'valueBoolean')
                    const className = isInactive ? 'retired' : '';
                    return (
                      <TableRow hover key={index}>
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
                {
                  !hapi && !noPaginate &&
                  <TableRow colSpan="4">
                    <TableCell colSpan="4" align='center' className='pagination-center'>
                      <Pagination
                        onChange={(event, page) => onPageChange(page)}
                        count={concepts.pages}
                        variant="outlined"
                        shape="rounded"
                        color="primary"
                        showFirstButton
                        showLastButton
                        page={concepts.pageNumber}
                      />
                    </TableCell>
                  </TableRow>
                }
              </React.Fragment>
            )
          }
        </TableBody>
      </Table>
    </div>
  )
}

export default ConceptTable;
