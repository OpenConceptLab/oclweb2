import React from 'react';
import { Button } from '@material-ui/core';
import { LocalOffer as LocalOfferIcon } from '@material-ui/icons';
import { BLUE, WHITE } from '../../common/constants';

const ConceptButton = ({label, onClick}) => {
  return (
    <Button
      variant='contained'
      startIcon={<LocalOfferIcon />}
      onClick={onClick}
      style={{background: BLUE, color: WHITE, boxShadow: 'none'}}>
      {label}
    </Button>
  )
}

export default ConceptButton;
