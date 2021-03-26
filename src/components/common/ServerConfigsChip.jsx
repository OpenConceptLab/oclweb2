import React from 'react';
import {
  Chip, Tooltip, Menu
} from '@material-ui/core';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Storage as ServerIcon,
} from '@material-ui/icons';
import { getAppliedServerConfig } from '../../common/utils';
import ServerConfigList from './ServerConfigList';

const ServerConfigsChip = props => {
  const anchorRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const applied = getAppliedServerConfig();

  return (
    <React.Fragment>
      <Tooltip title='Switch Server' placement='bottom'>
        <Chip
          icon={<ServerIcon fontSize='inherit' />}
          color='secondary'
          variant='outlined'
          label={`Server : ${applied.name}`}
          deleteIcon={
            open ? <ExpandLessIcon fontSize='inherit' /> : <ExpandMoreIcon fontSize='inherit' />
          }
          onDelete={() => setOpen(!open)}
          onClick={() => setOpen(!open)}
          ref={anchorRef}
          {...props}
        />
      </Tooltip>
      {
        open &&
        <Menu open={open} anchorEl={anchorRef.current} onClose={() => setOpen(false)} style={{marginTop: '35px'}}>
          <ServerConfigList onClose={() => setOpen(false)} />
        </Menu>
      }
    </React.Fragment>
  )
}

export default ServerConfigsChip;
