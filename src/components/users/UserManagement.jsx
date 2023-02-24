import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import alertifyjs from 'alertifyjs'
import {
  Button, Tooltip, Switch, FormControlLabel, FormGroup, FormControl, Dialog
} from '@mui/material';
import { includes } from 'lodash'
import APIService from '../../services/APIService'
import ForgotPasswordForm from './ForgotPasswordForm';
import ConceptContainerDelete from '../common/ConceptContainerDelete';


const UserManagement = ({ user }) => {
  const { t } = useTranslation()
  const [status, setStatus] = React.useState(user.status)
  const [isAdmin, setIsAdmin] = React.useState(user.is_staff)
  const [isResettingPassword, setIsResettingPassword] = React.useState(false)
  const [isHardDelete, setIsHardDelete] = React.useState(false)
  const isVerified = status === 'verified'
  const isUnverified = includes(['verification_pending', 'unverified'], status)
  const isDeactivated = status === 'deactivated'
  const activateLabel = isDeactivated ? t('common.activate') : t('common.deactivate')
  const adminToggleLabel = isAdmin ? t('user.home.management.remove_admin_privileges') : t('user.home.management.make_admin')
  const userLabel = `<i>${user.name}(${user.username})</i>`
  const usernameConfirmationMessage = t('user.home.management.username_confirmation_message')
  const usernameIncorrectMessage = t('user.home.management.username_incorrect_message')
  const genericError = t('user.home.management.generic_error')

  const onMarkVerified = () => {
    alertifyjs.prompt(
      t('user.home.management.mark_verified.title', {userLabel: userLabel}),
      t('user.home.management.mark_verified.body'),
      '',
      (event, value) => {
        if(!value) {
          alertifyjs.error(usernameConfirmationMessage, 3)
          return false
        }
        if(value !== user.username) {
          alertifyjs.error(usernameIncorrectMessage, 3)
          return false
        }
        setStatus('verified')
        markVerified()
      },
      () => {}
    )
  }
  const onActivateToggle = () => {
    const isUserOriginallyDeactivated = user.status === 'deactivated'
    const message = isUserOriginallyDeactivated ? t('user.home.management.activate.message') : t('user.home.management.deactivate.message')
    alertifyjs.prompt(
      `${activateLabel} ${userLabel}`,
      `${message}.<br/><br/><b>${usernameConfirmationMessage}</b>`,
      '',
      (event, value) => {
        if(!value) {
          alertifyjs.error(usernameConfirmationMessage, 3)
          return false
        }
        if(value !== user.username) {
          alertifyjs.error(usernameIncorrectMessage, 3)
          return false
        }
        setStatus(isUserOriginallyDeactivated ? 'verified' : 'deactivated')
        isUserOriginallyDeactivated ? activate() : deactivate()
      },
      () => {}
    )
  }

  const onAdminToggle = () => {
    const newIsAdmin = !isAdmin
    const message = newIsAdmin ? t('user.home.management.mark_admin.message') : t('user.home.management.unmark_admin.message')
    alertifyjs.prompt(
      `${adminToggleLabel} ${userLabel}`,
      `${message}<br/><br/><b>${usernameConfirmationMessage}</b>`,
      '',
      (event, value) => {
        if(!value) {
          alertifyjs.error(usernameConfirmationMessage, 3)
          return false
        }
        if(value !== user.username) {
          alertifyjs.error(usernameIncorrectMessage, 3)
          return false
        }
        setIsAdmin(newIsAdmin)
        toggleAdmin()
      },
      () => {}
    )
  }

  const markVerified = () => {
    APIService.users(user.username).appendToUrl('verify/unknown-token/').get().then(response => {
      if(response.status === 200) {
        alertifyjs.success(t('user.home.management.mark_verified.success'), 2, () => window.location.reload())
      } else {
        alertifyjs.error(genericError, 2, () => window.location.reload())
      }
    })
  }

  const deactivate = () => {
    APIService.users(user.username).delete().then(response => {
      if(response.status === 204)
        alertifyjs.success(t('user.home.management.deactivate.success'), 2, () => window.location.reload())
      else
        alertifyjs.error(genericError, 2, () => window.location.reload())
    })
  }

  const onHardDelete = () => {
    APIService.users(user.username).appendToUrl('?hardDelete=true').delete().then(response => {
      if(response.status === 204)
        alertifyjs.success(t('user.home.management.hard_delete.success'), 2, () => window.location.hash = '/search/?type=users')
      else
        alertifyjs.error(genericError, 2, () => window.location.reload())
    })
  }

  const activate = () => {
    APIService.users(user.username).appendToUrl('reactivate/').put().then(response => {
      if(response.status === 204)
        alertifyjs.success(t('user.home.management.activate.success'), 2, () => window.location.reload())
      else
        alertifyjs.error(genericError, 2, () => window.location.reload())
    })
  }

  const toggleAdmin = () => {
    APIService.users(user.username).appendToUrl('staff/').put().then(response => {
      if(response.status === 204)
        alertifyjs.success(t('user.home.management.mark_admin.success'), 2, () => window.location.reload())
      else
        alertifyjs.error(genericError, 2, () => window.location.reload())
    })
  }

  const resetPassword = newPassword => {
    APIService.users(user.username).put({password: newPassword}).then(response => {
      setIsResettingPassword(false)
      if(response.status === 200)
        alertifyjs.success(t('user.home.management.reset_password.success'))
      else
        alertifyjs.error(genericError, 2, () => window.location.reload())
    })
  }

  return (
    <div className='col-xs-12 no-side-padding'>
      <fieldset style={{border: `1px solid rgba(255, 129, 130, 0.4)`, width: '100%', borderRadius: '4px'}}>
        <legend style={{color: 'rgba(255, 129, 130)', fontStyle: 'italic'}}>&nbsp; {t('user.home.management.title')} &nbsp;</legend>

        <FormControl component='fieldset' variant='standard'>
          <h4 style={{margin: '4px 0'}}>{t('user.home.management.header')}</h4>
          <FormGroup>
            <FormControlLabel
              control={
                <Tooltip arrow title={t('user.home.management.tooltip.mark_verified')} placement='right'>
                  <span>
                    <Switch checked={isVerified} onChange={onMarkVerified} color='primary' disabled={isDeactivated || !isUnverified}/>
                  </span>
                </Tooltip>
              }
              label={<span style={{fontSize: '0.9125rem'}}>{t('user.home.management.mark_verified.label')}</span>}
            />
            <FormControlLabel
              control={
                <Tooltip arrow title={t('user.home.management.tooltip.activate', {activate_or_deactivate: activateLabel})} placement='right'>
                  <span>
                    <Switch checked={!isDeactivated} onChange={onActivateToggle} color='primary'/>
                  </span>
                </Tooltip>
              }
              label={<span style={{fontSize: '0.9125rem'}}>{t('user.home.management.activate.label')}</span>}
            />
            <FormControlLabel
              control={
                <Tooltip arrow title={adminToggleLabel} placement='right'>
                  <span>
                    <Switch checked={isAdmin} onChange={onAdminToggle} color='primary' disabled={!isVerified || isDeactivated} />
                  </span>
                </Tooltip>
              }
              label={<span style={{fontSize: '0.9125rem'}}>{t('common.admin')}</span>}
            />
          </FormGroup>
        </FormControl>
        <Tooltip arrow title={t('user.home.management.tooltip.reset_password')} placement='right'>
          <span>
            <Button color='error' variant={isResettingPassword ? 'contained' : 'outlined'} size='small' style={{textTransform: 'none', marginRight: '10px'}} onClick={() => setIsResettingPassword(true)} disabled={isDeactivated || !isVerified}>
              {t('user.home.management.reset_password.label')}
            </Button>
          </span>
        </Tooltip>

        <Tooltip arrow title={t('user.home.management.tooltip.hard_delete')} placement='right'>
          <span>
            <Button color='error' variant={isHardDelete ? 'contained' : 'outlined'} size='small' style={{textTransform: 'none'}} onClick={() => setIsHardDelete(true)}>
              {t('user.home.management.hard_delete.label')}
            </Button>
          </span>
        </Tooltip>

        {
          isResettingPassword &&
            <Dialog open={isResettingPassword} onClose={() => setIsResettingPassword(false)} maxWidth="md" fullWidth>
              <div className='col-xs-12 no-side-padding' style={{marginBottom: '25px'}}>
                <ForgotPasswordForm match={{params: {user: user.username, token: 'unknown-token'}}} forceReset user={user} onSubmit={resetPassword} />
              </div>
            </Dialog>
        }
        {
          isHardDelete &&
            <ConceptContainerDelete
              open={isHardDelete}
              resource={{...user, short_code: user.username}}
              onClose={() => setIsHardDelete(false)}
              associatedResources={['organizations', 'sources', 'collections']}
              associationRelation='owned'
              onDelete={onHardDelete}
              summaryContent={
                <React.Fragment>
                  <p>{t('user.this_user_own')}:</p>
                  <ul>
                    <li>{t('common.resoures.orgs')}: {user.owned_orgs}</li>
                    <li>{t('common.resoures.sources')}: {user.sources}</li>
                    <li>{t('common.resoures.collections')}: {user.collections}</li>
                  </ul>
                </React.Fragment>
              }
            />
        }
      </fieldset>
    </div>
  )
}

export default UserManagement;
