import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Button, IconButton } from '@material-ui/core'
import { Edit as EditIcon, CloudUpload as UploadIcon } from '@material-ui/icons';
import { last } from 'lodash';
import ImageUploader from './ImageUploader';

const HeaderLogo = ({ logoURL, onUpload, defaultIcon }) => {
  const [base64, setBase64] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const onLogoUpload = (base64, name) => {
    setOpen(false);
    setBase64(base64)
    onUpload(base64, name)
  }

  const getExistingLogoName = () => {
    if(!logoURL)
      return

    return last(logoURL.split('/'))
  }

  return (
    <React.Fragment>
      <div className='logo-container flex-vertical-center'>
        {
          (base64 || logoURL) ?
          <img className='header-logo' src={base64 || logoURL} /> :
          defaultIcon
        }
        <Tooltip title={logoURL ? 'Edit Logo' : 'Upload Logo'}>
          <IconButton onClick={() => setOpen(true)} className='logo-edit-button' color='secondary'>
            {
              logoURL ?
              <EditIcon fontSize='small' color='secondary' /> :
              <UploadIcon color='secondary' fontSize='small' />
            }
          </IconButton>
        </Tooltip>
      </div>
      <Dialog onClose={() => setOpen(false)} open={open} fullWidth>
        <DialogTitle>{logoURL ? 'Edit Logo' : 'Upload Logo'}</DialogTitle>
        <DialogContent>
          <ImageUploader onUpload={onLogoUpload} defaultImg={logoURL} defaultName={getExistingLogoName()} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default HeaderLogo;
