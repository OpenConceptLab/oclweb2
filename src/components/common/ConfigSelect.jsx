import React from 'react';
import { Tooltip, MenuItem, Menu, ButtonGroup, Button } from '@mui/material'
import {
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material'
import { map, get } from 'lodash';
import ResponsiveDrawer from './ResponsiveDrawer';
import ViewConfigForm from './ViewConfigForm';
import { BLUE, WHITE } from '../../common/constants';

const ConfigSelect = ({configs, selected, onChange, color, resourceURL, onWidthChange, ...rest}) => {
  const [drawer, setDrawer] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [preview, setPreviewConfig] = React.useState(null);

  const toggleOpen = event => {
    const newOpen = !open

    setOpen(newOpen)
    setAnchorEl(newOpen ? event.currentTarget : null)
  }

  const _onChange = (event, config) => {
    event.persist();

    setPreviewConfig(null)

    onChange(config)
    toggleOpen(event)
  }

  const onIconClick = event => {
    event.stopPropagation();
    event.preventDefault();

    setDrawer(!drawer)
    if(onWidthChange)
      onWidthChange(drawer ? 0 : 360)
  }

  const getLabel = () => {
    const name = get(selected, 'name')
    return preview ? `Preview : ${name || 'New Configuration'}` : `Layout : ${name}`;
  }

  const onCancel = () => {
    setDrawer(false)
    if(onWidthChange)
      onWidthChange(0)
  }

  return (
    <span>
      <ButtonGroup style={{backgroundColor: preview ? BLUE : color}} size='small'>
        <Tooltip arrow title='View Configuration'>
          <Button style={{borderColor: WHITE, maxWidth: '200px', color: WHITE, textTransform: 'revert', letterSpacing: 'unset', overflow: 'hidden', whiteSpace: 'nowrap'}} onClick={onIconClick}>
            {getLabel()}
          </Button>
        </Tooltip>
        <Tooltip arrow title='Switch Configuration'>
          <Button style={{color: WHITE, borderColor: WHITE}} onClick={toggleOpen}>
            <ArrowDropDownIcon style={{width: '18px'}} />
          </Button>
        </Tooltip>
      </ButtonGroup>
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
      {
        drawer &&
        <ResponsiveDrawer
          variant='persistent'
          isOpen={drawer}
          onClose={() => setDrawer(false)}
          onWidthChange={onWidthChange}
          formComponent={
            <ViewConfigForm
              reloadOnSuccess
              onClose={() => setDrawer(false)}
              previewFields={get(preview, 'fields')}
                            selected={get(preview, 'selected') || selected}
                            configs={configs}
                            onCancel={onCancel}
                            resourceURL={resourceURL}
                            onChange={onChange}
                            onPreview={setPreviewConfig}
            {...rest}
            />
          }
        />
      }
    </span>
  )
}

export default ConfigSelect;
