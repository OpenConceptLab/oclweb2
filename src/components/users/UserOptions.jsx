import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Paper, IconButton, Popper, MenuItem, MenuList, Grow, ClickAwayListener, Tooltip
} from '@material-ui/core';
import {
  ExitToApp as LogoutIcon, Edit as EditIcon, Person as PersonIcon
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

const OPTIONS = [
  {id: 'home', label: 'Home', icon: <PersonIcon fontSize='small' style={{marginRight: '10px'}}/>},
  {id: 'edit', label: 'Edit Profile', icon: <EditIcon fontSize='small' style={{marginRight: '10px'}}/>},
  {id: 'logout', label: 'Logout', icon: <LogoutIcon fontSize='small' style={{marginRight: '10px'}} />},
]

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
  const onOptionClick = option => {
    if(option === 'logout')
      onLogoutClick()
    if(option === 'edit')
      setForm(true)
    if(option === 'home')
      window.location.hash = `${user.url}`
  }

  return (
    <React.Fragment>
      <Tooltip title='Profile'>
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
      </Tooltip>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal style={{zIndex: 1}}>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
            >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {
                    OPTIONS.map(option => (
                      <MenuItem key={option.id} onClick={() => onOptionClick(option.id)}>
                        {option.icon}
                        {option.label}
                      </MenuItem>
                    ))
                  }
                </MenuList>
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
