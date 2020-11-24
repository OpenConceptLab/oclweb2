import React from 'react';
import { Chip } from '@material-ui/core';

const IncludeRetiredFilterChip = ({ size, applied, onClick }) => {
  const label = applied ? 'Exclude Retired' : 'Include Retired';
  const color = applied ? 'primary' : 'secondary';
  return (
    <Chip
      label={ label }
      variant={applied ? 'default' : 'outlined'}
      clickable
      color={ color }
      size={ size || 'medium' }
      onClick={ onClick }
    />
  );
}

export default IncludeRetiredFilterChip;
