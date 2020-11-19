import React from 'react';
import { Chip, MenuItem, Menu } from '@material-ui/core';
import { AcUnit as AsteriskIcon } from '@material-ui/icons';
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
      <Chip
        variant="outlined"
        color='primary'
        icon={<AsteriskIcon fontSize='inherit' />}
        label={selected}
        onClick={onOpen}
        size={size || 'medium'}
      />
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
