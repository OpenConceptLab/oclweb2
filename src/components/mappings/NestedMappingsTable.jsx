import React from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton, Tooltip
} from '@material-ui/core';
import {
  Search as SearchIcon,
} from '@material-ui/icons';
import { map, isEmpty, get } from 'lodash';
import ExistsInOCLIcon from '../common/ExistsInOCLIcon';
import DoesnotExistsInOCLIcon from '../common/DoesnotExistsInOCLIcon';

const NestedMappingsTable = ({ mappings, isIndirect }) => {
  const conceptCodeAttr = isIndirect ? 'from_concept_code' : 'to_concept_code';
  const conceptCodeName = isIndirect ? 'from_concept_name' : 'to_concept_name';
  const ownerAttr = isIndirect ? 'from_source_owner' : 'to_source_owner';
  const sourceAttr = isIndirect ? 'from_source_name' : 'to_source_name';

  const onRowClick = (event, mapping) => {
    event.stopPropagation()
    event.preventDefault()
    if(mapping.url)
      window.location.hash = mapping.url
  }

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
    <Table size="small" aria-label="nested-mappings" className='nested-mappings'>
      <TableHead>
        <TableRow>
          <TableCell align='left' style={{padding: '8px'}}><b>Relationship</b></TableCell>
          <TableCell align='left' style={{padding: '8px'}}><b>Source</b></TableCell>
          <TableCell align='left' style={{padding: '8px'}}><b>Code</b></TableCell>
          <TableCell align='left' style={{padding: '8px'}}><b>Name</b></TableCell>
          <TableCell align='left' />
        </TableRow>
      </TableHead>
      <TableBody>
        {
          isEmpty(mappings) ?
          <TableRow colSpan='5'>
            <TableCell colSpan='5'>
              None
            </TableCell>
          </TableRow> :
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
                <TableCell align='left'>
                  <Chip
                    size='small'
                    variant='outlined'
                    color='default'
                    icon={
                      targetURL ?
                          <ExistsInOCLIcon title={title} /> :
                          <DoesnotExistsInOCLIcon title={title} />
                    }
                    label={mapping.map_type}
                    style={{border: 'none', cursor: cursor}}
                  />
                </TableCell>
                <TableCell align='left'>
                  { `${get(mapping, ownerAttr)} / ${get(mapping, sourceAttr)}` }
                </TableCell>
                <TableCell align='left' className='ellipsis-text' style={{maxWidth: '200px'}}>
                  { mapping[conceptCodeAttr] }
                </TableCell>
                <TableCell align='left'>
                  { getConceptName(mapping, conceptCodeName) }
                </TableCell>
                <TableCell align='left'>
                  <Tooltip arrow title='View mapping details'>
                    <IconButton color='primary' onClick={event => onRowClick(event, mapping)}>
                      <SearchIcon fontSize='inherit' />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )
          })
        }
      </TableBody>
    </Table>
  )
}

export default NestedMappingsTable;
