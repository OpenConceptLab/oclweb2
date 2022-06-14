import React from 'react';
import { Drawer } from '@mui/material';

const CommonFormDrawer = ({ isOpen, onClose, formComponent, size, ...rest }) => {
  const className = 'custom-drawer ' + (size || 'medium')
  const [open, setOpen] = React.useState(isOpen);
  const onDrawerClose = () => {
    if(onClose)
      onClose();
    else
      setOpen(false)
  }

  React.useEffect(() => setOpen(isOpen), [isOpen])

  return (
    <Drawer anchor='right' open={open} onClose={onDrawerClose} classes={{paper: className}} {...rest}>
      { formComponent }
    </Drawer>
  )
}

export default CommonFormDrawer;
