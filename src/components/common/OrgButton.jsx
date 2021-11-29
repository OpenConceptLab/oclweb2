import React from 'react';
import { Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { ORANGE, WHITE } from '../../common/constants';

const OrgButton = ({label, onClick, href}) => {
  return (
    <Button
      variant='contained'
      startIcon={<HomeIcon />}
      onClick={onClick}
      href={href}
      style={{background: ORANGE, color: WHITE, boxShadow: 'none', textTransform: 'none'}}>
      {label}
    </Button>
  )
}

export default OrgButton;
