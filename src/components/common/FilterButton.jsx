import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import {
  FilterAlt as FilterIcon,
} from '@mui/icons-material';

const FilterButton = ({tooltipTitle, label, count, disabled, onClick, size, minWidth, isOpen}) => {
  const hasFilters = count && count > 0;
  const color = (hasFilters || isOpen) ? 'primary' : 'secondary';
  const buttonLabel = (label || 'Filters') + (hasFilters ? ` (${count})` : '');

  return (
    <Tooltip arrow title={tooltipTitle || 'Filter Results'}>
      <Chip
        onClick={onClick}
        variant={(hasFilters || isOpen) ? 'filled' : 'outlined'}
        color={color}
        icon={<FilterIcon fontSize='small' />}
        label={buttonLabel}
        style={{minWidth: minWidth || '100px', cursor: disabled ? 'not-allowed' : 'pointer'}}
        disabled={disabled}
        size={size || 'medium'}
      />
    </Tooltip>
  )
}

export default FilterButton;
