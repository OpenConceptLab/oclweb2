import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Paper, IconButton, Popper, Grow, ClickAwayListener, Tooltip,
  List, ListItem, ListItemIcon, ListItemText, Chip, Divider, Button, Collapse
} from '@material-ui/core';
import {
  ExitToApp as LogoutIcon, AccountCircle as AccountIcon,
  Storage as ServerIcon, ExpandLess as LessIcon, ExpandMore as MoreIcon,
  Publish as ImportsIcon,
} from '@material-ui/icons';
import { get } from 'lodash';
import { getCurrentUser, getUserInitials, getAppliedServerConfig, canSwitchServer } from '../../common/utils';
import ServerConfigList from '../common/ServerConfigList';

const onLogoutClick = msg => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  alertifyjs.success(msg || 'You have signed out.')
  window.location.hash = '#/'
  window.location.reload()
}

const UserOptions = () => {
  const initials = getUserInitials()
  const user = getCurrentUser() || {}
  const [open, setOpen] = React.useState(false);
  const [serverOpen, setServerOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const handleToggle = () => setOpen((prevOpen) => !prevOpen);
  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target))
      return;

    setOpen(false);
  };
  const onHomeClick = event => {
    event.persist();
    handleClose(event);
    window.location.hash = user.url
  };
  const onImportsClick = event => {
    event.persist();
    handleClose(event);
    window.location.hash = '/imports'
  };
  const username = get(user, 'username');
  const displayName = get(user, 'name') || username;
  const serverConfig = getAppliedServerConfig();

  return (
    <React.Fragment>
      <Tooltip arrow title={username || ''}>
        {
          user.logo_url ?
          <IconButton touch='true' onClick={handleToggle} ref={anchorRef}>
            <img src={user.logo_url} className='user-img-small' />
          </IconButton> :
          <IconButton
            ref={anchorRef}
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleToggle}
            touch='true'
            className='user-info-icon'
            >
            {initials}
          </IconButton>
        }
      </Tooltip>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal style={{zIndex: 1}}>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
            >
            <Paper style={{minWidth: '330px', border: '1px solid lightgray'}}>
              <ClickAwayListener onClickAway={handleClose}>
                <List style={{paddingBottom: 0, paddingTop: 0}}>
                  <ListItem>
                    <ListItemText style={{textAlign: 'center'}}>
                      <div className='col-md-12'>
                        {
                          user.logo_url ?
                          <img src={user.logo_url} className='user-img-medium' /> :
                          <AccountIcon style={{width: '80px', height: '80px', color: 'gray'}} />
                        }
                      </div>
                      <ListItemText className='list-item-text-bold-primary' primary={displayName} secondary={user.email} />
                      <Chip className='manage-account-chip' label={<span style={{fontWeight: 'bold'}}>My Profile</span>} onClick={onHomeClick} />
                    </ListItemText>
                  </ListItem>
                  <Divider />
                  <Tooltip arrow placement='left' title='Bulk Imports'>
                    <ListItem className='user-option-list-item' onClick={onImportsClick}>
                      <ListItemIcon style={{minWidth: 'auto', marginRight: '15px'}}>
                        <ImportsIcon fontSize='small' />
                      </ListItemIcon>
                      <ListItemText className='list-item-text' primary='Bulk Imports' secondary='View existing bulk-imports or queue a new one.' />
                    </ListItem>
                  </Tooltip>
                  <Divider />
                  {
                    canSwitchServer() &&
                    <Tooltip arrow placement='left' title='Switch Server'>
                      <ListItem className='user-option-list-item' onClick={() => setServerOpen(!serverOpen)}>
                        <ListItemIcon style={{minWidth: 'auto', marginRight: '15px'}}>
                          <ServerIcon fontSize='small' />
                        </ListItemIcon>
                        <ListItemText className='list-item-text' primary='Switch Server' secondary={get(serverConfig, 'name')} />
                        {serverOpen ? <LessIcon /> : <MoreIcon />}
                      </ListItem>
                    </Tooltip>
                  }
                  <Collapse in={serverOpen} style={{maxHeight: '250px', overflow: 'auto'}}>
                    <ServerConfigList onClose={() => setOpen(false)}/>
                  </Collapse>
                  <Divider />
                  <ListItem style={{display: 'flex', justifyContent: 'center', padding: '16px'}}>
                    <Button size='small' startIcon={<LogoutIcon fontSize='inherit' color='inherit' />} variant='outlined' onClick={onLogoutClick}>
                      Sign Out
                    </Button>
                  </ListItem>
                </List>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  )
}

export default UserOptions;
