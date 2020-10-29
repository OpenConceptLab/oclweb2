import React from 'react';
import { Chip } from '@material-ui/core';
import {
  Home as HomeIcon, Person as PersonIcon
} from '@material-ui/icons';

const OwnerWithIcon = ({owner, ownerType}) => {
  const icon = ownerType.toLowerCase() === 'user' ?
               <PersonIcon fontSize='small' color='primary' /> :
               <HomeIcon fontSize='small' color='primary' />;

  return (
    <Chip icon={icon} label={owner} variant='outlined' color='secondary' />
  )
}

export default OwnerWithIcon;
