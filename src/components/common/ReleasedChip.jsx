import React from 'react';
import { Chip, Tooltip } from '@material-ui/core';
import {
  NewReleases as ReleaseIcon
} from '@material-ui/icons';

const ReleasedChip = props => {
  const icon = <ReleaseIcon fontSize='inherit' color='primary' />;

  return (
    <Tooltip placement='top-start' title='Released'>
      <Chip icon={icon} label='Released' variant='outlined' color='primary' size={props.size || 'medium'}/>
    </Tooltip>
  )
}

export default ReleasedChip;
