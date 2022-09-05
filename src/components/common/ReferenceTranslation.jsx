import React from 'react';
import { Chip } from '@mui/material';
import {
  LocalOffer as LocalOfferIcon, Link as LinkIcon,
} from '@mui/icons-material';
import { toFullAPIURL, copyURL } from '../../common/utils';

const ReferenceTranslation = props => {
  const isReference = !props.notReference
  const isResolved = Boolean(props.last_resolved_at)
  const type = props.reference_type;
  const expression = isResolved ? props.translation : `${props.translation} (unresolved)`;
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
                 classes={{label: 'chip-label-wrapped'}}
               />
  return (
    <span style={{display: 'flex'}}>
      <a href={toFullAPIURL(props.uri)} target='_blank' rel='noopener noreferrer'>
        {chip}
      </a>
      {
        isReference &&
          <Chip size='small' color='primary' variant='outlined' label='copy expression' onClick={() => copyURL(toFullAPIURL(props.expression))} style={{marginLeft: '5px'}} />

      }
    </span>
  )
}

export default ReferenceTranslation;
