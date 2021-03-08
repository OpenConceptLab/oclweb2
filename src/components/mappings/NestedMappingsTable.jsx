import React from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, Chip, Tooltip, IconButton,
} from '@material-ui/core';
import {
  ArrowForward as ForwardIcon, Search as SearchIcon
} from '@material-ui/icons';
import { map, isEmpty, get } from 'lodash';

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

  const onDefaultClick = (event, mapping) => {
    event.stopPropagation()
    event.preventDefault()
    if(isIndirect && mapping.from_concept_url)
      window.location.hash = mapping.from_concept_url
    if(!isIndirect && mapping.to_concept_url)
      window.location.hash = mapping.to_concept_url
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
          map(mappings, mapping => (
            <TableRow hover key={mapping.uuid} onClick={event => onDefaultClick(event, mapping)} style={{cursor: 'pointer'}}>
              <TableCell align='left'>
                {
                  mapping.external_id ?
                  <Tooltip placement='top-start' title='External Mapping'>
                    <Chip
                      size='small'
                      variant='outlined'
                      color='default'
                      icon={
                        <ForwardIcon
                          fontSize='small'
                                    color='inherit'
                                    style={{
                                      border: '1px solid', borderRadius: '10px',
                                      background: 'black', color: 'white',
                                      margin: '0px'
                                    }}
                        />
                      }
                      label={mapping.map_type}
                      style={{border: 'none'}}
                    />
                  </Tooltip> :
                  <Chip
                    size='small'
                    variant='outlined'
                    color='default'
                    style={{border: 'none'}}
                    label={mapping.map_type}
                  />
                }
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
                <IconButton color='primary' onClick={event => onRowClick(event, mapping)}>
                  <SearchIcon fontSize='inherit' />
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}

export default NestedMappingsTable;
