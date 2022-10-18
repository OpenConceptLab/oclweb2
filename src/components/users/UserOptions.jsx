import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  IconButton, Tooltip,
  List, ListItem, ListItemIcon, ListItemText, Chip, Divider, Button, Collapse
} from '@mui/material';
import {
  ExitToApp as LogoutIcon, AccountCircle as AccountIcon,
  Storage as ServerIcon, ExpandLess as LessIcon, ExpandMore as MoreIcon,
} from '@mui/icons-material';
import { get } from 'lodash';
import APIService from '../../services/APIService';
import { getCurrentUser, getUserInitials, getAppliedServerConfig, canSwitchServer, logoutUser, isLoggedIn, isSSOEnabled } from '../../common/utils';
import ServerConfigList from '../common/ServerConfigList';
import PopperGrow from '../common/PopperGrow';

const UserOptions = () => {
  const initials = getUserInitials()
  const user = getCurrentUser() || {}
  let alertifyForLogout = false
  let intervalId = null
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
  const username = get(user, 'username');
  const displayName = get(user, 'name') || username;
  const serverConfig = getAppliedServerConfig();
  const checkIfStillAuthenticated = () => {
    APIService.version().get(null, null, null, true).then(res => {
      if(get(res, 'response.status') === 401) {
        if(!alertifyForLogout) {
          alertifyForLogout = true
          clearInterval(intervalId)
          alertifyjs.error('Your token has been expired. You are logged out, please re-login.', 2, () => logoutUser(false, false))
        }
      }
    })
  }

  React.useEffect(() => {
    if(isLoggedIn() && isSSOEnabled())
      intervalId = setInterval(checkIfStillAuthenticated, 2000)
  }, [])

  return (
    <React.Fragment>
      <Tooltip arrow title={username || ''}>
        {
          user.logo_url ?
          <IconButton touch='true' onClick={handleToggle} ref={anchorRef} size="large">
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
            size="large">
            {initials}
          </IconButton>
        }
      </Tooltip>
      <PopperGrow open={open} anchorRef={anchorRef} handleClose={handleClose}>
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
            <Button size='small' startIcon={<LogoutIcon fontSize='inherit' color='inherit' />} variant='outlined' onClick={() => logoutUser(true)}>
              Sign Out
            </Button>
          </ListItem>
        </List>
      </PopperGrow>
    </React.Fragment>
  );
}

export default UserOptions;
