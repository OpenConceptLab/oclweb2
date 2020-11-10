import React from 'react';
import { Button } from '@material-ui/core';
import { Person as PersonIcon } from '@material-ui/icons';
import { ORANGE, WHITE } from '../../common/constants';

const UserButton = ({label, onClick}) => {
  return (
    <Button
      variant='contained'
      startIcon={<PersonIcon />}
      onClick={onClick}
      style={{background: ORANGE, color: WHITE, boxShadow: 'none'}}>
      {label}
    </Button>
  )
}

export default UserButton;
