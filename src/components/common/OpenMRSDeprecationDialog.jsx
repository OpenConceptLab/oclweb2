import React from 'react'
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material'
import DialogTitleWithCloseButton from './DialogTitleWithCloseButton';

const OpenMRSDeprecationDialog = ({ isOpen }) => {
  const [open, setOpen] = React.useState(isOpen || false);
  const onClose = () => setOpen(false);
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitleWithCloseButton onClose={onClose}>
        The OpenMRS Dictionary Manager is going away!
      </DialogTitleWithCloseButton>
      <DialogContent>
        <p>
          The <b>OpenMRS Dictionary Manager</b> was deprecated as of March 2023 and is no longer available. Dictionary managers are now encouraged to use the OCL TermBrowser to manage their concept dictionaries. Your user account and data from the OpenMRS Dictionary Manager were unaffected and are available here in the OCL TermBrowser, so you can pick up right where you left off.
        </p>
        <p>
          For more information, see the full announcement here: <a href="https://openconceptlab.org/2023/03/01/deprecating-the-openmrs-dictionary-manager/" rel="noreferrer noopener" target='_blank'>Deprecating the OpenMRS Dictionary Manager and Transitioning to the OCL TermBrowser.</a>
        </p>
        <p>
          If you are new to the OCL TermBrowser, we recommend reading our guide for <a href="https://openconceptlab.org/2023/03/13/using-ocl-for-openmrs-concept-dictionary-management/" rel="noreferrer noopener" target='_blank'>Using OCL for OpenMRS Concept Dictionary Management</a>.
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ok</Button>
      </DialogActions>
    </Dialog>
  )
}

export default OpenMRSDeprecationDialog;
