import React from 'react';
import { startCase, map, find } from 'lodash';
import { IconButton, Menu, MenuItem, Tooltip } from '@material-ui/core';
import {
  Settings as SettingsIcon,
  Add as AddIcon,
} from '@material-ui/icons'

const NewResourceButton = ({resources, onClick}) => {
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
      <Tooltip title='Manage Content'>
        <IconButton color='primary' onClick={toggleAnchorEl}>
          { hasEdit ? <SettingsIcon /> : <AddIcon />}
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
  )
}

export default NewResourceButton;
