import React from 'react';
import {
  TableRow, TableCell, Chip, Tooltip, Table, TableBody
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  ImportExport as SortIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { map, get, forEach, orderBy, filter, find, isNumber } from 'lodash';
import ExistsInOCLIcon from '../common/ExistsInOCLIcon';
import DoesnotExistsInOCLIcon from '../common/DoesnotExistsInOCLIcon';
import MappingOptions from './MappingOptions';
import { getSiteTitle, toParentURI } from '../../common/utils';
import { WHITE } from '../../common/constants';
import MappingInlineForm from './MappingInlineForm';

const SITE_TITLE = getSiteTitle()

const ConceptHomeMappingsTableRows = ({ concept, mappings, mapType, isIndirect, isSelf, onCreateNewMapping, suggested, onRemoveMapping, onReactivateMapping, onSortEnd }) => {
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
    const parentURL = toParentURI(concept.url || concept.version_url)
    const sameParentMappings = []
    const differentParentMappings = []
    forEach(mappings, mapping => {
      if(mapping.cascade_target_concept_url && toParentURI(mapping.cascade_target_concept_url) === parentURL)
        sameParentMappings.push(mapping)
      else
        differentParentMappings.push(mapping)
    })
    let _mappings = orderBy([...sameParentMappings, ...differentParentMappings], ['sort_weight', 'cascade_target_source_name', 'cascade_target_concept_name'])
    return orderBy(map(_mappings, (mapping, index) => {
      mapping._sort_weight = mapping._sort_weight || mapping.sort_weight || index
      mapping._initial_assigned_sort_weight = mapping._initial_assigned_sort_weight || mapping.sort_weight || index
      return mapping
    }), ['_sort_weight', 'cascade_target_source_name', 'cascade_target_concept_name'])
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

    let prevMappingFromTargetPosition = newMappings[to-1]
    let nextMappingFromTargetPosition = newMappings[to+1]
    const prevMappingWeight = prevMappingFromTargetPosition?._sort_weight || 0
    const nextMappingWeight = nextMappingFromTargetPosition?._sort_weight || prevMappingWeight + 1

    mapping._sort_weight = getRandomDecimal(prevMappingWeight, nextMappingWeight)
    if(prevMappingFromTargetPosition?._sort_weight >= mapping._sort_weight)
      prevMappingFromTargetPosition._sort_weight = formatNumber(mapping._sort_weight - 0.0001)
    if(nextMappingFromTargetPosition?._sort_weight <= mapping._sort_weight)
      nextMappingFromTargetPosition._sort_weight = formatNumber(mapping._sort_weight + 0.0001)

    const _mappings = orderBy(newMappings, ['_sort_weight', 'cascade_target_source_name', 'cascade_target_concept_name'])
    onSortEnd(filter(_mappings, mapping => mapping._sort_weight !== mapping._initial_assigned_sort_weight))
    setMappings(_mappings)
  }

  const onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if(result.source.index !== result.destination.index)
      reorderMappings(result.source.index, result.destination.index)
  }

  React.useEffect(() => setMappings(getOrderedMappings()), [mappings])

  const hasAnyCustomSortMapping = oMappings.length > 1 && Boolean(find(oMappings, mapping => isNumber(mapping.sort_weight)))

  return (
    <React.Fragment>
      <TableRow>
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
            hasAnyCustomSortMapping &&
              <Tooltip title='Custom sorting has been applied'>
                  <SortIcon fontSize="small" style={{color: 'rgba(0, 0, 0, 0.54)'}} />
              </Tooltip>
          }
            </span>
        </TableCell>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <TableCell
                {...provided.droppableProps}
                ref={provided.innerRef}
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
                    const bgColor = isUpdated ? 'rgba(51, 115, 170, 0.2)' : WHITE
                    const canAct = Boolean(onCreateNewMapping)
                    const canSort = Boolean(onSortEnd)
                    const cursor = (targetURL || canSort) ? 'pointer' : 'not-allowed'
                    const isLast = index == oMappings.length - 1
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
                                <TableCell align='left' className='ellipsis-text' style={{width: '27%', borderBottom: isLast ? 'none' : '1px solid rgba(224, 224, 224, 1)', backgroundColor: bgColor}}>
                                  <span className='flex-vertical-center' style={{paddingTop: '7px'}}>
                                    {
                                      canSort &&
                                        <span className='flex-vertical-center' style={{marginRight: '4px'}} {...provided.dragHandleProps}>
                                          <DragIcon fontSize='small' style={{color: 'rgba(0, 0, 0, 0.54)'}} />
                                        </span>
                                    }
                                    <span className='flex-vertical-center' style={{marginRight: '4px'}}>
                                      {
                                        targetURL ?
                                          <ExistsInOCLIcon title={title} /> :
                                        <DoesnotExistsInOCLIcon title={title} />
                                      }
                                    </span>
                                    <span className={mapping.retired ? 'retired' : ''}>
                                      { mapping[conceptCodeAttr] }
                                    </span>
                                  </span>
                                </TableCell>
                                <TableCell align='left' style={{borderBottom: isLast ? 'none' : '1px solid rgba(224, 224, 224, 1)', width: '30%', backgroundColor: bgColor}}>
                                  { getConceptName(mapping, conceptCodeName) }
                                </TableCell>
                                <TableCell align='left' style={{borderBottom: isLast ? 'none' : '1px solid rgba(224, 224, 224, 1)', width: '20%', backgroundColor: bgColor}}>
                                  {get(mapping, sourceAttr)}
                                </TableCell>
                                <TableCell align='right' style={{paddingRight: '5px', borderBottom: isLast ? 'none' : '1px solid rgba(224, 224, 224, 1)', width: '5%', backgroundColor: bgColor}}>
                                  <MappingOptions
                                    mapping={mapping}
                                    concept={concept}
                                    onAddNewClick={onAddNewClick}
                                    onRemove={onRemoveClick}
                                    onReactivate={onReactivateClick}
                                    showNewMappingOption={canAct}
                                    isIndirect={isIndirect}
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
