import React from 'react';
import {
  Check as YesIcon,
  Close as NoIcon,
} from '@material-ui/icons';
import { Tooltip, Chip } from '@material-ui/core';
import { ERROR_RED } from '../../common/constants';

const ExpansionChip = ({ expanded }) => {
  const label = 'Auto Expanded';
  const title = expanded ? 'Auto Expanded' : 'Not expanded automatically'
  return (
    <Tooltip arrow title={title} placement="top">
      <Chip
        style={expanded ? {} : {color: ERROR_RED}}
        label={label}
        size='small'
        icon={
          expanded ?
              <YesIcon fontSize='inherit' /> :
              <NoIcon fontSize='inherit' style={{color: ERROR_RED}} />
        }
      />
    </Tooltip>
  );
}

export default ExpansionChip;