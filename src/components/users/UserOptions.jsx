import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Paper, IconButton, Popper, Grow, ClickAwayListener, Tooltip,
  List, ListItem, ListItemIcon, ListItemText, Chip, Divider, Button
} from '@material-ui/core';
import {
  ExitToApp as LogoutIcon, Edit as EditIcon, AccountCircle as AccountIcon
} from '@material-ui/icons';
import { getCurrentUser, getUserInitials } from '../../common/utils';
import CommonFormDrawer from '../common/CommonFormDrawer';
import UserForm from './UserForm';

const onLogoutClick = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  alertifyjs.success('You have signed out.')
  window.location.hash = '#/'
  window.location.reload()
}

const UserOptions = () => {
  const initials = getUserInitials()
  const user = getCurrentUser()
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(false);
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
  const onEditClick = event => {
    event.persist();
    handleClose(event);
    setForm(true);
  }
  const onLogout = event => {
    event.persist();
    handleClose(event);
    onLogoutClick();
  }
  const displayName = user.name || user.username;

  return (
    <React.Fragment>
      <Tooltip title={user.username}>
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
                      <Chip className='manage-account-chip' label={<span style={{fontWeight: 'bold'}}>Manage your OCL Account</span>} onClick={onHomeClick} />
                    </ListItemText>
                  </ListItem>
                  <Divider />
                  <Tooltip placement='left' title='Edit Profile'>
                    <ListItem className='user-option-list-item' onClick={onEditClick}>
                      <ListItemIcon style={{minWidth: 'auto', marginRight: '15px'}}>
                        <EditIcon fontSize='small' />
                      </ListItemIcon>
                      <ListItemText className='list-item-text' primary={displayName} secondary={user.email} />
                    </ListItem>
                  </Tooltip>
                  <Divider />
                  <ListItem style={{display: 'flex', justifyContent: 'center', padding: '16px'}}>
                    <Button size='small' startIcon={<LogoutIcon fontSize='inherit' color='inherit' />} variant='outlined' onClick={onLogout}>
                      Sign Out
                    </Button>
                  </ListItem>
                </List>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      <CommonFormDrawer
        isOpen={form}
        onClose={() => setForm(false)}
        formComponent={
          <UserForm
            loggedIn
            edit
            reloadOnSuccess
            onCancel={() => setForm(false)} user={user}
          />
        }
      />
    </React.Fragment>
  )
}

export default UserOptions;
