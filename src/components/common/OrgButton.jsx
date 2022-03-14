import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { ORANGE, WHITE } from '../../common/constants';

const OrgButton = ({label, onClick, href, ...rest}) => {
  return (
    <Tooltip title={label} arrow>
      <Button
        variant='contained'
        startIcon={<HomeIcon />}
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

export default OrgButton;
