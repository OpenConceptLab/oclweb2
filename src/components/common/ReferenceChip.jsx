import React from 'react';
import { Link } from 'react-router-dom';
import { Chip } from '@material-ui/core';
import {
  LocalOffer as LocalOfferIcon, Link as LinkIcon
} from '@material-ui/icons';

const ReferenceChip = props => {
  const type = props.reference_type;
  const expression = props.expression;
  const icon = type.toLowerCase() === 'mappings' ?
               <LinkIcon fontSize='small' color='primary' /> :
               <LocalOfferIcon fontSize='small' color='primary' />;

  return (
    <Link to={expression}>
      <Chip className='clickable' icon={icon} label={expression} variant='outlined' color='primary' style={{border: 'none'}} />
    </Link>
  )
}

export default ReferenceChip;
