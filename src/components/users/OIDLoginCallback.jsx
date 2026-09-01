/*eslint no-process-env: 0*/
import React from 'react';
import alertifyjs from 'alertifyjs';
import { get } from 'lodash';
import {
  refreshCurrentUserCache, consumeStoredPKCECodeVerifier, consumeAndValidateOAuthState
} from '../../common/utils';
import APIService from '../../services/APIService'


class OIDLoginCallback extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      next: null
    }
  }
  componentDidMount() {
    this.exchangeCodeForToken()
  }

  exchangeCodeForToken = () => {
    const queryParams = new URLSearchParams(this.props.location.search)
    const code = queryParams.get('code')
    const idToken = queryParams.get('id_token')
    const next = queryParams.get('next')
    const state = queryParams.get('state')
    if(code) {
      /*eslint no-undef: 0*/
      if(!consumeAndValidateOAuthState(state)) {
        alertifyjs.error('Sign-in failed. Please try again.')
        return
      }
      this.setState({next: next && next !== '/' ? next : null }, () => {
        const redirectURL = this.state.next ? window.location.origin + this.state.next : (window.LOGIN_REDIRECT_URL || process.env.LOGIN_REDIRECT_URL)
        const clientId = window.OIDC_RP_CLIENT_ID || process.env.OIDC_RP_CLIENT_ID
        const codeVerifier = consumeStoredPKCECodeVerifier()

        APIService.users().appendToUrl('oidc/code-exchange/').post({code: code, redirect_uri: redirectURL, client_id: clientId, code_verifier: codeVerifier}).then(res => {
          if(res.data?.access_token) {
            localStorage.removeItem('server_configs')
            localStorage.setItem('token', res.data.access_token)
            localStorage.setItem('id_token', idToken)
            this.cacheUserData()
          } else {
            alertifyjs.error(res.data)
          }
        })
      })
    }
  }

  cacheUserData() {
    refreshCurrentUserCache(response => {
      alertifyjs.success(`Successfully signed in`)
      if(this.state.next)
        window.location.hash = '#' + this.state.next
      else {
        let returnToURL = response.data.url
        if(get(this.props, 'location.search')) {
          const queryParams = new URLSearchParams(this.props.location.search)
          if(queryParams && queryParams.get('returnTo'))
            returnToURL = queryParams.get('returnTo')
        }
        window.location.hash  = '#' + returnToURL
      }
    })
  }

  render() {
    return (
      <div>Signing in...</div>
    )
  }
}

export default OIDLoginCallback;
