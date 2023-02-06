import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, IconButton, Tooltip, Badge, CircularProgress, Chip, Button } from '@mui/material';
import {
  QueryStats as HierarchyIcon,
} from '@mui/icons-material'
import { map, get, find, isEmpty, includes } from 'lodash';
import ConceptDisplayName from './ConceptDisplayName';
import ConceptCascadeVisualizeDialog from './ConceptCascadeVisualizeDialog';

const ConceptStatus = ({ status, added, onVisualize }) => {
  let color = 'success'
  const isSuccess = status === 200
  if(isSuccess && !added)
    color = 'warning'
  if(!isSuccess)
    color = 'error'

  return (
    <Badge badgeContent={added} color={color} showZero style={{margin: '5px 0'}}>
      {
        (isSuccess && added) ?
          <Tooltip title='Visualize (Beta)' placement='right'>
            <IconButton size='small' color='primary' onClick={onVisualize}>
              <HierarchyIcon fontSize='inherit'/>
            </IconButton>
          </Tooltip> :
        <Chip size='small' label={status === 200 ? 'Success' : 'Failed'} variant='outlined' color={color}/>
      }
    </Badge>
  )
}

const ConceptTable = ({ concepts, showProgress, showStatus, visualFilters, onPreviewClick }) => {
  const [visualize, setVisualize] = React.useState(false);
  const [isClonedConcept, setIsClonedConcept] = React.useState(false)
  let headers = ["Owner", "ID", "Display Name", "Class", "DataType", ""]
  if(showStatus)
    headers = ["Status", ...headers]


  const getClonedConcept = concept => {
    const equivalencyMapTypes = (visualFilters?.equivalencyMapType || '').split(',')
    if(isEmpty(equivalencyMapTypes))
      return get(concept, 'bundle.entry.0')
    const mapping = find(concept?.bundle?.entry, entry => includes(equivalencyMapTypes, entry?.map_type) && entry.to_concept_code === concept.id)
    if(mapping)
      return find(concept?.bundle?.entry, {type: 'Concept', id: mapping.from_concept_code})
  }
  const onVisualize = (concept, isClonedConcept) => {
    setVisualize(concept)
    setIsClonedConcept(Boolean(isClonedConcept))
  }

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
                        <ConceptStatus status={concept.status} added={concept.total} onVisualize={() => onVisualize(getClonedConcept(concept), true)}/>
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
                  <IconButton size='small' color='secondary' onClick={() => setVisualize(concept)}>
                    <HierarchyIcon fontSize='inherit'/>
                  </IconButton>
                </Tooltip>
                {
                  onPreviewClick &&
                    <Button style={{marginLeft: '5px', textTransform: 'none'}} component="a" size='small' variant='text' onClick={() => onPreviewClick(concept)}>Preview</Button>
                }
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
            filters={isClonedConcept ? false : visualFilters}
            noBreadcrumbs={isClonedConcept}
          />
      }
      </React.Fragment>
  )
}

export default ConceptTable
