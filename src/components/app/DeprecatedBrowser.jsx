import React from 'react'
import { Snackbar, Alert } from '@mui/material'

const MESSAGE = "OCL TermBrowser doesn't support IE/Opera. For best experience please use "

const DeprecatedBrowser = ({ open, onClose }) => (
  <Snackbar open={open} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
    <Alert severity="error" onClose={onClose}>
      {MESSAGE}
      <a href='https://www.google.com/intl/en_in/chrome/' target='_blank' rel='noopener noreferrer'>
        Chrome Browser
      </a>
    </Alert>
  </Snackbar>
);

export default DeprecatedBrowser
