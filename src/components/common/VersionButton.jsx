import React from 'react';
import { Button } from '@material-ui/core';
import {
  AccountTreeRounded as TreeIcon
} from '@material-ui/icons';
import { BLUE, WHITE, RED, BLACK } from '../../common/constants';

const VersionButton = ({label, onClick, retired, href, bgColor, textColor}) => {
  let backgroundColor = bgColor || BLUE;
  let txtColor = textColor || WHITE;
  const style = retired ?
                {background: 'lightgray', color: RED, boxShadow: 'none', textDecoration: 'line-through', textDecorationColor: BLACK, textTransform: 'none'} :
                {background: backgroundColor, color: txtColor, boxShadow: 'none', textTransform: 'none'};
  return (
    <Button
      href={href}
      variant='contained'
      startIcon={<TreeIcon />}
      onClick={onClick}
      style={style}>
      {label}
    </Button>
  )
}

export default VersionButton;
