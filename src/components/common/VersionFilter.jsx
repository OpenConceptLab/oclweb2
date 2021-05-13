import React from 'react';
import { Chip, MenuItem, Menu, Tooltip } from '@material-ui/core';
import { AccountTreeRounded as TreeIcon, ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons';
import { map, without } from 'lodash';

const VersionFilter = props => {
  const { size, onChange, selected, versions } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const onOpen = event => {
    versions && setAnchorEl(event.currentTarget);
  }

  const onClose = () => {
    setAnchorEl(null)
  }

  const onSelect = version => {
    onChange(version)
    onClose(null)
  }

  return (
    <React.Fragment>
      <Tooltip arrow title='Change Version'>
      <Chip
        variant="outlined"
        color='primary'
        icon={<TreeIcon fontSize='inherit' style={{width: '14px', marginLeft: '5px'}} />}
        label={selected}
        onClick={onOpen}
        size={size || 'medium'}
        style={{minWidth: '80px'}}
        deleteIcon={<ArrowDropDownIcon fontSize="inherit" />}
        onDelete={onOpen}
      />
      </Tooltip>
      <Menu
        id="versions-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={onClose}
      >
        <MenuItem value='HEAD' onClick={() => onSelect('HEAD')}>
          HEAD
        </MenuItem>
        {
          map(without(versions, 'HEAD'), version => (
            <MenuItem key={version} value={version} onClick={() => onSelect(version)}>
              {version}
            </MenuItem>
          ))
        }
      </Menu>
    </React.Fragment>
  );
}

export default VersionFilter;
