import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, IconButton, Tooltip, Badge, CircularProgress, Chip } from '@mui/material';
import {
  QueryStats as HierarchyIcon,
  FormatListNumbered as ListIcon
} from '@mui/icons-material'
import { map, get, find, isEmpty, includes } from 'lodash';
import ConceptDisplayName from './ConceptDisplayName';
import ConceptCascadeVisualizeDialog from './ConceptCascadeVisualizeDialog';
import BetaLabel from '../common/BetaLabel';


const HierarchyButton = props => (
  <Tooltip title={<BetaLabel label='Visualize' />} placement='right'>
    <IconButton size='small' color='primary' {...props}>
      <HierarchyIcon fontSize='inherit'/>
    </IconButton>
  </Tooltip>
)

const PreviewButton = ({title, ...rest}) => (
  <Tooltip title={title || 'Preview'} placement='right'>
    <IconButton size='small' color='primary' {...rest}>
      <ListIcon fontSize='inherit'/>
    </IconButton>
  </Tooltip>
)

const ConceptStatus = ({ status, added, onVisualize, onPreview }) => {
  let color = 'success'
  const isSuccess = status === 200
  if(isSuccess && !added)
    color = 'warning'
  if(!isSuccess)
    color = 'error'

  return (
    <Badge badgeContent={added} color={color} showZero style={{margin: '5px 0'}}>
      {
        isSuccess ?
          <React.Fragment>
            <HierarchyButton onClick={onVisualize} />
            {
              onPreview &&
                <PreviewButton
                  style={{marginLeft: '5px'}}
                  size='small'
                  onClick={onPreview}
                />
            }
          </React.Fragment> :
        <Chip size='small' label={status === 200 ? 'Success' : 'Failed'} variant='outlined' color={color}/>
      }
    </Badge>
  )
}

const ConceptTable = ({ concepts, showProgress, showStatus, visualFilters, onPreviewClick }) => {
  const [visualize, setVisualize] = React.useState(false);
  const [isClonedConcept, setIsClonedConcept] = React.useState(false)
  let headers = ["Owner", "ID", "Display Name", "Class", "DataType", "Preview"]
  if(showStatus)
    headers = [...headers, "Results"]


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
                <TableCell style={{backgroundColor: 'rgba(0, 0, 0, 0.09)'}} key={header} align={['Preview', 'Results'].includes(header) ? 'center' : 'left'}>
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
                <TableCell align='center'>
                  <HierarchyButton  onClick={() => setVisualize(concept)} />
                  {
                    onPreviewClick &&
                      <PreviewButton
                        style={{marginLeft: '5px'}}
                        size='small'
                        onClick={() => onPreviewClick(concept)}
                      />
                  }
                </TableCell>
                {
                  showStatus &&
                    <TableCell align='center'>
                      {
                        showProgress &&
                          <CircularProgress />
                      }
                      {
                        !showProgress && concept.status &&
                          <ConceptStatus status={concept.status} added={concept.total} onVisualize={() => onVisualize(getClonedConcept(concept), true)} onPreview={() => onPreviewClick(getClonedConcept(concept), true)} />
                      }
                    </TableCell>
                }
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
