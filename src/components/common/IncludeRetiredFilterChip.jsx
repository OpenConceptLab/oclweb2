import React from 'react';
import { Chip, Tooltip } from '@mui/material';

const IncludeRetiredFilterChip = ({ size, applied, onClick }) => {
  const label = applied ? 'Exclude Retired' : 'Include Retired';
  const color = applied ? 'primary' : 'secondary';
  return (
    <Tooltip arrow title={applied ? 'Exclude retired results' : 'Include retired results'}>
      <Chip
        label={ label }
        variant='outlined'
        clickable
        color={ color }
        size={ size || 'medium' }
        onClick={ onClick }
      />
    </Tooltip>
  );
}

export default IncludeRetiredFilterChip;
