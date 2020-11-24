import React from 'react';
import { Chip, Tooltip } from '@material-ui/core';
import {
  Home as HomeIcon, Person as PersonIcon
} from '@material-ui/icons';
import { startCase } from 'lodash';

const OwnerChip = ({owner, ownerType}) => {
  const icon = ownerType.toLowerCase() === 'user' ?
               <PersonIcon fontSize='small' color='primary' /> :
               <HomeIcon fontSize='small' color='primary' />;

  return (
    <Tooltip placement='top-start' title={`${startCase(ownerType.toLowerCase())}: ${owner}`}>
      <Chip icon={icon} label={owner} variant='outlined' color='default' />
    </Tooltip>
  )
}

export default OwnerChip;
