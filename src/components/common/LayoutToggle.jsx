import React from 'react';
import { Chip, MenuItem, Menu, ListItemIcon, Tooltip } from '@mui/material';
import {
  TableChart as TableIcon,
  ViewStream as RowsIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { find, map } from 'lodash';
import {
  TABLE_LAYOUT_ID, LIST_LAYOUT_ID
} from '../../common/constants'

const OPTIONS = [
  {id: TABLE_LAYOUT_ID, name: 'Table View', icon: <TableIcon fontSize='inherit' />},
  {id: LIST_LAYOUT_ID, name: 'Row View', icon: <RowsIcon fontSize='inherit' />},
]


const LayoutToggle = ({ layoutId, onClick, size }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const selectedLayoutId = layoutId || 'table';
  const selectedLayout = find(OPTIONS, {id: selectedLayoutId})
  const toggleAnchor = event => setAnchorEl(anchorEl ? null : event.currentTarget)
  const onSelect = id => {
    onClick(id)
    toggleAnchor()
  }

  return (
    <React.Fragment>
      <Tooltip arrow title='Switch view layouts'>
        <Chip
          variant="outlined"
          icon={selectedLayout.icon}
          color="primary"
          label={selectedLayout.name}
          onClick={toggleAnchor}
          size={size || 'medium'}
          deleteIcon={<ArrowDropDownIcon fontSize="inherit" />}
          onDelete={toggleAnchor}
        />
      </Tooltip>
      <Menu
        id="layouts-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={toggleAnchor}
      >
        {
          map(OPTIONS, ({id, name, icon}) => (
            <MenuItem key={id} value={id} onClick={() => onSelect(id)}>
              <ListItemIcon style={{minWidth: 'auto', marginRight: '10px'}}>
                {icon}
              </ListItemIcon>
              <span>{name}</span>
            </MenuItem>
          ))
        }
      </Menu>
    </React.Fragment>
  );
}

export default LayoutToggle;
