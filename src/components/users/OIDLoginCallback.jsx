/*eslint no-process-env: 0*/
import React from 'react';
import alertifyjs from 'alertifyjs';
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
    const idToken = queryParams.get('id_token')
    if(code) {
      /*eslint no-undef: 0*/
      const redirectURL = window.LOGIN_REDIRECT_URL || process.env.LOGIN_REDIRECT_URL
      const clientSecret = window.OIDC_RP_CLIENT_SECRET || process.env.OIDC_RP_CLIENT_SECRET
      const clientId = window.OIDC_RP_CLIENT_ID || process.env.OIDC_RP_CLIENT_ID

      APIService.users().appendToUrl('oidc/code-exchange/').post({code: code, redirect_uri: redirectURL, client_id: clientId, client_secret: clientSecret}).then(res => {
        if(res.data?.access_token) {
          localStorage.removeItem('server_configs')
          localStorage.setItem('token', res.data.access_token)
          localStorage.setItem('id_token', idToken)
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
