import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, IconButton, Tooltip, Badge, CircularProgress, Chip } from '@mui/material';
import {
  QueryStats as HierarchyIcon,
} from '@mui/icons-material'
import { map } from 'lodash';
import ConceptDisplayName from './ConceptDisplayName';
import ConceptCascadeVisualizeDialog from './ConceptCascadeVisualizeDialog';

const ConceptStatus = ({ status, added }) => {
  let color = 'success'
  if(status === 200 && !added)
    color = 'warning'
  if(status !== 200)
    color = 'error'
  return (
    <Badge badgeContent={added} color={color} showZero style={{margin: '5px 0'}}>
      <Chip size='small' label={status === 200 ? 'Success' : 'Failed'} variant='outlined' color={color}/>
    </Badge>
  )
}

const ConceptTable = ({ concepts, showProgress, showStatus, visualFilters }) => {
  const [visualize, setVisualize] = React.useState(false);
  let headers = ["Owner", "ID", "Display Name", "Class", "DataType", ""]
  if(showStatus)
    headers = ["Status", ...headers]

  return (
    <React.Fragment>
    <Table stickyHeader size='small'>
      <TableHead>
        <TableRow>
          {
            headers.map(header => (
              <TableCell style={{backgroundColor: 'rgba(0, 0, 0, 0.09)'}} key={header}>
                <b>{header}</b>
              </TableCell>
            ))
          }
        </TableRow>
      </TableHead>
      <TableBody>
        {
          map(concepts, concept => (
            <TableRow key={concept.id}>
              {
                showStatus &&
                  <TableCell>
                    {
                      showProgress &&
                        <CircularProgress />
                    }
                    {
                      !showProgress && concept.status &&
                        <ConceptStatus status={concept.status} added={concept.total} />
                    }
                  </TableCell>
              }
              <TableCell>
                {concept.owner}/{concept.source}
              </TableCell>
              <TableCell>
                {concept.id}
              </TableCell>
              <TableCell>
                <ConceptDisplayName concept={concept} />
              </TableCell>
              <TableCell>
                {concept.concept_class}
              </TableCell>
              <TableCell>
                {concept.datatype}
              </TableCell>
              <TableCell align='right'>
                <Tooltip title='Visualize (Beta)' placement='right'>
                  <IconButton size='small' color='primary' onClick={() => setVisualize(concept)}>
                    <HierarchyIcon fontSize='inherit'/>
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
      {
        visualize &&
          <ConceptCascadeVisualizeDialog
            open
            onClose={() => setVisualize(false)}
            concept={visualize}
            filters={visualFilters}
          />
      }
      </React.Fragment>
  )
}

export default ConceptTable
