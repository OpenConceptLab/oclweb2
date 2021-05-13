import React from 'react';
import { Chip, Tooltip } from '@material-ui/core';
import { TableChart as TableIcon, ViewStream as RowsIcon } from '@material-ui/icons';

const LayoutToggle = ({isTable, onClick, size}) => {
  const icon = isTable ? <RowsIcon fontSize="inherit" /> : <TableIcon fontSize="inherit" />;
  const label = isTable ? 'Row View' : 'Table View';
  const tooltipTitle = `Switch to ${label}`

  return (
    <Tooltip arrow title={tooltipTitle}>
      <Chip variant="outlined" icon={icon} color="primary" label={label} onClick={onClick} size={size || 'medium'} />
    </Tooltip>
  );
}

export default LayoutToggle;
