import React from 'react';
import { Chip, Tooltip } from '@material-ui/core';

const InfiniteScrollChip = ({isInfinite, onClick, size}) => {
  const label = isInfinite ? 'Paginated List' : 'Infinite Scroll';
  const tooltipTitle = `Switch to ${label}`

  return (
    <Tooltip arrow title={tooltipTitle}>
      <Chip variant="outlined" color="primary" label={label} onClick={onClick} size={size || 'medium'} />
    </Tooltip>
  );
}

export default InfiniteScrollChip;
