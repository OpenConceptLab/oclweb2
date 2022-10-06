import React from 'react';
import alertifyjs from 'alertifyjs';
import { Drawer, IconButton } from '@mui/material';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import { WHITE } from '../../common/constants'

const CommonFormDrawer = ({ isOpen, onClose, formComponent, size, ...rest }) => {
  const className = 'custom-drawer ' + (size || 'medium')
  const [open, setOpen] = React.useState(isOpen);
  const onDrawerClose = (event, reason) => {
    if(['escapeKeyDown', 'backdropClick'].includes(reason)) {
      alertifyjs.confirm('Exit?', 'Are you sure you want to close this?', _close, () => {})
    } else _close();
  }

  const _close = () => setOpen(() => {
    if(onClose)
      onClose();
    return false;
  })

  React.useEffect(() => setOpen(isOpen), [isOpen])

  return (
    <Drawer anchor='right' open={open} onClose={onDrawerClose} classes={{paper: className}} ModalProps={{disableEscapeKeyDown: true}} {...rest}>
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
