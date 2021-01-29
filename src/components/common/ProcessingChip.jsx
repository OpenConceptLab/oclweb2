import React from 'react';
import { Chip, Tooltip } from '@material-ui/core';
import { Timer as ProcessingIcon } from '@material-ui/icons';
import { ORANGE } from '../../common/constants';

const ProcessingChip = props => {
  const icon = <ProcessingIcon fontSize='inherit' style={{color: ORANGE}} />;

  return (
    <Tooltip placement='top-start' title='Processing'>
      <Chip icon={icon} label='Processing' variant='outlined' style={{color: ORANGE, border: `1px solid ${ORANGE}`}} size={props.size || 'medium'}/>
    </Tooltip>
  )
}

export default ProcessingChip;
