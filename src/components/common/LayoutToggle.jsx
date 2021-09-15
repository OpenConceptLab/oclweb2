import React from 'react';
import { Chip, MenuItem, Menu, ListItemIcon, Tooltip } from '@material-ui/core';
import {
  TableChart as TableIcon,
  ViewStream as RowsIcon,
  VerticalSplit as SplitIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@material-ui/icons';
import { find, map } from 'lodash';
import { isAdminUser } from '../../common/utils';
import {
  TABLE_LAYOUT_ID, LIST_LAYOUT_ID, SPLIT_LAYOUT_ID
} from '../../common/constants'
import useResponsive from "../../hooks/useResponsive"

const OPTIONS = [
  {id: TABLE_LAYOUT_ID, name: 'Table View', icon: <TableIcon fontSize='inherit' />},
  {id: LIST_LAYOUT_ID, name: 'Row View', icon: <RowsIcon fontSize='inherit' />},
]

const SPLIT_VIEW_OPTION = {id: SPLIT_LAYOUT_ID, name: 'Split View', icon: <SplitIcon fontSize='inherit' />};

const LayoutToggle = ({ layoutId, onClick, size, includeSplitView }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const selectedLayoutId = layoutId || 'table';
  const options = (includeSplitView && isAdminUser()) ? [...OPTIONS, SPLIT_VIEW_OPTION] : OPTIONS
  const selectedLayout = find(options, {id: selectedLayoutId})
  const toggleAnchor = event => setAnchorEl(anchorEl ? null : event.currentTarget)
  const onSelect = id => {
    onClick(id)
    toggleAnchor()
  }
  const { isTablePotrait } = useResponsive()


  return (
    <React.Fragment>
      {!isTablePotrait && <Tooltip arrow title='Switch view layouts'>
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
      </Tooltip>}
      <Menu
        id="layouts-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={toggleAnchor}
      >
        {
          map(options, ({id, name, icon}) => (
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
