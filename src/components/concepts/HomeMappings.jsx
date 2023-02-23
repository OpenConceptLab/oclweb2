import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, AccordionActions, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, Tooltip, IconButton,
  Button, Chip
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  QueryStats as HierarchyIcon,
  Add as AddIcon,
  WarningAmber as WarnIcon,
} from '@mui/icons-material'
import { get, isEmpty, forEach, map, find, compact, flatten, values, uniqBy } from 'lodash';
import { BLUE, WHITE } from '../../common/constants'
import { generateRandomString, dropVersion } from '../../common/utils'
import ConceptHomeMappingsTableRows from '../mappings/ConceptHomeMappingsTableRows';
import MappingInlineForm from '../mappings/MappingInlineForm';
import ConceptHierarchyRow from './ConceptHierarchyRow';
import TabCountLabel from '../common/TabCountLabel';
import ConceptCascadeVisualizeDialog from './ConceptCascadeVisualizeDialog';
import BetaLabel from '../common/BetaLabel'

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  width: '100%', padding: '0', overflowX: 'auto'
}

const None = () => {
  return <div style={{padding: '5px 15px', fontWeight: '300'}}>None</div>
}

const groupMappings = (orderedMappings, concept, mappings, forward) => {
  forEach(mappings, resource => {
    if(!(find(mappings, mapping => dropVersion(mapping.cascade_target_concept_url) === dropVersion(resource.url)))) {
      let mapType = resource.map_type
      const isMapping = Boolean(mapType)
      if(!mapType)
        mapType = forward ? 'children' : 'parent'
      orderedMappings[mapType] = orderedMappings[mapType] || {order: null, direct: [], indirect: [], unknown: [], hierarchy: [], reverseHierarchy: [], self: []}
      const isSelfMapping = isMapping && dropVersion(concept.url) === dropVersion(resource.cascade_target_concept_url)
      let _resource = isMapping ? {...resource, isSelf: isSelfMapping, cascade_target_concept_name: resource.cascade_target_concept_name || get(find(mappings, m => dropVersion(m.url) === dropVersion(resource.cascade_target_concept_url)), 'display_name')} : {...resource, cascade_target_concept_name: resource.display_name}
      if(isSelfMapping) {
        if(!map(orderedMappings[mapType].self, 'id').includes(resource.id))
          orderedMappings[mapType].self.push(_resource)
      } else {
        if(isMapping)
          forward ? orderedMappings[mapType].direct.push(_resource) : orderedMappings[mapType].indirect.push(_resource)
        else
          forward ? orderedMappings[mapType].hierarchy.push(_resource) : orderedMappings[mapType].reverseHierarchy.push(_resource)
      }
    }
  })
}

const DEFAULT_CASCADE_FILTERS = {
  mapTypes: undefined,
  excludeMapTypes: undefined,
  cascadeLevels: '*',
  cascadeHierarchy: true,
  cascadeMappings: true,
  reverse: false,
  returnMapTypes: undefined,
}

