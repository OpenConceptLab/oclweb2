import React from 'react';
import {
  IconButton, DialogTitle
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


const DialogTitleWithCloseButton = ({ children, onClose, disabled, ...other }) => {
  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      { children }
      {
        onClose &&
          <IconButton
            disabled={disabled}
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
      }
    </DialogTitle>
  )
}

export default DialogTitleWithCloseButton;
