import React from 'react';
import { Tooltip, Chip, MenuItem, Menu } from '@material-ui/core'
import SettingsIcon from '@material-ui/icons/Settings';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { map } from 'lodash';
import CommonFormDrawer from './CommonFormDrawer';
import ViewConfigForm from './ViewConfigForm';

const ConfigSelect = ({configs, selected, onChange, color, resourceURL}) => {
  const [drawer, setDrawer] = React.useState(false);
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

  const onIconClick = event => {
    event.stopPropagation();
    event.preventDefault();

    setDrawer(true)
  }
  return (
    <span>
      <Tooltip title='Change View Layout'>
        <Chip
          variant="default"
          color='secondary'
          icon={<SettingsIcon style={{width: '18px', marginLeft: '8px'}} onClick={ onIconClick } />}
          deleteIcon={<ArrowDropDownIcon style={{width: '18px'}} />}
          label={`Layout : ${selected.name}`}
          onClick={toggleOpen}
          onDelete={toggleOpen}
          style={{backgroundColor: color, borderColor: color, maxWidth: '200px'}}
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

      <CommonFormDrawer
        isOpen={drawer} onClose={() => setDrawer(false)}
        formComponent={
          <ViewConfigForm
            reloadOnSuccess
            selected={selected} configs={configs} onCancel={() => setDrawer(false)} resourceURL={resourceURL}
          />
        }
      />
    </span>
  )
}

export default ConfigSelect;
