import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { ORANGE, WHITE } from '../../common/constants';

const UserButton = ({label, onClick, href, ...rest}) => {
  return (
    <Tooltip title={label} arrow>
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
    </Tooltip>
  )
}

export default UserButton;
