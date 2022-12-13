import React from 'react';
import { Divider, CircularProgress, IconButton, Tooltip, Chip } from '@mui/material';
import {
  Person as PersonIcon,
  FileCopy as CopyIcon,
  Edit as EditIcon,
  Business as CompanyIcon,
  LocationOn as LocationIcon,
  Link as WebsiteIcon,
  MailOutline as MailIcon,
  EventAvailable as DateJoinedIcon,
  AdminPanelSettings as AdminIcon,
  PersonOff as UserDisabledIcon,
  PrivacyTip as UnverifiedIcon,
  VerifiedUser as VerifiedIcon,
  SafetyCheck as VerificationPendingIcon,
} from '@mui/icons-material';
import { includes, startCase, get, merge, isEmpty } from 'lodash';
import APIService from '../../services/APIService';
import {
  formatDate, formatWebsiteLink, copyToClipboard, getCurrentUserUsername, isAdminUser, isSuperuser, isSSOEnabled
} from '../../common/utils';
import HeaderLogo from '../common/HeaderLogo';
import CommonFormDrawer from '../common/CommonFormDrawer';
import UserForm from './UserForm';
import UserManagement from './UserManagement';

const UserHomeDetails = ({ user, isLoading, apiToken }) => {
  const [logoURL, setLogoURL] = React.useState(user.logo_url)
  const [uploading, setUploading] = React.useState(false);
  const [editForm, setEditForm] = React.useState(false);
  const onEditClick = () => setEditForm(true);
  const onEditClose = () => setEditForm(false);

  React.useEffect(() => {
    if(user.logo_url)
      setLogoURL(user.logo_url)
  }, [user.logo_url])

  let name = user.name || '';
  if(includes(['none none', '- -'], name.trim()))
    name = '';

  const onLogoUpload = (base64, name) => {
    setUploading(true)
    APIService.new().overrideURL(user.url).appendToUrl('logo/')
      .post({base64: base64, name: name})
      .then(response => {
        if(get(response, 'status') === 200){
          const url = get(response, 'data.logo_url', logoURL)
          setLogoURL(url)
          localStorage.setItem(
            'user',
            JSON.stringify(merge(JSON.parse(localStorage.user), {logo_url: url}))
          )
        }
        setUploading(false)
      })
  }

  const currentUserUsername = getCurrentUserUsername()
  const isSameAsCurrentUser = user.username === currentUserUsername;
  const isSelectedUserSuperuser = user.is_superuser
  const isAdmin = isAdminUser()

  return (
    <div className="col-xs-12 no-side-padding">
      {
        (isLoading || uploading) ?
          <CircularProgress color='primary' style={{marginTop: '50px', marginLeft: '50px'}} /> :
        <div className="col-xs-12 no-side-padding">
          <div className='home-icon' style={{display: 'flex'}}>
            <HeaderLogo
              isCircle
              logoURL={logoURL}
              onUpload={onLogoUpload}
              defaultIcon={<PersonIcon style={{width: '120px', height: '120px'}} />}
            />
          </div>
          <h2 style={{marginBottom: '-2px'}}>
            {startCase(name)}
          </h2>
          <div className='user-home-username flex-vertical-center'>
            <span style={{marginRight: '5px'}}>{user.username}</span>
            {
              isAdmin &&
                <React.Fragment>
                  {
                    user.is_superuser &&
                      <Tooltip title='OCL Super Admin'>
                        <AdminIcon color='success' />
                      </Tooltip>
                  }
                  {
                    user.is_staff && !user.is_superuser &&
                      <Tooltip title='OCL Admin'>
                        <AdminIcon color='success' />
                      </Tooltip>
                  }
                  {
                    user.status === 'deactivated' && !user.is_staff && !user.is_superuser &&
                      <Tooltip title='Deactivated'>
                        <UserDisabledIcon color='error' style={{width: '20px'}} />
                      </Tooltip>
                  }
                  {
                    user.status === 'unverified' && !user.is_staff && !user.is_superuser &&
                      <Tooltip title='Unverified'>
                        <UnverifiedIcon color='warning' style={{width: '20px'}} />
                      </Tooltip>
                  }
                  {
                    user.status === 'verified' && !user.is_staff && !user.is_superuser &&
                      <Tooltip title='Verified'>
                        <VerifiedIcon color='success' style={{width: '20px'}} />
                      </Tooltip>
                  }
                  {
                    user.status === 'verification_pending' && !user.is_staff && !user.is_superuser &&
                      <Tooltip title='Verification Pending'>
                        <VerificationPendingIcon color='warning' style={{width: '20px'}} />
                      </Tooltip>
                  }
                </React.Fragment>
            }
          </div>
          {
            (apiToken || isAdmin) &&
              <div>
                <Chip
                  className='underline-text'
                  icon={<EditIcon fontSize='small' style={{width: '14px'}} />}
                  size='small'
                  label="Edit Profile"
                  style={{border: 'none'}}
                  variant='outlined'
                  color='primary'
                  onClick={onEditClick}
                />
              </div>
          }
          <Divider style={{width: '100%', margin: '5px 0'}} />
          {
            user.company &&
              <div style={{marginTop: '5px'}}>
                <Tooltip title='Company' arrow placement='right'>
                  <span className='flex-vertical-center' placement='right'>
                    <span style={{marginRight: '5px'}}><CompanyIcon fontSize='small' style={{marginTop: '4px'}} /></span>
                    <span>{user.company}</span>
                  </span>
                </Tooltip>
              </div>
          }
          {
            user.location &&
              <div>
                <Tooltip title='Location' arrow placement='right'>
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px'}}><LocationIcon fontSize='small' style={{marginTop: '4px'}} /></span>
                    <span>{user.location}</span>
                  </span>
                </Tooltip>
              </div>
          }
          {
            user.website &&
              <div>
                <Tooltip title='Website' arrow placement='right'>
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px'}}><WebsiteIcon fontSize='small' style={{marginTop: '4px', transform: 'rotate(-30deg)'}} /></span>
                    <span>{formatWebsiteLink(user.website)}</span>
                  </span>
                </Tooltip>
              </div>
          }
          <div>
            <Tooltip title='Email' arrow placement='right'>
              <span className='flex-vertical-center'>
                <span style={{marginRight: '5px'}}><MailIcon fontSize='small' style={{marginTop: '4px'}} /></span>
                <span>{user.email}</span>
              </span>
            </Tooltip>
          </div>
          <div>
            <Tooltip title='Date Joined' arrow placement='right'>
              <span className='flex-vertical-center'>
                <span style={{marginRight: '5px'}}><DateJoinedIcon fontSize='small' style={{marginTop: '4px'}} /></span>
                <span>{formatDate(user.created_on)}</span>
              </span>
            </Tooltip>
          </div>
          {
            apiToken &&
              <React.Fragment>
                <Divider style={{width: '100%', margin: '5px 0'}} />
                <p>
                  <strong>API Token</strong>
                  <Tooltip arrow title="Click to copy Token" placement='right'>
                    <IconButton style={{marginLeft: '10px'}} size="small" onClick={() => copyToClipboard(apiToken, 'Token copied to clipboard!')}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </p>
              </React.Fragment>
          }
          {
            isSuperuser() && !isSameAsCurrentUser && !isEmpty(user) && !isSelectedUserSuperuser && !isSSOEnabled() &&
              <React.Fragment>
                <Divider style={{width: '100%', margin: '5px 0'}} />
                <UserManagement user={user} />
              </React.Fragment>
          }
        </div>
      }
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={editForm}
        onClose={onEditClose}
        formComponent={
          <UserForm
            loggedIn={user.username === getCurrentUserUsername()}
            edit
            reloadOnSuccess
            onCancel={onEditClose} user={user}
          />
        }
      />
    </div>
  )
}

export default UserHomeDetails;
