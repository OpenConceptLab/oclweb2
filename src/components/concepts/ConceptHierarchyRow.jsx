import React from 'react';
import {
  TableRow, TableCell, Chip
} from '@mui/material';
import { map, get, orderBy } from 'lodash';
import ExistsInOCLIcon from '../common/ExistsInOCLIcon';

const ConceptHierarchyRow = ({ mapType, concepts, source }) => {
  const onDefaultClick = (event, concept) => {
    event.stopPropagation()
    event.preventDefault()
    window.location.hash = concept.url
  }

  const count = get(concepts, 'length') || 0
  const getOrderedConcepts = () => orderBy(concepts, 'display_name')

  return (
    <React.Fragment>
      {
        mapType &&
        <TableRow>
          <TableCell align='left' rowSpan={count + 1} style={{paddingRight: '5px', verticalAlign: 'top', paddingTop: '7px', width: '10%'}}>
              <Chip
                size='small'
                variant='outlined'
                color='default'
                label={mapType}
                style={{border: 'none'}}
              />
          </TableCell>
        </TableRow>
      }
      {
        map(getOrderedConcepts(), (concept, index) => {
          return (
            <TableRow
              hover key={get(concept, 'uuid') || index} onClick={event => onDefaultClick(event, concept)} style={{cursor: 'pointer'}} className='underline-text'>
              <TableCell align='left' className='ellipsis-text' style={{width: '30%', paddingLeft: '5px'}}>
                <span className='flex-vertical-center'>
                  <span className='flex-vertical-center' style={{marginRight: '4px'}}>
                    <ExistsInOCLIcon />
                  </span>
                  <span className={concept.retired ? 'retired' : ''}>
                    {get(concept, 'id')}
                  </span>
                  </span>
              </TableCell>
              <TableCell align='left' style={{width: '35%'}}>
                { get(concept, 'display_name') }
              </TableCell>
              <TableCell align='left' style={{width: '20%'}}>
                {get(source, 'id')}
              </TableCell>
              <TableCell />
            </TableRow>
          )
        })
      }
    </React.Fragment>
  )
}

export default ConceptHierarchyRow;
