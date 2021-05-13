import React from 'react';
import { Chip, Tooltip } from '@material-ui/core';
import {
  Home as HomeIcon, Person as PersonIcon
} from '@material-ui/icons';
import { startCase } from 'lodash';

const OwnerChip = ({owner, ownerType, ...rest}) => {
  const type = ownerType || 'Organization';
  const icon = (type.toLowerCase() === 'user') ?
               <PersonIcon fontSize='small' color='primary' /> :
               <HomeIcon fontSize='small' color='primary' />;

  return (
    <Tooltip arrow placement='top-start' title={`${startCase(type.toLowerCase())}: ${owner}`}>
      <Chip icon={icon} label={owner} variant='outlined' color='default' {...rest} />
    </Tooltip>
  )
}

export default OwnerChip;
