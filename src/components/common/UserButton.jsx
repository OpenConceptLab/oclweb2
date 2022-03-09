import React from 'react';
import { Button } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { ORANGE, WHITE } from '../../common/constants';

const UserButton = ({label, onClick, href, ...rest}) => {
  return (
    <Button
      variant='contained'
      startIcon={<PersonIcon />}
      onClick={onClick}
      href={href}
      style={{background: ORANGE, color: WHITE, boxShadow: 'none', textTransform: 'none'}}
      className='button-controlled'
      {...rest}
    >
      {label}
    </Button>
  )
}

export default UserButton;
