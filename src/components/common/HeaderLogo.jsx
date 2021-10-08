import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Button, IconButton } from '@mui/material'
import { Edit as EditIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { last } from 'lodash';
import { currentUserHasAccess } from '../../common/utils';
import ImageUploader from './ImageUploader';

const HeaderLogo = ({ logoURL, onUpload, defaultIcon, isCircle, shrink }) => {
  const hasAccess = currentUserHasAccess();
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

  const containerClasses = 'logo-container flex-vertical-center' + (shrink ? ' small' : '')
  const logo = base64 || logoURL

  return (
    <React.Fragment>
      <div className={containerClasses} style={ logo ? {marginLeft : '15px', marginTop: '10px'} : {marginLeft : '15px', height: shrink ? '70px' : '130px'}}>
        {
          logo ?
          <img className='header-logo' src={logo} /> :
          defaultIcon
        }
        {
          hasAccess &&
          <Tooltip arrow title={logoURL ? 'Edit Logo' : 'Upload Logo'}>
            <IconButton
              onClick={() => setOpen(true)}
              className='logo-edit-button'
              color='secondary'
              size="large">
              {
                logoURL ?
                <EditIcon fontSize='small' color='secondary' /> :
                <UploadIcon color='secondary' fontSize='small' />
              }
            </IconButton>
          </Tooltip>
        }
      </div>
      <Dialog onClose={() => setOpen(false)} open={open} fullWidth>
        <DialogTitle>{logoURL ? 'Edit Logo' : 'Upload Logo'}</DialogTitle>
        <DialogContent>
          <ImageUploader onUpload={onLogoUpload} defaultImg={logoURL} defaultName={getExistingLogoName()} isCircle={isCircle} />
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
