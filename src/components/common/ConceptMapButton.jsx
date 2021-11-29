import React from 'react';
import { Button } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import { GREEN, WHITE } from '../../common/constants';

const ConceptMapButton = ({label, onClick, href}) => {
  return (
    <Button
      variant='contained'
      href={href}
      startIcon={<LinkIcon />}
      onClick={onClick}
      style={{background: GREEN, color: WHITE, boxShadow: 'none', textTransform: 'none'}}>
      {label}
    </Button>
  )
}

export default ConceptMapButton;
