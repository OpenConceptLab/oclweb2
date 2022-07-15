import React from 'react';
import alertifyjs from 'alertifyjs'
import {
  Button, Tooltip, Switch, FormControlLabel, FormGroup, FormControl,
  Dialog
} from '@mui/material';
import { includes } from 'lodash'
import APIService from '../../services/APIService'
import ForgotPasswordForm from './ForgotPasswordForm';


const UserManagement = ({ user }) => {
  const [status, setStatus] = React.useState(user.status)
  const [isAdmin, setIsAdmin] = React.useState(user.is_staff)
  const [isResetingPassword, setIsResetingPassword] = React.useState(false)
  const isVerified = status === 'verified'
  const isUnverified = includes(['verification_pending', 'unverified'], status)
  const isDeactivated = status === 'deactivated'
  const activateLabel = isDeactivated ? 'Activate' : 'Deactivate'
  const adminToggleLabel = isAdmin ? 'Remove Admin Privileges' : 'Make Admin'
  const userLabel = `<i>${user.name}(${user.username})</i>`
  const onMarkVerified = () => {
    alertifyjs.prompt(
      `Mark Verified ${userLabel}`,
      `This action will mark the user as <i>Verified</i> and will enable the login.<br/><br/><b>Type the username of this user to confirm this action.</b>`,
      '',
      (event, value) => {
        if(!value) {
          alertifyjs.error('Type the username of this user to confirm this action.', 3)
          return false
        }
        if(value !== user.username) {
          alertifyjs.error('Incorrect username entered.', 3)
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
    const message = isUserOriginallyDeactivated ? 'This action will mark the user as active and verified, which will enable the login' : 'This action will mark the is_active=False which will deactivate the user login'
    alertifyjs.prompt(
      `${activateLabel} ${userLabel}`,
      `${message}.<br/><br/><b>Type the username of this user to confirm this action.</b>`,
      '',
      (event, value) => {
        if(!value) {
          alertifyjs.error('Type the username of this user to confirm this action.', 3)
          return false
        }
        if(value !== user.username) {
          alertifyjs.error('Incorrect username entered.', 3)
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
    const message = newIsAdmin ? 'This action will make the user OCL Admin (not superuser).' : 'This action will remove all admin privileges from this user.'
    alertifyjs.prompt(
      `${adminToggleLabel} ${userLabel}`,
      `${message}<br/><br/><b>Type the username of this user to confirm this action.</b>`,
      '',
      (event, value) => {
        if(!value) {
          alertifyjs.error('Type the username of this user to confirm this action.', 3)
          return false
        }
        if(value !== user.username) {
          alertifyjs.error('Incorrect username entered.', 3)
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
        alertifyjs.success('Successfully marked this user verified. Reloading...', 2, () => window.location.reload())
      } else {
        alertifyjs.error('Something bad happened! Reloading to refresh User state.', 2, () => window.location.reload())
      }
    })
  }

  const deactivate = () => {
    APIService.users(user.username).delete().then(response => {
      if(response.status === 204)
        alertifyjs.success('Successfully deactivated this user. Reloading...', 2, () => window.location.reload())
      else
        alertifyjs.error('Something bad happened! Reloading to refresh User state.', 2, () => window.location.reload())
    })
  }

  const activate = () => {
    APIService.users(user.username).appendToUrl('reactivate/').put().then(response => {
      if(response.status === 204)
        alertifyjs.success('Successfully activated this user. Reloading...', 2, () => window.location.reload())
      else
        alertifyjs.error('Something bad happened! Reloading to refresh User state.', 2, () => window.location.reload())
    })
  }

  const toggleAdmin = () => {
    APIService.users(user.username).appendToUrl('staff/').put().then(response => {
      if(response.status === 204)
        alertifyjs.success('Successfully toggle user state. Reloading...', 2, () => window.location.reload())
      else
        alertifyjs.error('Something bad happened! Reloading to refresh User state.', 2, () => window.location.reload())
    })
  }

  const resetPassword = newPassword => {
    APIService.users(user.username).put({password: newPassword}).then(response => {
      setIsResetingPassword(false)
      if(response.status === 200)
        alertifyjs.success('Successfully resetted user password. Reloading...')
      else
        alertifyjs.error('Something bad happened! Reloading to refresh User state.', 2, () => window.location.reload())
    })
  }

  return (
    <div className='col-xs-12 no-side-padding'>
      <FormControl component='fieldset' variant='standard'>
        <h4 style={{margin: '10px 0'}}>User Management</h4>
        <FormGroup>
          <FormControlLabel
            control={
              <Tooltip arrow title="Mark this user as verified. This will allow them to login with there password." placement='right'>
                <span>
                  <Switch checked={isVerified} onChange={onMarkVerified} color='primary' disabled={isDeactivated || !isUnverified}/>
                </span>
              </Tooltip>
            }
            label={<span style={{fontSize: '0.9125rem'}}>Verified</span>}
          />
          <FormControlLabel
            control={
              <Tooltip arrow title={`${activateLabel} this user.`} placement='right'>
                <span>
                  <Switch checked={!isDeactivated} onChange={onActivateToggle} color='primary'/>
                </span>
              </Tooltip>
            }
            label={<span style={{fontSize: '0.9125rem'}}>Activated</span>}
          />
          <FormControlLabel
            control={
              <Tooltip arrow title={adminToggleLabel} placement='right'>
                <span>
                  <Switch checked={isAdmin} onChange={onAdminToggle} color='primary' disabled={!isVerified || isDeactivated} />
                </span>
              </Tooltip>
            }
            label={<span style={{fontSize: '0.9125rem'}}>Admin</span>}
          />
        </FormGroup>
      </FormControl>
      <Tooltip arrow title="Reset this user's password." placement='right'>
        <span>
          <Button color='warning' variant='outlined' size='small' style={{textTransform: 'none', marginRight: '10px'}} onClick={() => setIsResetingPassword(true)} disabled={isDeactivated || !isVerified}>
            Reset Password
          </Button>
        </span>
      </Tooltip>

      {
        isResetingPassword &&
          <Dialog open={isResetingPassword} onClose={() => setIsResetingPassword(false)} maxWidth="md" fullWidth>
            <div className='col-xs-12 no-side-padding' style={{marginBottom: '25px'}}>
              <ForgotPasswordForm match={{params: {user: user.username, token: 'unknown-token'}}} forceReset user={user} onSubmit={resetPassword} />
              </div>
          </Dialog>
      }
    </div>
  )
}

export default UserManagement;
