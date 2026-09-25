/*eslint no-process-env: 0*/
import React from 'react';
import alertifyjs from 'alertifyjs';
import { get } from 'lodash';
import {
  refreshCurrentUserCache, consumeStoredPKCECodeVerifier, consumeAndValidateOAuthState,
  isSignupOAuthState, isLoggedIn
} from '../../common/utils';
import APIService from '../../services/APIService'
import GAService from '../../services/GAService'


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
    const next = queryParams.get('next')
    const state = queryParams.get('state')
    if(code) {
      /*eslint no-undef: 0*/
      const isStateValid = consumeAndValidateOAuthState(state)
      const codeVerifier = consumeStoredPKCECodeVerifier()
      if(!isStateValid || !codeVerifier) {
        this.onSignInStartedElsewhere(state, next)
        return
      }
      this.setState({next: next && next !== '/' ? next : null }, () => {
        const redirectURL = this.state.next ? window.location.origin + this.state.next : (window.LOGIN_REDIRECT_URL || process.env.LOGIN_REDIRECT_URL)
        const clientId = window.OIDC_RP_CLIENT_ID || process.env.OIDC_RP_CLIENT_ID

        APIService.users().appendToUrl('oidc/code-exchange/').post({code: code, redirect_uri: redirectURL, client_id: clientId, code_verifier: codeVerifier}).then(res => {
          if(res.data?.access_token) {
            GAService.recordSignupComplete()
            localStorage.removeItem('server_configs')
            localStorage.setItem('token', res.data.access_token)
            localStorage.setItem('id_token', res.data.id_token)
            this.cacheUserData()
          } else {
            GAService.clearSignupFlow()
            alertifyjs.error(res.data)
          }
        })
      })
    }
  }

  // Keycloak finished a sign-in this tab didn't start: the email-verification or password-reset link opened
  // in a new tab, or an old callback URL reopened. With no PKCE verifier here the code can't be redeemed, so
  // drop it and let the user sign in normally. Sign-up, verification and sign-in stay separate steps.
  onSignInStartedElsewhere = (state, next) => {
    const isSignup = isSignupOAuthState(state)
    if(isSignup)
      GAService.recordSignupVerified()
    if(!isLoggedIn()) {
      const signIn = '<a href="#/signin" style="color: inherit; text-decoration: underline;">Sign in</a> to continue.'
      if(isSignup)
        alertifyjs.success(`Your email is verified. ${signIn}`, 0)
      else
        alertifyjs.message(signIn, 0)
    }
    window.location.hash = '#' + (next || '/')
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
