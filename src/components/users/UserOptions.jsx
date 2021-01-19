import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Paper, IconButton, Popper, MenuItem, MenuList, Grow, ClickAwayListener
} from '@material-ui/core';
import {
  MoreVert as MoreIcon, ExitToApp as LogoutIcon, Edit as EditIcon
} from '@material-ui/icons';

const onLogoutClick = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  alertifyjs.success('You have signed out.')
  window.location.hash = '#/'
  window.location.reload()
}


const OPTIONS = [
  {id: 'edit', label: 'Edit Profile', icon: <EditIcon fontSize='small' style={{marginRight: '10px'}}/>},
  {id: 'logout', label: 'Logout', icon: <LogoutIcon fontSize='small' style={{marginRight: '10px'}} />},
]

const UserOptions = () => {
  const [open, setOpen] = React.useState(false);
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
  }

  return (
    <React.Fragment>
      <IconButton
        ref={anchorRef}
        aria-controls={open ? 'split-button-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-label="select merge strategy"
        aria-haspopup="menu"
        onClick={handleToggle}
      >
        <MoreIcon />
      </IconButton>
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
    </React.Fragment>

  )
}

export default UserOptions;
