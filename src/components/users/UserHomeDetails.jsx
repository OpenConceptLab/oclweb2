import React from 'react';
import { Divider, CircularProgress, IconButton, Tooltip, Chip } from '@material-ui/core';
import {
  Person as PersonIcon,
  FileCopy as CopyIcon,
  Edit as EditIcon,
} from '@material-ui/icons';
import { includes, startCase, get, merge } from 'lodash';
import APIService from '../../services/APIService';
import {
  formatDate, currentUserToken, formatWebsiteLink, copyToClipboard
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
          <div className='home-icon'>
            <HeaderLogo
              isCircle
              logoURL={logoURL}
              onUpload={onLogoUpload}
              defaultIcon={<PersonIcon style={{width: '120px', height: '120px'}} />}
            />
          </div>
          <h2 style={{marginBottom: '5px'}}>
            {startCase(name)}
            <br />
            <small>{user.username}</small>
          </h2>
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
          <Divider style={{width: '100%'}} />
          <p><strong>Company</strong><br />{user.company || 'N/A'}</p>
          <p><strong>Location</strong><br />{user.location || 'N/A'}</p>
          {
            user.website &&
            <p>
              <strong>Website</strong>
              <br />
              {formatWebsiteLink(user.website)}
            </p>
          }
          <p><strong>Email</strong><br />{user.email}</p>
          <p><strong>Joined</strong><br />{formatDate(user.created_on)}</p>
          <Divider style={{width: '100%'}} />
          {
            token &&
            <p>
              <strong>API Token</strong>
              <Tooltip title="Click to copy Token">
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
        onClose={onEditClick}
        formComponent={
          <UserForm
            loggedIn
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
