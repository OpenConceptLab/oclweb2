import React from 'react';
import {
  TableRow, TableCell, Chip
} from '@material-ui/core';
import { map } from 'lodash';

const ConceptHierarchyRow = ({ mapType, concepts, source }) => {
  const onDefaultClick = (event, concept) => {
    event.stopPropagation()
    event.preventDefault()
    window.location.hash = concept.url
  }

  return (
    <React.Fragment>
      {
        mapType &&
        <TableRow hover>
          <TableCell align='left' rowSpan={concepts.length + 1} style={{paddingRight: '5px', verticalAlign: 'top', paddingTop: '7px'}}>
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
        map(concepts, concept => {
          return (
            <TableRow
              hover key={concept.uuid} onClick={event => onDefaultClick(event, concept)} style={{cursor: 'pointer'}} className='underline-text'>
              <TableCell align='left' className='ellipsis-text' style={{maxWidth: '200px'}}>
                {concept.id}
              </TableCell>
              <TableCell align='left'>
                { concept.name }
              </TableCell>
              <TableCell align='left'>
                {source.id}
              </TableCell>
              <TableCell align='right' style={{width: '24px', paddingRight: '5px'}}>
              </TableCell>
            </TableRow>
          )
        })
      }
    </React.Fragment>
  )
}

export default ConceptHierarchyRow;
