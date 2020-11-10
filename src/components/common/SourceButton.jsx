import React from 'react';
import { Button } from '@material-ui/core';
import { List as ListIcon } from '@material-ui/icons';
import { GREEN, WHITE } from '../../common/constants';

const SourceButton = ({label, onClick}) => {
  return (
    <Button
      variant='contained'
      startIcon={<ListIcon />}
      onClick={onClick}
      style={{background: GREEN, color: WHITE, boxShadow: 'none'}}>
      {label}
    </Button>
  )
}

export default SourceButton;
