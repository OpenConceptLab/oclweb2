import React from 'react';
import { useTranslation } from 'react-i18next'
import { Tooltip, Chip } from '@mui/material';
import {
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material';
import { get } from 'lodash';

const SORT_ICON_STYLES = {width: '14px', height: '14px'};

const NumericalIDSort = ({ selected, onSelect, size }) => {
  const { t } = useTranslation()
  const isSelected = !selected || selected.sortDesc === 'numeric_id' || selected.sortAsc === 'numeric_id';
  const isDesc = get(selected, 'sortDesc') === 'numeric_id';
  const onClick = () => {
    if(!isSelected || isDesc)
      onSelect({sortAsc: 'numeric_id'})
    else
      onSelect({sortDesc: 'numeric_id'})
  };
  return (
    <span>
      <Tooltip arrow title={t('search.tooltip.numerical_sort')}>
        <Chip
          icon={
            isDesc ?
                <ArrowDownwardIcon fontSize="inherit" style={SORT_ICON_STYLES} /> :
                <ArrowUpwardIcon fontSize="inherit" style={SORT_ICON_STYLES} />
          }
          variant="outlined"
          color={isSelected ? "primary" : "secondary"}
          label={t('search.numerical_sort')}
          onClick={onClick}
          size={size || 'medium'}
        />
      </Tooltip>
    </span>
  )
}

export default NumericalIDSort;
