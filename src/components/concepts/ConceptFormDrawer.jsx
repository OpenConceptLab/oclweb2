import React from 'react';
import { Drawer } from '@material-ui/core';
import ConceptForm from './ConceptForm';

const ConceptFormDrawer = ({isOpen, onClose, parentURL, ...rest}) => {
  const [open, setOpen] = React.useState(isOpen);
  const onDrawerClose = () => {
    setOpen(() => {
      onClose()
      return false;
    })
  }

  React.useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  return (
    <Drawer anchor='right' open={open} onClose={onDrawerClose} className="custom-drawer medium">
      <ConceptForm onCancel={onDrawerClose} parentURL={parentURL} {...rest} />
    </Drawer>
  )
}

export default ConceptFormDrawer;
