import React from 'react';
import {
  TableRow, TableCell, Chip, Tooltip
} from '@mui/material';
import { map, get, forEach, orderBy } from 'lodash';
import ExistsInOCLIcon from '../common/ExistsInOCLIcon';
import DoesnotExistsInOCLIcon from '../common/DoesnotExistsInOCLIcon';
import MappingOptions from './MappingOptions';
import { getSiteTitle, toParentURI } from '../../common/utils';

const SITE_TITLE = getSiteTitle()

const ConceptHomeMappingsTableRows = ({ concept, mappings, mapType, isIndirect }) => {
  const conceptCodeAttr = 'target_concept_code'
  const conceptCodeName = 'target_concept_name'
  const sourceAttr = 'target_source_name';

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

  const count = get(mappings, 'length') || 0

  const getOrderedMappings = () => {
    const parentURL = toParentURI(concept.url || concept.version_url)
    const sameParentMappings = []
    const differentParentMappings = []
    forEach(mappings, mapping => {
      if(mapping.target_concept_url && toParentURI(mapping.target_concept_url) === parentURL)
        sameParentMappings.push(mapping)
      else
        differentParentMappings.push(mapping)
    })
    return [...orderBy(sameParentMappings, 'target_concept_name'), ...orderBy(differentParentMappings, ['target_source_name', 'target_concept_name'])]
  }

  return (
    <React.Fragment>
      {
        mapType &&
        <TableRow hover>
          <TableCell align='left' rowSpan={count + 1} style={{paddingRight: '5px', verticalAlign: 'top', paddingTop: '7px'}}>
            <Tooltip title={isIndirect ? 'Inverse Mappings' : 'Direct Mappings'}>
              <Chip
                size='small'
                variant='outlined'
                color='default'
                label={
                  <span>
                    <span>{mapType}</span>
                    {isIndirect && <sup>-1</sup>}
                  </span>
                }
                style={{border: 'none'}}
              />
            </Tooltip>
          </TableCell>
        </TableRow>
      }
      {
        map(getOrderedMappings(), mapping => {
          const targetURL = get(mapping, 'target_concept_url')
          let title;
          if(targetURL)
            title = isIndirect ? `Source concept is defined in ${SITE_TITLE}` : `Target concept is defined in ${SITE_TITLE}`
          else
            title = isIndirect ? `Source concept is not defined in ${SITE_TITLE}` : `Target concept is not defined in ${SITE_TITLE}`
          const cursor = targetURL ? 'pointer' : 'not-allowed'
          return (
            <TableRow
              hover key={mapping.uuid} onClick={event => onDefaultClick(event, targetURL)} style={{cursor: cursor}} className={targetURL ? 'underline-text' : ''}>
              <TableCell align='left' className='ellipsis-text' style={{maxWidth: '200px'}}>
                <span className='flex-vertical-center' style={{paddingTop: '7px'}}>
                  <span className='flex-vertical-center' style={{marginRight: '4px'}}>
                    {
                      targetURL ?
                      <ExistsInOCLIcon title={title} /> :
                      <DoesnotExistsInOCLIcon title={title} />
                    }
                  </span>
                  <span>
                    { mapping[conceptCodeAttr] }
                  </span>
                </span>
              </TableCell>
              <TableCell align='left'>
                { getConceptName(mapping, conceptCodeName) }
              </TableCell>
              <TableCell align='left'>
                {get(mapping, sourceAttr)}
              </TableCell>
              <TableCell align='right' style={{width: '24px', paddingRight: '5px'}}>
                <MappingOptions mapping={mapping} />
              </TableCell>
            </TableRow>
          )
        })
      }
    </React.Fragment>
  )
}

export default ConceptHomeMappingsTableRows;
