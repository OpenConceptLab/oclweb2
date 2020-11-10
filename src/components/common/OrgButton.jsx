import React from 'react';
import { Button } from '@material-ui/core';
import { Home as HomeIcon } from '@material-ui/icons';
import { ORANGE, WHITE } from '../../common/constants';

const OrgButton = ({label, onClick}) => {
  return (
    <Button
      variant='contained'
      startIcon={<HomeIcon />}
      onClick={onClick}
      style={{background: ORANGE, color: WHITE, boxShadow: 'none'}}>
      {label}
    </Button>
  )
}

export default OrgButton;
