import React from 'react';
import { Chip } from '@mui/material';
import {
  LocalOffer as LocalOfferIcon, Link as LinkIcon,
} from '@mui/icons-material';
import { toFullAPIURL, copyURL } from '../../common/utils';

const ReferenceChip = props => {
  const isReference = !props.notReference
  const isResolved = Boolean(props.last_resolved_at)
  const type = props.reference_type;
  const expression = isResolved ? props.expression : `${props.expression} (unresolved)`;
  let icon = <span />;
  if(type && type.toLowerCase() === 'mappings')
    icon = <LinkIcon fontSize="small" />;
  else if(type && type.toLowerCase() === 'concepts')
    icon = <LocalOfferIcon fontSize='small' color='primary' />;

  const chip = <Chip
                 className='clickable'
                 icon={icon}
                 label={expression}
                 variant='outlined'
                 color='primary'
                 style={{border: 'none'}}
               />
  return (
    <span>
      <a href={toFullAPIURL(props.uri)} target='_blank' rel='noopener noreferrer'>
        {chip}
      </a>
      {
        isReference && (
          props.include ?
            <Chip size='small' variant='outlined' color='success' label='include' /> :
            <Chip size='small' variant='outlined' color='error' label='exclude' />
        )
      }
      {
        isReference &&
          <Chip size='small' color='primary' variant='outlined' label='copy expression' onClick={() => copyURL(toFullAPIURL(props.expression))} style={{marginLeft: '5px'}} />

      }
    </span>
  )
}

export default ReferenceChip;
