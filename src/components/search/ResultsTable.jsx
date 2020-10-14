import React from 'react';
import { TableContainer, Table, TableHead, TableBody, TableCell, TableRow } from '@material-ui/core';
import { Pagination } from '@material-ui/lab'
import { map, startCase, get } from 'lodash';
import { BLUE, WHITE } from '../../common/constants';
import { formatDate } from '../../common/utils';
import ToConceptLabel from '../mappings/ToConceptLabel';
import FromConceptLabel from '../mappings/FromConceptLabel';

const RESOURCE_DEFINITIONS = {
  concepts: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: [
      {id: 'id', label: 'ID', value: 'display_name'},
      {id: 'name', label: 'Name', value: 'id'},
      {id: 'owner', label: 'Owner', value: 'owner'},
      {id: 'parent', label: 'Parent', value: 'source'},
      {id: 'class', label: 'Class', value: 'concept_class'},
      {id: 'datatype', label: 'Datatype', value: 'datatype'},
      {id: 'updatedOn', label: 'Updated On', value: 'version_created_on', formatter: formatDate},
    ]
  },
  mappings: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: [
      {id: 'id', label: 'ID', value: 'id'},
      {id: 'owner', label: 'Owner', value: 'owner'},
      {id: 'parent', label: 'Parent', value: 'source'},
      {id: 'from', label: 'From', renderer: (mapping) => <FromConceptLabel {...mapping} />},
      {id: 'mapType', label: 'Map Type', value: 'map_type'},
      {id: 'to', label: 'To', renderer: (mapping) => <ToConceptLabel {...mapping} />},
      {id: 'updatedOn', label: 'Updated On', value: 'version_created_on', formatter: formatDate},
    ]
  }
}

const ResultsTable = ({resource, results, onPageChange}) => {
  const resourceDefinition = RESOURCE_DEFINITIONS[resource];
  const theadBgColor = get(resourceDefinition, 'headBgColor', BLUE);
  const theadTextColor = get(resourceDefinition, 'headTextColor', WHITE);
  const theadStyles = {
    backgroundColor: theadBgColor,
    border: `1px solid ${theadBgColor}`,
  }
  const columnsCount = get(resourceDefinition, 'columns.length', 1).toString()
  const canRender = results.total && resourceDefinition;

  const getValue = (item, column) => {
    const value = get(item, column.value, '')
    if(get(column, 'formatter') && value)
      return column.formatter(value)
    if(get(column, 'renderer'))
      return column.renderer(item)
    return value
  }

  return (
    <div className='col-sm-12 no-side-padding'>
      {
        canRender ?
        <div className='col-sm-12 no-side-padding search-results'>
          <TableContainer style={{borderRadius: '4px'}}>
            <Table size='small'>
              <TableHead style={theadStyles}>
                <TableRow>
                  {
                    map(resourceDefinition.columns, column => (
                      <TableCell key={column.id} align='left' style={{color: theadTextColor}}>
                        { column.label }
                      </TableCell>
                    ))
                  }
                </TableRow>
              </TableHead>
              <TableBody style={{border: '1px solid lightgray'}}>
                {
                  map(results.items, item => (
                    <TableRow hover key={item.id}>
                      {
                        map(resourceDefinition.columns, column => (
                          <TableCell key={column.id} align='left'>
                            { getValue(item, column) }
                          </TableCell>
                        ))
                      }
                    </TableRow>
                  ))
                }
                <TableRow colSpan={columnsCount}>
                  <TableCell colSpan={columnsCount} align='center' className='pagination-center'>
                    <Pagination
                      onChange={(event, page) => onPageChange(page)}
                      count={results.pages}
                      variant="outlined"
                      shape="rounded"
                      color="primary"
                      showFirstButton
                      showLastButton
                      page={results.pageNumber}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div> :
        <div style={{padding: '2px'}}>We found 0 {startCase(resource)}.</div>
      }
    </div>
  )
}

export default ResultsTable