const HomeMappings = ({ source, concept, isLoadingMappings, sourceVersion, parent, onIncludeRetiredToggle, onCreateNewMapping, mappedSources, onRemoveMapping, onReactivateMapping, onUpdateMappingsSorting }) => {
  const [orderedMappings, setMappings] = React.useState({});
  const [updatedMappings, setUpdatedMappings] = React.useState([]);
  const [mappingForm, setMappingForm] = React.useState(false)
  const [hierarchy, setHierarchy] = React.useState(false);
  const [cascadeFilters, setCascadeFilters] = React.useState({...DEFAULT_CASCADE_FILTERS});
  const [includeRetired, setIncludeRetired] = React.useState(false)
  const conceptMappings = get(concept, 'mappings') || [];
  const reverseMappings = get(concept, 'reverseMappings') || [];
  const tbHeadCellStyles = {padding: '8px', color: WHITE}
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
                !isChild &&
                  <sup>-1</sup>
              }
            </div>
        }
      </span>
    )
  }
  const onCascadeFilterChange = (attr, value) => setCascadeFilters({...cascadeFilters, [attr]: value})
  const onFilterChange = newFilters => setCascadeFilters(newFilters)
  const onHierarchyViewToggle = event => {
    event.preventDefault()
    event.stopPropagation()
    setHierarchy(!hierarchy)
  }
  const onRetiredToggle = event => {
    event.preventDefault()
    event.stopPropagation()
    setIncludeRetired(!includeRetired)
    onIncludeRetiredToggle(!includeRetired)
  }
  const noAssociations = isEmpty(conceptMappings) && isEmpty(reverseMappings)
  const getMappings = () => {
    let _mappings = {}
    groupMappings(_mappings, concept, conceptMappings, true)
    groupMappings(_mappings, concept, reverseMappings, false)
    return _mappings
  }

  React.useEffect(() => setMappings(getMappings()), [concept])

  const getCount = () => flatten(compact(flatten(map(values(orderedMappings), mapping => values(mapping))))).length

  const _onCreateNewMapping = onCreateNewMapping ? (payload, targetConcept, isDirect) => onCreateNewMapping(payload, targetConcept, isDirect, () => setMappingForm(false)) : false

  const suggested = compact([{...source, suggestionType: 'Current Source'}, ...map(mappedSources, _source => ({..._source, suggestionType: 'Mapped Source'}))])

  const onSortEnd = _mappings => setUpdatedMappings(uniqBy([...updatedMappings, ..._mappings], 'version_url'))

  const onSortCancel = () => {
    setUpdatedMappings([])
    setMappings(getMappings())
  }

  const onSortSave = () => {
    onUpdateMappingsSorting(updatedMappings)
    const newMappings = {...orderedMappings}
    forEach(newMappings, data => {
      forEach([...data.direct, ...data.indirect, ...data.self], mapping => {
        const _mapping = find(updatedMappings, {version_url: mapping.version_url})
        mapping.sort_weight = _mapping?._sort_weight || mapping.sort_weight
        mapping._sort_weight = undefined
        mapping._initial_assigned_sort_weight = undefined
      })
    })
    setMappings(newMappings)
    setUpdatedMappings([])
  }

  return (
    <React.Fragment>
      <Accordion expanded style={{borderRadius: 'unset'}}>
        <AccordionSummary
          className='light-gray-bg less-paded-accordion-header'
          expandIcon={<span />}
          aria-controls="panel1a-content"
          style={{minHeight: '40px', height: '100%', cursor: 'inherit'}}
        >
          <span className='flex-vertical-center' style={{width: '100%', justifyContent: 'space-between'}}>
            <TabCountLabel label='Associations' count={getCount()} style={ACCORDIAN_HEADING_STYLES} />
            <span className='flex-vertical-center'>
              {
                !noAssociations &&
                  <React.Fragment>
                    <span style={{marginRight: '10px'}}>
                      <Tooltip title={includeRetired ? 'Exclude Retired' : 'Include Retired'} placement='top'>
                        <Chip variant={includeRetired ? 'contained' : 'outlined'} style={{textTransform: 'none'}} onClick={onRetiredToggle} size='small' color='primary' label={includeRetired ? 'Exclude Retired' : 'Include Retired'} />
                      </Tooltip>
                    </span>
                    <span>
                      <Tooltip title={<BetaLabel label='Visualize' />}>
                        <IconButton onClick={onHierarchyViewToggle} size='small' color={hierarchy ? 'primary' : 'default'}>
                          <HierarchyIcon fontSize='inherit' />
                        </IconButton>
                      </Tooltip>
                    </span>
                  </React.Fragment>
              }
              <span className='flex-vertical-center' style={{marginLeft: '10px'}}>
                <Tooltip title='The Associations section lists hierarchy and mapping associations from the same source.'>
                  <InfoIcon fontSize='small' color='action' />
                </Tooltip>
              </span>
            </span>
          </span>
        </AccordionSummary>
        <AccordionDetails style={{...ACCORDIAN_DETAILS_STYLES, maxHeight: '450px', overflow: 'auto'}}>
          {
            isLoadingMappings ?
              <div style={{textAlign: 'center', padding: '10px'}}>
                <CircularProgress />
              </div> :
            <div>
              {
                noAssociations && !mappingForm ?
                  None() :
                  <Table size="small" aria-label="concept-home-mappings" className='nested-mappings'>
                    {
                      !noAssociations &&
                        <TableHead>
                          <TableRow style={{backgroundColor: BLUE, color: WHITE}}>
                            <TableCell align='left' style={{...tbHeadCellStyles, width: '10%'}}><b>Relationship</b></TableCell>
                            <TableCell align='left' style={{...tbHeadCellStyles, width: '30%'}}><b>Code</b></TableCell>
                            <TableCell align='left' style={{...tbHeadCellStyles, width: '35%'}}><b>Name</b></TableCell>
                            <TableCell align='left' style={{...tbHeadCellStyles, width: '20%'}}><b>Source</b></TableCell>
                            <TableCell align='right' style={{width: '5%'}}/>
                          </TableRow>
                        </TableHead>
                    }
                    <TableBody>
                      {
                        map(orderedMappings, (oMappings, mapType) => {
                          const key = generateRandomString()
                          const hasSelfMappings = !isEmpty(oMappings.self)
                          return (
                            <React.Fragment key={key}>
                              {
                                hasSelfMappings &&
                                  <ConceptHomeMappingsTableRows
                                    concept={concept}
                                    mappings={oMappings.self}
                                    mapType={mapType}
                                    isSelf
                                    onCreateNewMapping={_onCreateNewMapping}
                                    onRemoveMapping={onRemoveMapping}
                                    onReactivateMapping={onReactivateMapping}
                                    suggested={suggested}
                                    onSortEnd={onSortEnd}
                                  />
                              }
                            </React.Fragment>
                          )
                        })
                      }
                      {
                        !isEmpty(get(orderedMappings, `children.hierarchy`)) &&
                          <ConceptHierarchyRow
                            source={source}
                            concepts={get(orderedMappings, `children.hierarchy`)}
                            mapType={hierarchyMapType(true)}
                          />
                      }
                      {
                        !isEmpty(get(orderedMappings, `parent.reverseHierarchy`)) &&
                          <ConceptHierarchyRow
                            source={source}
                            concepts={get(orderedMappings, `parent.reverseHierarchy`)}
                            mapType={hierarchyMapType(false)}
                          />
                      }
                      {
                        map(orderedMappings, (oMappings, mapType) => {
                          const key = generateRandomString()
                          const hasDirectMappings = !isEmpty(oMappings.direct)
                          return (
                            <React.Fragment key={key}>
                              {
                                hasDirectMappings &&
                                  <ConceptHomeMappingsTableRows
                                    concept={concept}
                                    mappings={oMappings.direct}
                                    mapType={mapType}
                                    onCreateNewMapping={_onCreateNewMapping}
                                    onRemoveMapping={onRemoveMapping}
                                    onReactivateMapping={onReactivateMapping}
                                    suggested={suggested}
                                    onSortEnd={onSortEnd}
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
                                    concept={concept}
                                    mappings={oMappings.indirect}
                                    mapType={mapType}
                                    isIndirect
                                    onCreateNewMapping={_onCreateNewMapping}
                                    onRemoveMapping={onRemoveMapping}
                                    onReactivateMapping={onReactivateMapping}
                                    suggested={suggested}
                                  />
                              }
                            </React.Fragment>
                          )
                        })
                      }
                      {
                        mappingForm &&
                          <TableRow>
                            <TableCell colSpan={5}>
                              <MappingInlineForm
                                concept={concept}
                                onClose={() => setMappingForm(false)}
                                isDirect
                                onSubmit={_onCreateNewMapping}
                                suggested={suggested}
                              />
                            </TableCell>
                          </TableRow>
                      }
                    </TableBody>
                  </Table>
              }

            </div>
          }
        </AccordionDetails>
        <AccordionActions style={{padding: 0}}>
          {
            onCreateNewMapping && !mappingForm && isEmpty(updatedMappings) &&
              <div className='col-xs-12' style={{padding: '0 5px'}}>
                <Button endIcon={<AddIcon fontSize='inherit'/>} size='small' style={{fontWeight: 600}} onClick={() => setMappingForm(true)}>
                  Add New Mapping
                </Button>
              </div>
          }
          {
            onCreateNewMapping && !isEmpty(updatedMappings) &&
              <div className='col-xs-12 flex-vertical-center' style={{padding: '10px', backgroundColor: BLUE, color: WHITE}}>
                <WarnIcon size='small' style={{marginRight: '10px'}} />
                {updatedMappings.length} change(s) made. Saving will create a new Mapping Version.

                <Button size='small' color='primary' variant='text' style={{marginLeft: '5px', boxShadow: 'none', color: 'rgba(255, 255, 255, 0.7)'}} onClick={onSortCancel}>
                  Undo
                </Button>
                <Button size='small' color='primary' variant='text' style={{color: WHITE}} onClick={onSortSave}>
                  Save
                </Button>
              </div>
          }
        </AccordionActions>
      </Accordion>
      {
        !noAssociations && hierarchy &&
          <ConceptCascadeVisualizeDialog
            open
            onClose={onHierarchyViewToggle}
            concept={concept}
            source={source}
            sourceVersion={sourceVersion}
            filters={cascadeFilters}
            onCascadeFilterChange={onCascadeFilterChange}
            onFilterChange={onFilterChange}
            hierarchyMeaning={hierarchyMeaning}
            parent={parent}
          />
      }
    </React.Fragment>
  )
}

export default HomeMappings;
