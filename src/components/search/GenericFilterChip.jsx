import React from 'react';
import {
  Chip, Tooltip, Menu, MenuItem, MenuList
} from '@material-ui/core';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Cancel as CancelIcon,
} from '@material-ui/icons';
import { startCase, map } from 'lodash';

const GenericFilterChip = ({id, name, options, tooltip, onChange, value, size}) => {
  const anchorRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const label = name || startCase(id)
  const labelWithValue = `${label}${value ? '=' + value : ''}`
  const tooltipTitle = tooltip || `Filter by ${label}`
  const onValueChange = option => {
    setOpen(false)
    onChange(id, option)
    return false
  }

  return (
    <React.Fragment key={id}>
      <Tooltip arrow title={tooltipTitle}>
        <Chip
          icon={<FilterIcon fontSize='inherit' />}
          color={value ? 'primary' : 'secondary'}
          label={labelWithValue}
          size={size || 'medium'}
          deleteIcon={
            value ? <CancelIcon fontSize='inherit' /> : (open ? <ExpandLessIcon fontSize='inherit' /> : <ExpandMoreIcon fontSize='inherit' />)
          }
          onDelete={() => value ? onValueChange(null) : setOpen(!open)}
          onClick={() => setOpen(!open)}
          ref={anchorRef}
          variant="outlined"
        />
      </Tooltip>
      {
        open &&
        <Menu open={open} anchorEl={anchorRef.current} onClose={() => setOpen(false)}>
          <MenuList id="split-button-menu">
            {
              map(options, (option, index) => (
                <MenuItem
                  id={option}
                  key={index}
                  selected={option === value}
                  onClick={() => onValueChange(option)}
                  >
                  {option}
                </MenuItem>
              ))
            }
          </MenuList>
        </Menu>
      }
    </React.Fragment>
  )
}

export default GenericFilterChip;
