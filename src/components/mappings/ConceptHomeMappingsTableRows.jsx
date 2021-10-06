import React from 'react';
import {
  TableRow, TableCell, Chip, Tooltip
} from '@material-ui/core';
import { map, get } from 'lodash';
import ExistsInOCLIcon from '../common/ExistsInOCLIcon';
import DoesnotExistsInOCLIcon from '../common/DoesnotExistsInOCLIcon';
import MappingOptions from './MappingOptions';

const ConceptHomeMappingsTableRows = ({ mapType, mappings, isIndirect }) => {
  const conceptCodeAttr = isIndirect ? 'from_concept_code' : 'to_concept_code';
  const conceptCodeName = isIndirect ? 'from_concept_name' : 'to_concept_name';
  const sourceAttr = isIndirect ? 'from_source_name' : 'to_source_name';

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

  return (
    <React.Fragment>
      {
        mapType &&
        <TableRow hover>
          <TableCell align='left' rowSpan={mappings.length + 1} style={{paddingRight: '5px', verticalAlign: 'top', paddingTop: '7px'}}>
            <Tooltip title={isIndirect ? 'Inverse Mappings' : 'Direct Mappings'}>
              <Chip
                size='small'
                variant='outlined'
                color='default'
                label={
                  isIndirect ?
                       <span><span>{mapType}</span><sup>-1</sup></span>:
                       mapType
                }
                style={{border: 'none'}}
              />
            </Tooltip>
          </TableCell>
        </TableRow>
      }
      {
        map(mappings, mapping => {
          const targetURL = isIndirect ? get(mapping, 'from_concept_url') : get(mapping, 'to_concept_url');
          let title;
          if(targetURL)
            title = isIndirect ? 'Source concept is defined in OCL' : 'Target concept is defined in OCL'
          else
            title = isIndirect ? 'Source concept is not defined in OCL' : 'Target concept is not defined in OCL'
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
