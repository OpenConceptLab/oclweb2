import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, Tooltip, IconButton
} from '@mui/material';
import {
  Info as InfoIcon,
  FormatIndentIncrease as HierarchyIcon,
} from '@mui/icons-material'
import { get, isEmpty, forEach, map } from 'lodash';
import { BLUE, WHITE } from '../../common/constants'
import { generateRandomString } from '../../common/utils'
import ConceptHomeMappingsTableRows from '../mappings/ConceptHomeMappingsTableRows';
import ConceptHierarchyRow from './ConceptHierarchyRow';
import TabCountLabel from '../common/TabCountLabel';
import ConceptHierarchyTree from './ConceptHierarchyTree';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '600px', overflow: 'auto', display: 'inline-block', width: '100%', padding: '0'
}

const None = () => {
  return <div style={{padding: '20px', fontWeight: '300'}}>None</div>
}

const groupMappings = (concept, mappings) => {
  const orderedMappings = {}
  forEach(mappings, mapping => {
    orderedMappings[mapping.map_type] = orderedMappings[mapping.map_type] || {order: null, direct: [], indirect: [], unknown: []}
    const isDirect = mapping.from_concept_url === concept.url;
    if(isDirect)
      orderedMappings[mapping.map_type].direct.push(mapping)
    else
      orderedMappings[mapping.map_type].indirect.push(mapping)
  })
  return orderedMappings;
}

const HomeMappings = ({ source, concept, isLoadingMappings, childConcepts, parentConcepts, isLoadingChildren, isLoadingParents }) => {
  const [hierarchy, setHierarchy] = React.useState(false);
  const conceptMappings = get(concept, 'mappings') || [];
  const count = isLoadingMappings ? null : conceptMappings.length + get(childConcepts, 'length', 0) + get(parentConcepts, 'length', 0);
  const tbHeadCellStyles = {padding: '8px', color: WHITE}
  const orderedMappings = groupMappings(concept, conceptMappings)
  const hierarchyMeaning = get(source, 'hierarchy_meaning')
  const hierarchyMapType = isChild => {
    return (
      <span>
        <span>{isChild ? 'Has child' : 'Has parent'}</span>
        {
          hierarchyMeaning &&
          <div>
            <span>{`(${hierarchyMeaning})`}</span>
            {
              isChild &&
              <sup>-1</sup>
            }
          </div>
        }
      </span>
    )
  }

  const onHierarchyViewToggle = event => {
    event.preventDefault()
    event.stopPropagation()
    setHierarchy(!hierarchy)
  }

  const noAssociations = isEmpty(conceptMappings) && isEmpty(childConcepts) && isEmpty(parentConcepts);

  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        className='light-gray-bg less-paded-accordian-header'
        expandIcon={<span />}
        aria-controls="panel1a-content"
      >
        <span className='flex-vertical-center' style={{width: '100%', justifyContent: 'space-between'}}>
          <TabCountLabel label='Associations' count={count} style={ACCORDIAN_HEADING_STYLES} />
          <span className='flex-vertical-center'>
            {
              !noAssociations &&
              <span>
                <Tooltip title={hierarchy ? 'Table Format' : 'Visualize'}>
                  <IconButton onClick={onHierarchyViewToggle} size='small' color={hierarchy ? 'primary' : 'default'}>
                    <HierarchyIcon fontSize='inherit' />
                  </IconButton>
                </Tooltip>
              </span>
            }
            <span className='flex-vertical-center' style={{marginLeft: '10px'}}>
              <Tooltip title='The Associations section lists hierarchy and mapping associations from the same source.'>
                <InfoIcon fontSize='small' color='action' />
              </Tooltip>
            </span>
          </span>
        </span>
      </AccordionSummary>
      <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
        {
        isLoadingMappings ?
        <div style={{textAlign: 'center', padding: '10px'}}>
          <CircularProgress />
        </div> : (
          noAssociations ?
          None() :
          (
            hierarchy ?
            <div className='col-xs-12' style={{padding: '10px'}}>
              <ConceptHierarchyTree concept={concept} fontSize='20' dx={80} hierarchyMeaning={hierarchyMeaning} />
            </div>:
            <Table size="small" aria-label="concept-home-mappings" className='nested-mappings'>
              <TableHead>
                <TableRow style={{backgroundColor: BLUE, color: WHITE}}>
                  <TableCell align='left' style={tbHeadCellStyles}><b>Relationship</b></TableCell>
                  <TableCell align='left' style={tbHeadCellStyles}><b>Code</b></TableCell>
                  <TableCell align='left' style={tbHeadCellStyles}><b>Name</b></TableCell>
                  <TableCell align='left' style={tbHeadCellStyles}><b>Source</b></TableCell>
                  <TableCell align='right' />
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  map(orderedMappings, (oMappings, mapType) => {
                    const key = generateRandomString()
                    const hasDirectMappings = !isEmpty(oMappings.direct)
                    return (
                      <React.Fragment key={key}>
                        {
                          hasDirectMappings &&
                          <ConceptHomeMappingsTableRows
                            mappings={oMappings.direct}
                            mapType={mapType}
                          />
                        }
                      </React.Fragment>
                    )
                  })
                }
                {
                  map(orderedMappings, (oMappings, mapType) => {
                    const key = generateRandomString()
                    const hasInDirectMappings = !isEmpty(oMappings.indirect)
                    return (
                      <React.Fragment key={key}>
                        {
                          hasInDirectMappings &&
                          <ConceptHomeMappingsTableRows
                            mappings={oMappings.indirect}
                            mapType={mapType}
                            isIndirect
                          />
                        }
                      </React.Fragment>
                    )
                  })
                }
                {
                  isLoadingChildren ?
                  <TableRow>
                    <TableCell colSpan={5} align='center'>
                      <CircularProgress />
                    </TableCell>
                  </TableRow> :
                  (
                    !isEmpty(childConcepts) &&
                    <ConceptHierarchyRow
                      source={source}
                      concepts={childConcepts}
                      mapType={hierarchyMapType(true)}
                    />
                  )
                }
                {
                  isLoadingParents ?
                  <TableRow>
                    <TableCell colSpan={5} align='center'>
                      <CircularProgress />
                    </TableCell>
                  </TableRow> :
                  (
                    !isEmpty(parentConcepts) &&
                    <ConceptHierarchyRow
                      source={source}
                      concepts={parentConcepts}
                      mapType={hierarchyMapType()}
                    />
                  )
                }
              </TableBody>
            </Table>
          )
        )
        }
      </AccordionDetails>
    </Accordion>
  )
}

export default HomeMappings;
