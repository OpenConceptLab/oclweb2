import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Button, IconButton } from '@mui/material'
import { Edit as EditIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { last } from 'lodash';
import { currentUserHasAccess } from '../../common/utils';
import ImageUploader from './ImageUploader';

const HeaderLogo = ({ logoURL, onUpload, defaultIcon, isCircle, shrink, className }) => {
  const { t } = useTranslation()
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

  let containerClasses = 'logo-container flex-vertical-center'
  if(className)
    containerClasses += ` ${className}`
  else if(shrink)
    containerClasses += ' small'

  const logo = base64 || logoURL

  return (
    <React.Fragment>
      <div className={containerClasses}>
        {
          logo ?
          <img className='header-logo' src={logo} /> :
          defaultIcon
        }
        {
          hasAccess &&
            <Tooltip arrow title={logoURL ? t('common.logo.tooltip.edit') : t('common.logo.tooltip.add')}>
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
        <DialogTitle>{logoURL ? t('common.logo.dialog.title.edit') : t('common.logo.dialog.title.add')}</DialogTitle>
        <DialogContent>
          <ImageUploader onUpload={onLogoUpload} defaultImg={logoURL} defaultName={getExistingLogoName()} isCircle={isCircle} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default HeaderLogo;
