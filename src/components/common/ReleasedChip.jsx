import React from 'react';
import { Chip, Tooltip } from '@material-ui/core';
import {
  NewReleases as ReleaseIcon
} from '@material-ui/icons';

const ReleasedChip = () => {
  const icon = <ReleaseIcon fontSize='small' color='primary' />;

  return (
    <Tooltip placement='top-start' title='Released'>
      <Chip icon={icon} label='Released' variant='outlined' color='primary' />
    </Tooltip>
  )
}

export default ReleasedChip;
