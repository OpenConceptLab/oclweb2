import React from 'react';
import { Button } from '@mui/material';
import {
  AspectRatio as ExpansionIcon
} from '@mui/icons-material';
import { BLUE, WHITE, RED, BLACK } from '../../common/constants';

const ExpansionButton = ({label, onClick, retired, href, bgColor, textColor}) => {
  let backgroundColor = bgColor || BLUE;
  let txtColor = textColor || WHITE;
  const style = retired ?
                {background: 'lightgray', color: RED, boxShadow: 'none', textDecoration: 'line-through', textDecorationColor: BLACK, textTransform: 'none'} :
                {background: backgroundColor, color: txtColor, boxShadow: 'none', textTransform: 'none'};
  return (
    <Button
      href={href}
      variant='contained'
      startIcon={<ExpansionIcon />}
      onClick={onClick}
      style={style}>
      {label}
    </Button>
  )
}

export default ExpansionButton;
