import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { LocalOffer as LocalOfferIcon } from '@mui/icons-material';
import { merge } from 'lodash';
import { BLUE, WHITE, RED, BLACK, UUID_LENGTH } from '../../common/constants';

const ConceptButton = ({label, onClick, retired, href, style, ...rest}) => {
  const _style = retired ?
        {background: 'lightgray', color: RED, boxShadow: 'none', textDecoration: 'line-through', textDecorationColor: BLACK, textTransform: 'none'} :
        {background: BLUE, color: WHITE, boxShadow: 'none', textTransform: 'none'};
  const truncLabel = label && label.length === UUID_LENGTH ? `${label.split('-')[0]}...` : label
  return (
    <Tooltip title={label} arrow>
      <Button
        href={href}
        variant='contained'
        startIcon={<LocalOfferIcon />}
        onClick={onClick}
        style={merge(_style, style || {})}
        className='button-controlled'
        {...rest}
      >
        {truncLabel}
      </Button>
    </Tooltip>
  )
}

export default ConceptButton;
