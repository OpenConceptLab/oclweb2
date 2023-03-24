import React from 'react';
import {
  TableRow, TableCell, Chip, Tooltip, Table, TableBody, Badge
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  ImportExport as SortIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  WarningAmber as WarningIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { map, get, forEach, orderBy, filter, find, isNumber, has, isEmpty, some, maxBy } from 'lodash';
import MappingOptions from './MappingOptions';
import { getSiteTitle, toParentURI, getSiblings } from '../../common/utils';
import MappingInlineForm from './MappingInlineForm';

const SITE_TITLE = getSiteTitle()
const DEFAULT_ORDER_BY = ['sort_weight', 'cascade_target_source_name', 'cascade_target_concept_name']
const ORDER_BY = ['_sort_weight', 'cascade_target_source_name', 'cascade_target_concept_name']

const order = (mappings, is_default) => orderBy(mappings, is_default ? DEFAULT_ORDER_BY : ORDER_BY)

const ConceptHomeMappingsTableRows = ({ concept, mappings, mapType, isIndirect, isSelf, onCreateNewMapping, suggested, onRemoveMapping, onReactivateMapping, onSortEnd, onClearSortWeight, onAssignSortWeight }) => {
  const [oMappings, setMappings] = React.useState([])
  const [form, setForm] = React.useState(false)
  const [addNewMapType, setAddNewMapType] = React.useState('')
  const conceptCodeAttr = 'cascade_target_concept_code'
  const conceptCodeName = 'cascade_target_concept_name'
  const sourceAttr = 'cascade_target_source_name';

  const onDefaultClick = (event, targetURL) => {
    event.stopPropagation()
    event.preventDefault()

    if(targetURL)
      window.location.hash = targetURL
  }

  const getConceptName = (mapping, attr) => {
    let name = get(mapping, attr) || get(mapping, `${attr}_resolved`);
    if(name) return name;
    return get(mapping, `${attr.split('_name')[0]}.display_name`)
  }

  const getOrderedMappings = () => {
    if(find(mappings, _mapping => has(_mapping, '_sort_weight')) && !some(mappings, _mapping => _mapping._sort_weight === undefined))
      return order(mappings)
    const parentURL = toParentURI(concept.url || concept.version_url)
    const sameParentMappings = []
    const differentParentMappings = []
    forEach(mappings, mapping => {
      if(mapping.cascade_target_concept_url && toParentURI(mapping.cascade_target_concept_url) === parentURL)
        sameParentMappings.push(mapping)
      else
        differentParentMappings.push(mapping)
    })
    const allMappings = [...sameParentMappings, ...differentParentMappings]
    let _mappings = order(allMappings, true)
    let prevMapping;
    return order(map(_mappings, (mapping, index) => {
      mapping._sort_weight = mapping._sort_weight || mapping.sort_weight
      mapping._initial_assigned_sort_weight = mapping._initial_assigned_sort_weight || mapping.sort_weight
      if(!isNumber(mapping._sort_weight)) {
        const newWeight = isNumber(prevMapping?._sort_weight) ? prevMapping._sort_weight + 1 : index
        mapping._sort_weight = newWeight
        mapping._initial_assigned_sort_weight = newWeight
      }
      mapping._original_position = mapping._original_position || index
      prevMapping = mapping
      return mapping
    }))
  }

  const onAddNewClick = mapType => {
    setAddNewMapType(mapType)
    setForm(true)
    return false
  }

  const onRemoveClick = mapping => onRemoveMapping(mapping, !isIndirect)
  const onReactivateClick = mapping => onReactivateMapping(mapping, !isIndirect)

  const getRandomDecimal = (min, max) => {
    const range = max - min;
    const randomDecimal = (Math.random() * range) + min;

    // Round the random decimal number to 5 decimal places.
    const roundedDecimal = formatNumber(randomDecimal)

    // If the rounded decimal number is less than min or greater than max, call the function recursively until a valid number is found.
    if (roundedDecimal < min || roundedDecimal > max)
      return getRandomDecimal(min, max);

    return roundedDecimal;
  }

  const formatNumber = num => Number(num.toFixed(5))

  const reorderMappings = (from, to) => {
    let newMappings = [...oMappings]
    const mapping = newMappings[from]
    newMappings.splice(from, 1);
    const beforeObjects = newMappings.slice(0, to);
    const afterObjects = newMappings.slice(to);
    newMappings = [...beforeObjects, mapping, ...afterObjects]
    newMappings = forEach(newMappings, (_mapping, index) => {
      _mapping._sort_weight = index
    })

    const _mappings = order(newMappings)
    setMappings(_mappings)
    return _mappings
  }

  const onDragEnd = result => {
    updateSiblings(false)

    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if(result.source.index !== result.destination.index) {
      const newMappings = reorderMappings(result.source.index, result.destination.index)
      if(find(newMappings, mapping => mapping.sort_weight !== mapping._sort_weight && mapping._sort_weight !== mapping._initial_assigned_sort_weight))
        onSortEnd(newMappings)
      else
        onSortEnd([])
    }
  }


  const onDragStart = () => updateSiblings(true)

  const updateSiblings = disable => {
    const thisRow = document.getElementById(mapType)
    if(thisRow) {
      const siblings = getSiblings(thisRow) || []
      siblings.forEach(
        sibling => disable ?
          sibling.classList.add('droppable-disabled') :
          sibling.classList.remove('droppable-disabled')
      )
    }
  }

  React.useEffect(() => isEmpty(oMappings) && setMappings(getOrderedMappings()), [mappings])

  const mappingsWithSortWeightCount = oMappings.length > 1 ? filter(oMappings, mapping => isNumber(mapping.sort_weight)).length : 0
  const allMappingsHaveSortWeight = oMappings.length === mappingsWithSortWeightCount
  const isAnyUpdatedButUnsaved = find(oMappings, mapping => mapping._sort_weight !== mapping._initial_assigned_sort_weight)

  const getBadgeProps = (mapping, index) => {
    const isUpdated = mapping._sort_weight !== mapping._initial_assigned_sort_weight
    const isMovedUp = Boolean(isUpdated && index < mapping._original_position)
    const isMovedDown = Boolean(isUpdated && index > mapping._original_position)
    const badgeIcon = isMovedUp ? <UpIcon style={{fontSize: '10px'}} color='success' /> : (isMovedDown ? <DownIcon style={{fontSize: '10px'}} color='error' /> : 0)
    let badgeProps = {anchorOrigin: {horizontal: 'left', vertical: 'top'}}
    if(isMovedDown || isMovedUp)
      badgeProps = {...badgeProps, badgeContent: badgeIcon, style: {background: 'transparent'}}

    return badgeProps
  }

  const tooltipTitle = allMappingsHaveSortWeight ? 'Custom sorting has been applied' : (mappingsWithSortWeightCount ? `Custom sorting has been applied to ${mappingsWithSortWeightCount} mappings.` : undefined)

  const _onAssignSortWeight = mapping => {
    let maxSortWeight = maxBy(oMappings, 'sort_weight')?.sort_weight
    maxSortWeight = isNumber(maxSortWeight) ? maxSortWeight + 1 : 0
    onAssignSortWeight(mapping, maxSortWeight)
  }

  return (
    <React.Fragment>
      <TableRow id={mapType}>
        <TableCell rowSpan={form ? 2 : 1} align='left' style={{paddingRight: '5px', verticalAlign: 'top', paddingTop: '7px', width: '10%'}}>
          <span className='flex-vertical-center'>
            <Tooltip placement='left' title={isIndirect ? 'Inverse Mappings' : (isSelf ? 'Self Mapping' : 'Direct Mappings')}>
              <Chip
                size='small'
                variant='outlined'
                color='default'
                label={
                  <span>
                    <span>{mapType}</span>
                    {isIndirect && <sup>-1</sup>}
                    {isSelf && <sup>∞</sup>}
                  </span>
                }
                style={{border: 'none'}}
              />
            </Tooltip>
            {
              tooltipTitle &&
                <Tooltip title={tooltipTitle}>
                  <Badge color="warning" badgeContent={allMappingsHaveSortWeight ? undefined : mappingsWithSortWeightCount}>
                    <SortIcon fontSize="small" style={{color: 'rgba(0, 0, 0, 0.54)'}} />
                  </Badge>
                </Tooltip>
            }
          </span>
        </TableCell>
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <TableCell
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{paddingLeft: '0px'}}
                colSpan={4}>
                {
                  map(oMappings, (mapping, index) => {
                    const targetURL = get(mapping, 'cascade_target_concept_url')
                    let title;
                    if(targetURL)
                      title = isIndirect ? `Source concept is defined in ${SITE_TITLE}` : `Target concept is defined in ${SITE_TITLE}`
                    else
                      title = isIndirect ? `Source concept is not defined in ${SITE_TITLE}` : `Target concept is not defined in ${SITE_TITLE}`
                    const isUpdated = mapping._sort_weight !== mapping._initial_assigned_sort_weight
                    const bgColor = isUpdated ? 'rgba(51, 115, 170, 0.2)' : 'inherit'
                    const canAct = Boolean(onCreateNewMapping)
                    const canSort = Boolean(onSortEnd) && oMappings.length > 1
                    const cursor = (targetURL || canSort) ? 'pointer' : 'not-allowed'
                    const isLast = index == oMappings.length - 1
                    const badgeProps = getBadgeProps(mapping, index)
                    return (
                      <Draggable key={mapping.url} draggableId={mapping.url} index={index} isDragDisabled={!canSort}>
                        {(provided) => (
                          <Table
                            key={mapping.url}
                            style={{width: '100%'}}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <TableBody>
                              <TableRow
                                hover key={mapping.url} onClick={event => onDefaultClick(event, targetURL)} style={{cursor: cursor}} className={targetURL ? 'underline-text' : ''}>
                                <TableCell align='left' className='ellipsis-text' style={{width: '30%', borderBottom: isLast ? 'none' : '1px solid rgba(224, 224, 224, 1)', backgroundColor: bgColor}}>
                                  <span className='flex-vertical-center' style={{paddingTop: '7px'}}>
                                    {
                                      canSort &&
                                        <span className='flex-vertical-center' style={{marginRight: '4px'}} {...provided.dragHandleProps}>
                                          <Badge {...badgeProps}>
                                            <DragIcon fontSize='small' style={{color: 'rgba(0, 0, 0, 0.54)'}} />
                                          </Badge>
                                        </span>
                                    }
                                    {
                                      Boolean(canSort && !isNumber(mapping.sort_weight) && !isUpdated && mappingsWithSortWeightCount) &&
                                        <span className='flex-vertical-center' style={{marginRight: '4px'}}>
                                          <Tooltip title='Mapping has no sort weight applied'>
                                            <WarningIcon fontSize='small' />
                                          </Tooltip>
                                        </span>
                                    }
                                    <span className='flex-vertical-center' style={{marginRight: '4px'}}>
                                      <Tooltip title={title}>
                                        <LocalOfferIcon
                                          color={targetURL ? 'primary': 'warning'}
                                          fontSize='small'
                                          style={{width: '12pt'}}
                                        />

                                        </Tooltip>
                                    </span>
                                    <span className={mapping.retired ? 'retired' : ''}>
                                      { mapping[conceptCodeAttr] }
                                    </span>
                                  </span>
                                </TableCell>
                                <TableCell align='left' style={{borderBottom: isLast ? 'none' : '1px solid rgba(224, 224, 224, 1)', width: '35%', backgroundColor: bgColor}}>
                                  { getConceptName(mapping, conceptCodeName) }
                                </TableCell>
                                <TableCell align='left' style={{borderBottom: isLast ? 'none' : '1px solid rgba(224, 224, 224, 1)', width: '20%', backgroundColor: bgColor}}>
                                  {get(mapping, sourceAttr)}
                                </TableCell>
                                <TableCell align='right' style={{padding: '0px', borderBottom: isLast ? 'none' : '1px solid rgba(224, 224, 224, 1)', width: '5%', backgroundColor: bgColor}}>
                                  <MappingOptions
                                    mapping={mapping}
                                    concept={concept}
                                    onAddNewClick={onAddNewClick}
                                    onRemove={onRemoveClick}
                                    onReactivate={onReactivateClick}
                                    showNewMappingOption={canAct}
                                    isIndirect={isIndirect}
                                    canSort={canSort}
                                    onClearSortWeight={onClearSortWeight}
                                    onAssignSortWeight={_onAssignSortWeight}
                                    disabled={isAnyUpdatedButUnsaved}
                                  />
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        )}
                      </Draggable>
                    )
                  })
                }
                {provided.placeholder}
              </TableCell>
            )}
          </Droppable>
        </DragDropContext>
      </TableRow>
      {
        form &&
          <TableRow>
            <TableCell colSpan={4}>
              <MappingInlineForm
                defaultMapType={addNewMapType}
                concept={concept}
                onClose={() => setForm(false)}
                isDirect={!isIndirect}
                onSubmit={onCreateNewMapping}
                suggested={suggested}
              />
            </TableCell>
          </TableRow>
      }
    </React.Fragment>
  )
}

export default ConceptHomeMappingsTableRows;
