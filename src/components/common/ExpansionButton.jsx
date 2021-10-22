import React from 'react';
import { Button } from '@material-ui/core';
import {
  AspectRatio as ExpansionIcon
} from '@material-ui/icons';
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
