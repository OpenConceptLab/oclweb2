import React from 'react';
import { Drawer, IconButton } from '@mui/material';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import { WHITE } from '../../common/constants'

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
    <span style={{position: 'fixed', right: '10px', top: '75px', zIndex: '2000', background: WHITE}}>
        <IconButton onClick={onDrawerClose} color='secondary'>
          <CancelIcon />
        </IconButton>
      </span>
      { formComponent }
    </Drawer>
  )
}

export default CommonFormDrawer;
