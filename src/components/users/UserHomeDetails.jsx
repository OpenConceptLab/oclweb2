import React from 'react';
import { Divider, CircularProgress, IconButton } from '@material-ui/core';
import {
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@material-ui/icons';
import { includes, startCase, get } from 'lodash';
import APIService from '../../services/APIService';
import { formatDate, currentUserToken, formatWebsiteLink} from '../../common/utils';
import HeaderLogo from '../common/HeaderLogo';

const UserHomeDetails = ({ user, isLoading }) => {
  const [logoURL, setLogoURL] = React.useState(user.logo_url)
  const [showToken, setShowToken] = React.useState(false);

  React.useEffect(() => {
    if(user.logo_url)
     setLogoURL(user.logo_url)
  }, [user.logo_url])

  let name = user.name || '';
  if(includes(['none none', '- -'], name.trim()))
    name = '';

  const onLogoUpload = (base64, name) => {
    APIService.new().overrideURL(user.url).appendToUrl('logo/')
              .post({base64: base64, name: name})
              .then(response => {
                if(get(response, 'status') === 200)
                  setLogoURL(get(response, 'data.logo_url', logoURL))
              })
  }
  const token = currentUserToken();

  return (
    <div className="col-md-12 no-side-padding">
      {
        isLoading ?
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
          <h2>
            {startCase(name)}
            <br />
            <small>{user.username}</small>
          </h2>
          <Divider style={{width: '100%'}} />
          <p><strong>Company:</strong><br />{user.company || 'N/A'}</p>
          <p><strong>Location:</strong><br />{user.location || 'N/A'}</p>
          {
            user.website &&
            <p>
              <strong>Website:</strong>
              <br />
              {formatWebsiteLink(user.website)}
            </p>
          }
          <p><strong>Email:</strong><br />{user.email}</p>
          <p><strong>Joined:</strong><br />{formatDate(user.created_on)}</p>
          <Divider style={{width: '100%'}} />
          {
            token &&
            <p>
              <strong>API Token:</strong>
              <IconButton onClick={() => setShowToken(!showToken)}>
                {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
              <br />
              <span style={{fontFamily: 'Courier New', fontWeight: 'bold'}}>
                {showToken && token}
              </span>
            </p>
          }
        </div>
      }
    </div>
  )
}

export default UserHomeDetails;
