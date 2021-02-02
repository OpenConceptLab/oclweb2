import React from 'react';
import { Tooltip, Chip, MenuItem, Menu } from '@material-ui/core'
import SettingsIcon from '@material-ui/icons/SettingsOverscan';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { map } from 'lodash';

const ConfigSelect = ({configs, selected, onChange, color}) => {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const toggleOpen = event => {
    const newOpen = !open

    setOpen(newOpen)
    setAnchorEl(newOpen ? event.currentTarget : null)
  }

  const _onChange = (event, config) => {
    event.persist();

    onChange(config)
    toggleOpen(event)
  }
  return (
    <span>
      <Tooltip title='Change View Layout'>
        <Chip
          variant="default"
          color='secondary'
          icon={<SettingsIcon style={{width: '18px', marginLeft: '8px'}} />}
          deleteIcon={<ArrowDropDownIcon style={{width: '18px'}} />}
          label={`Layout : ${selected.name}`}
          onClick={toggleOpen}
          onDelete={toggleOpen}
          style={{backgroundColor: color, borderColor: color}}
        />
      </Tooltip>
      <Menu
        id="results-size-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={toggleOpen}
      >
        {
          map(configs, config => (
            <MenuItem key={config.name} onClick={event => _onChange(event, config)}>
              {config.name}
            </MenuItem>
          ))
        }
      </Menu>
    </span>
  )
}

export default ConfigSelect;
