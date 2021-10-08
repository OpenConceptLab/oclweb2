import React from 'react';
import { Button } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
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
