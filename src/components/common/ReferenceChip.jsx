import React from 'react';
import { Link } from 'react-router-dom';
import { Chip } from '@mui/material';
import {
  LocalOffer as LocalOfferIcon, Link as LinkIcon
} from '@mui/icons-material';

const ReferenceChip = props => {
  const isResolved = Boolean(props.last_resolved_at)
  const type = props.reference_type;
  const expression = isResolved ? props.expression : `${props.expression} (unresolved)`;
  let icon = <span />;
  if(type && type.toLowerCase() === 'mappings')
    icon = <LinkIcon fontSize="small" />;
  else if(type && type.toLowerCase() === 'concepts')
    icon = <LocalOfferIcon fontSize='small' color='primary' />;

  const chip = <Chip className={isResolved ? 'clickable' : ''} icon={icon} label={expression} variant='outlined' color={isResolved ? 'primary' : 'secondary'} style={{border: 'none'}} />

  return (
  <React.Fragment>
    {
      isResolved ?
      <Link to={expression}>
        {chip}
      </Link> :
      chip
    }
  </React.Fragment>
  )
}

export default ReferenceChip;
