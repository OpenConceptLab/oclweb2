import React from 'react';
import { Chip, Tooltip } from '@material-ui/core';
import {
  FilterList as FilterListIcon,
} from '@material-ui/icons';

const FilterButton = ({tooltipTitle, label, count, disabled, onClick, size}) => {
  const hasFilters = count && count > 0;
  const color = hasFilters ? 'primary' : 'secondary';
  const buttonLabel = (label || 'Filters') + (hasFilters ? ` (${count})` : '');

  return (
    <Tooltip title={tooltipTitle || 'Filter Results'}>
      <Chip
        onClick={onClick}
        variant='outlined'
        color={color}
        icon={<FilterListIcon fontSize='small' />}
        label={buttonLabel}
        style={{minWidth: '100px'}}
        disabled={disabled}
        size={size || 'medium'}
      />
    </Tooltip>
  )
}

export default FilterButton;
