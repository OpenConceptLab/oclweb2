import React from 'react';
import { Drawer } from '@material-ui/core';

const CommonFormDrawer = ({ isOpen, onClose, formComponent, size, ...rest }) => {
  const className = 'custom-drawer ' + (size || 'medium')
  const [open, setOpen] = React.useState(isOpen);
  const onDrawerClose = () => setOpen(() => {
    onClose(); return false;
  })

  React.useEffect(() => setOpen(isOpen), [isOpen])

  return (
    <Drawer anchor='right' open={open} onClose={onDrawerClose} classes={{paper: className}} {...rest}>
      { formComponent }
    </Drawer>
  )
}

export default CommonFormDrawer;
