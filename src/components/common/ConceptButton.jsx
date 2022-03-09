import React from 'react';
import { Button } from '@mui/material';
import { LocalOffer as LocalOfferIcon } from '@mui/icons-material';
import { merge } from 'lodash';
import { BLUE, WHITE, RED, BLACK } from '../../common/constants';

const ConceptButton = ({label, onClick, retired, href, style, ...rest}) => {
  const _style = retired ?
                {background: 'lightgray', color: RED, boxShadow: 'none', textDecoration: 'line-through', textDecorationColor: BLACK, textTransform: 'none'} :
                {background: BLUE, color: WHITE, boxShadow: 'none', textTransform: 'none'};
  return (
    <Button
      href={href}
      variant='contained'
      startIcon={<LocalOfferIcon />}
      onClick={onClick}
      style={merge(_style, style || {})}
      className='button-controlled'
      {...rest}
    >
      {label}
    </Button>
  )
}

export default ConceptButton;
