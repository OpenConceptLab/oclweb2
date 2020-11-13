import React from 'react';
import { Button } from '@material-ui/core';
import { LocalOffer as LocalOfferIcon } from '@material-ui/icons';
import { BLUE, WHITE, RED, BLACK } from '../../common/constants';

const ConceptButton = ({label, onClick, retired, href}) => {
  const style = retired ?
                {background: 'lightgray', color: RED, boxShadow: 'none', textDecoration: 'line-through', textDecorationColor: BLACK} :
                {background: BLUE, color: WHITE, boxShadow: 'none'};
  return (
    <Button
      href={href}
      variant='contained'
      startIcon={<LocalOfferIcon />}
      onClick={onClick}
      style={style}>
      {label}
    </Button>
  )
}

export default ConceptButton;
