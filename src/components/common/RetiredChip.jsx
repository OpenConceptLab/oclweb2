import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { Block as RetireIcon } from '@mui/icons-material';
import { RED } from '../../common/constants';

const RetiredChip = props => {
  const icon = <RetireIcon fontSize='inherit' style={{color: RED}} />;

  return (
    <Tooltip arrow placement='top-start' title='Retired'>
      <Chip icon={icon} label='Retired' variant='outlined' style={{color: RED, border: `1px solid ${RED}`}} size={props.size || 'medium'}/>
    </Tooltip>
  )
}

export default RetiredChip;
