import React from 'react';
import {
  Paper, Popper, Grow, ClickAwayListener
} from '@mui/material';

const PopperGrow = ({open, anchorRef, handleClose, children, minWidth}) => {
  return (
    <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal style={{zIndex: 5}}>
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
          }}
          >
          <Paper style={{minWidth: minWidth || '330px', border: '1px solid lightgray'}}>
            <ClickAwayListener onClickAway={handleClose}>
              {children}
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>

  )
}

export default PopperGrow;
