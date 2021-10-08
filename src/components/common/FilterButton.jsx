import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import {
  FilterList as FilterListIcon,
} from '@mui/icons-material';

const FilterButton = ({tooltipTitle, label, count, disabled, onClick, size}) => {
  const hasFilters = count && count > 0;
  const color = hasFilters ? 'primary' : 'secondary';
  const buttonLabel = (label || 'Filters') + (hasFilters ? ` (${count})` : '');

  return (
    <Tooltip arrow title={tooltipTitle || 'Filter Results'}>
      <Chip
        onClick={onClick}
        variant={hasFilters ? 'default' : 'outlined'}
        color={color}
        icon={<FilterListIcon fontSize='small' />}
        label={buttonLabel}
        style={{minWidth: '100px', cursor: disabled ? 'not-allowed' : 'pointer'}}
        disabled={disabled}
        size={size || 'medium'}
      />
    </Tooltip>
  )
}

export default FilterButton;
