import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import {
  NewReleases as ReleaseIcon
} from '@mui/icons-material';

const ReleasedChip = props => {
  const icon = <ReleaseIcon fontSize='inherit' color='primary' />;

  return (
    <Tooltip arrow placement='top-start' title='Released'>
      <Chip icon={icon} label='Released' variant='outlined' color='primary' size={props.size || 'medium'}/>
    </Tooltip>
  )
}

export default ReleasedChip;
