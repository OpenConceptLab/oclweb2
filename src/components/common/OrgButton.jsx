import React from 'react';
import { Button } from '@material-ui/core';
import { Home as HomeIcon } from '@material-ui/icons';
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
