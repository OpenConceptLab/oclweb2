import React from 'react';
import alertifyjs from 'alertifyjs';
import { CircularProgress } from '@mui/material';
import { get } from 'lodash';
import {
  refreshCurrentUserCache
} from '../../common/utils';
import APIService from '../../services/APIService'


class OIDLoginCallback extends React.Component {
  componentDidMount() {
    this.exchangeCodeForToken()
  }

  exchangeCodeForToken = () => {
    const queryParams = new URLSearchParams(this.props.location.search)
    const code = queryParams.get('code')
    if(code) {
      APIService.users().appendToUrl('oidc/code-exchange/').post({code: code, redirect_uri: 'http://localhost:4000'}).then(res => {
        if(res.data?.access_token) {
          localStorage.removeItem('server_configs')
          localStorage.setItem('token', res.data.access_token)
          this.cacheUserData()
        } else {
          alertifyjs.error(res.data)
        }
      })
    }
  }

  cacheUserData() {
    refreshCurrentUserCache(response => {
      alertifyjs.success(`Successfully signed in`)
      let returnToURL = response.data.url
      if(get(this.props, 'location.search')) {
        const queryParams = new URLSearchParams(this.props.location.search)
        if(queryParams && queryParams.get('returnTo'))
          returnToURL = queryParams.get('returnTo')
      }
      window.location.hash  = '#' + returnToURL
    })
  }

  render() {
    return (
      <div>Signing in...</div>
    )
  }
}

export default OIDLoginCallback;
