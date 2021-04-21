import React from 'react';
import { Tooltip, Chip } from '@material-ui/core';
import {
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@material-ui/icons';
import { get } from 'lodash';

const SORT_ICON_STYLES = {width: '14px', height: '14px'};

const BestMatchSort = ({ selected, onSelect, size }) => {
  const isSelected = !selected || selected.sortDesc === '_score' || selected.sortAsc === '_score';
  const isAsc = get(selected, 'sortAsc') === '_score';
  const onClick = () => {
    if(!isSelected || isAsc)
      onSelect({sortDesc: '_score'})
    else
      onSelect({sortAsc: '_score'})
  };
  return (
    <span>
      <Tooltip title='Sort By Best Match (score)'>
        <Chip
          icon={
            isAsc ?
                <ArrowUpwardIcon fontSize="inherit" style={SORT_ICON_STYLES} /> :
                <ArrowDownwardIcon fontSize="inherit" style={SORT_ICON_STYLES} />
          }
          variant="outlined"
          color={isSelected ? "primary" : "default"}
          label="Best Match"
          onClick={onClick}
          size={size || 'medium'}
        />
      </Tooltip>
    </span>
  )
}

export default BestMatchSort;
