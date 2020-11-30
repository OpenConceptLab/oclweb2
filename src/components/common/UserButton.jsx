import React from 'react';
import { Button } from '@material-ui/core';
import { Person as PersonIcon } from '@material-ui/icons';
import { ORANGE, WHITE } from '../../common/constants';

const UserButton = ({label, onClick, href}) => {
  return (
    <Button
      variant='contained'
      startIcon={<PersonIcon />}
      onClick={onClick}
      href={href}
      style={{background: ORANGE, color: WHITE, boxShadow: 'none', textTransform: 'none'}}>
      {label}
    </Button>
  )
}

export default UserButton;
