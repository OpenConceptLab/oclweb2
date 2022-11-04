import React from 'react';
import {
  TableRow, TableCell, Chip
} from '@mui/material';
import { map, get, orderBy } from 'lodash';

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
        <TableRow hover>
          <TableCell align='left' rowSpan={count + 1} style={{paddingRight: '5px', verticalAlign: 'top', paddingTop: '7px'}}>
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
              <TableCell align='left' className={concept.retired ? 'retired ellipsis-text' : 'ellipsis-text'} style={{maxWidth: '200px'}}>
                {get(concept, 'id')}
              </TableCell>
              <TableCell align='left'>
                { get(concept, 'display_name') }
              </TableCell>
              <TableCell align='left'>
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
