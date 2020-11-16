import React from 'react';
import { Button, ButtonGroup } from '@material-ui/core';
import { Link as LinkIcon } from '@material-ui/icons';
import { BLUE, WHITE, RED, BLACK } from '../../common/constants';

const MappingButton = ({label, mapType, onClick, retired, href}) => {
  const style = retired ?
                {background: 'lightgray', color: RED, boxShadow: 'none', textDecoration: 'line-through', textDecorationColor: BLACK} :
                {background: BLUE, color: WHITE, boxShadow: 'none'};
  return (
    <ButtonGroup variant='contained' style={{boxShadow: 'none'}}>
      <Button
        className='light-gray-bg'
        href={href}
        startIcon={<LinkIcon />}
        onClick={onClick}
        style={style}>
        {label}
      </Button>
      <Button
        href={href}
        variant='contained'
        onClick={onClick}
        style={style}>
        {mapType}
      </Button>
    </ButtonGroup>
  )
}

export default MappingButton;
