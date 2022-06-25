import React from 'react';
import { Drawer, IconButton } from '@mui/material';
import CancelIcon from '@mui/icons-material/CancelOutlined';

const CommonFormDrawer = ({ isOpen, onClose, formComponent, size, ...rest }) => {
  const className = 'custom-drawer ' + (size || 'medium')
  const [open, setOpen] = React.useState(isOpen);
  const onDrawerClose = () => setOpen(() => {
    if(onClose)
      onClose();
    return false;
  })

  React.useEffect(() => setOpen(isOpen), [isOpen])

  return (
    <Drawer anchor='right' open={open} onClose={onDrawerClose} classes={{paper: className}} hideBackdrop ModalProps={{disableEscapeKeyDown: true}} {...rest}>
      <span style={{position: 'absolute', right: '10px', top: '10px', zIndex: 1}}>
        <IconButton onClick={onDrawerClose} color='secondary'>
          <CancelIcon />
        </IconButton>
      </span>
      { formComponent }
    </Drawer>
  )
}

export default CommonFormDrawer;
