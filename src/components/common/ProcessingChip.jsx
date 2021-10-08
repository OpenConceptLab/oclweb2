import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { Timer as ProcessingIcon } from '@mui/icons-material';
import { ORANGE } from '../../common/constants';

const ProcessingChip = props => {
  const icon = <ProcessingIcon fontSize='inherit' style={{color: ORANGE}} />;

  return (
    <Tooltip arrow placement='top-start' title='Processing'>
      <Chip icon={icon} label='Processing' variant='outlined' style={{color: ORANGE, border: `1px solid ${ORANGE}`}} size={props.size || 'medium'}/>
    </Tooltip>
  )
}

export default ProcessingChip;
