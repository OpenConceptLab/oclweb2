import React from 'react';
import { Divider, CircularProgress } from '@material-ui/core';
import { includes, startCase } from 'lodash';
import { formatDate } from '../../common/utils';

const UserHomeDetails = ({ user, token, isLoading }) => {
  let name = user.name || '';
  if(includes(['none none', '- -'], name.trim()))
    name = '';

  return (
    <div className="col-md-12 no-side-padding">
      {
        isLoading ?
        <CircularProgress color='primary' style={{marginTop: '50px', marginLeft: '50px'}} /> :
        <div className="col-md-12 no-side-padding">
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
              <a href={user.website} target="_blank" rel="noopener noreferrer">{user.website}</a>
            </p>
          }
          <p><strong>Email:</strong><br />{user.email}</p>
          <p><strong>Joined:</strong><br />{formatDate(user.created_on)}</p>
          <Divider style={{width: '100%'}} />
          {
            token &&
            <p><strong>API Token:</strong><br />{token}</p>
          }
        </div>
      }
    </div>
  )
}

export default UserHomeDetails;
