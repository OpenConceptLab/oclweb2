import React from 'react';
import {ButtonGroup, Button} from '@material-ui/core';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@material-ui/icons';


const NavigationButtonGroup = ({ onClick, prev, next }) => {
  return (
    <ButtonGroup size="small" color="primary" aria-label="outlined primary button group">
      <Button style={{padding: 0}} onClick={() => onClick(false)} disabled={!prev}>
        <NavigateBeforeIcon width="10" />
      </Button>
      <Button style={{padding: 0}} onClick={() => onClick(true)} disabled={!next}>
        <NavigateNextIcon width="10" />
      </Button>
    </ButtonGroup>
  )
}

export default NavigationButtonGroup;
