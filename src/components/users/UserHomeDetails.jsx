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
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { includes, startCase, get, merge } from 'lodash';
import APIService from '../../services/APIService';
import {
  formatDate, currentUserToken, formatWebsiteLink, copyToClipboard, getCurrentUserUsername
} from '../../common/utils';
import HeaderLogo from '../common/HeaderLogo';
import CommonFormDrawer from '../common/CommonFormDrawer';
import UserForm from './UserForm';

const UserHomeDetails = ({ user, isLoading }) => {
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
  const token = currentUserToken();

  return (
    <div className="col-md-12 no-side-padding">
      {
        (isLoading || uploading) ?
        <CircularProgress color='primary' style={{marginTop: '50px', marginLeft: '50px'}} /> :
        <div className="col-md-12 no-side-padding">
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
            {user.username}
            {
              user.is_superuser &&
              <Tooltip title='OCL Super Admin'>
                <AdminIcon />
              </Tooltip>
            }
            {
              user.is_staff && !user.is_superuser &&
              <Tooltip title='OCL Admin'>
                <AdminIcon />
              </Tooltip>
            }
          </div>
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
          <Divider style={{width: '100%', margin: '5px 0'}} />
          {
            token &&
            <p>
              <strong>API Token</strong>
              <Tooltip arrow title="Click to copy Token" placement='right'>
                <IconButton style={{marginLeft: '10px'}} size="small" onClick={() => copyToClipboard(token, 'Token copied to clipboard!')}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </p>
          }
        </div>
      }
      <CommonFormDrawer
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
