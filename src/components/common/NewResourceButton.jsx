import React from 'react';
import { startCase, map, find } from 'lodash';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import {
  Settings as SettingsIcon,
  Add as AddIcon,
} from '@mui/icons-material'

const NewResourceButton = ({resources, onClick, color}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const toggleAnchorEl = event => setAnchorEl(prev => prev ? null : event.currentTarget)

  const onItemClick = resource => {
    onClick(resource)
    toggleAnchorEl()
  }

  const formatResourceName = resource => resource.startsWith('edit') ? startCase(resource) : `Add ${startCase(resource)}`
  const hasEdit = find(resources, resource => resource.startsWith('edit'))

  return (
    <React.Fragment>
      <Tooltip arrow title='Manage Content'>
        <IconButton color='primary' onClick={toggleAnchorEl} size="large">
          { hasEdit ? <SettingsIcon style={color ? {color: color} : {}} /> : <AddIcon style={color ? {color: color} : {}} />}
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={toggleAnchorEl}>
        {
          map(resources, resource => (
            <MenuItem key={resource} onClick={() => onItemClick(resource)}>
              {formatResourceName(resource)}
            </MenuItem>
          ))
        }
      </Menu>
    </React.Fragment>
  );
}

export default NewResourceButton;
