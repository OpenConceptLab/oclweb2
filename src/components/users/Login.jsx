import 'core-js/features/url-search-params';
import React from 'react';
import { Link } from 'react-router-dom';
import alertifyjs from 'alertifyjs';
import { Paper, TextField, Button, Divider, InputAdornment, IconButton } from '@mui/material';
import {
  PermIdentity as UserIcon, LockOutlined as LockIcon,
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { values, map, get } from 'lodash';
import APIService from '../../services/APIService';
import {
  refreshCurrentUserCache, getAppliedServerConfig, isSSOEnabled, getLoginURL
} from '../../common/utils';
import VerifyEmailMessage from './VerifyEmailMessage';
import { withTranslation } from 'react-i18next';

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: null,
      verificationMsg: null,
      username: '',
      password: '',
      serverError: null,
      showPassword: false,
    }
  }

  componentDidMount() {
    if(isSSOEnabled()) {
      const queryString = new URLSearchParams(window.location.hash.split('?')[1])
      window.location = getLoginURL((queryString.get('next') || '').replace('#', ''))
    }
  }

  handleSubmit = event => {
    event.preventDefault()
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const { username, password } = this.state;
    if(username && password)
      this.handleLogin(username, password)
    return false
  }

  onFieldChange = event => {
    this.setState({[event.target.id]: event.target.value})
  }

  handleLogin(username, password) {
    this.setState({serverError: null}, () => {
      APIService.users().login().post({username: username, password: password}).then(response => {
        if(get(response, 'status') === 200 && get(response, 'data.token')) {
          this.afterLoginSuccess(response.data.token)
        } else if(get(response, 'detail', '').match('verification email')) {
          this.setState({verificationMsg: response.detail, email: get(response, 'email')})
        } else if(get(response, 'detail', '').match('deactivated')) {
          this.setState({serverError: [response.detail]})
        } else if(get(response, 'non_field_errors')) {
          this.setState({serverError: values(response)})
        } else {
          this.setState({serverError: ['Something bad happened!']})
        }
      })
    })
  }

  afterLoginSuccess(token) {
    localStorage.removeItem('server_configs')
    localStorage.setItem('token', token)
    this.cacheUserData()
  }

  cacheUserData() {
    refreshCurrentUserCache(response => {
      alertifyjs.success(`Successfully signed in as ${this.state.username}.`)
      let returnToURL = response.data.url
      if(get(this.props, 'location.search')) {
        const queryParams = new URLSearchParams(this.props.location.search)
        if(queryParams && queryParams.get('returnTo'))
          returnToURL = queryParams.get('returnTo')
      }
      window.location.hash  = '#' + returnToURL
    })
  }

  handleClickShowPassword = () => this.setState({showPassword: !this.state.showPassword})

  getTitle = () => `${this.props.t('user.auth.sign_in')} - ${get(getAppliedServerConfig(), 'name', 'OCL')}`

  render() {
    const { serverError, verificationMsg, email, showPassword } = this.state;
    const { t } = this.props
    return (isSSOEnabled() ?
      <p>Redirecting...</p> :
      <div className='col-md-12' style={{marginTop: '25px'}}>
        <div className='col-md-3' />
        <div className='col-md-6'>
          <Paper style={{padding: '10px'}} className='login-paper'>
            {

              verificationMsg ?
              <VerifyEmailMessage message={verificationMsg} email={email} />:
              <React.Fragment>
                <h1 style={{textAlign: 'center'}}>{this.getTitle()}</h1>
                {
                  serverError &&
                  <div className='col-md-12 alert-danger'>
                    <ul> {map(serverError, error => (<li key={error}>{error}</li>))} </ul>
                  </div>
                }
                <div className='col-md-12 no-side-padding'>
                  <form>
                    <div className='col-md-12 no-side-padding'>
                      <TextField
                        required
                        id="username"
                        label={t('user.auth.username')}
                        variant="outlined"
                        onChange={this.onFieldChange}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <UserIcon style={{color: "#999999"}} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>
                    <div className='col-md-12 no-side-padding' style={{marginTop: '10px'}}>
                      <TextField
                        required
                        id="password"
                        label={t('user.auth.password')}
                        variant="outlined"
                        type={showPassword ? 'text' : 'password'}
                        onChange={this.onFieldChange}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon style={{color: "#999999"}} />
                            </InputAdornment>
                          ),
                          endAdornment:(
                            <InputAdornment position="end">
                              <IconButton
                                onClick={this.handleClickShowPassword}
                                size="large">
                                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </div>
                    <div className='col-md-12 no-side-padding' style={{marginTop: '20px', textAlign: 'center', marginBottom: '20px'}}>
                      <Button onClick={this.handleSubmit} type='submit' color='primary' variant='contained'>{t('user.auth.sign_in')}</Button>
                    </div>
                    <div className='col-md-12 no-side-padding flex-vertical-center' style={{justifyContent: 'center'}}>
                      <Link to="/accounts/signup">{t('user.auth.sign_up')}</Link>
                      <Divider orientation="vertical" style={{height: '16px', margin: '0 10px'}}/>
                      <Link to="/accounts/password/reset">{t('user.auth.forgot_password')}</Link>
                    </div>
                  </form>
                </div>
              </React.Fragment>
            }
          </Paper>
        </div>
        <div className='col-md-3' />
      </div>
    );
  }
}

export default withTranslation('translations')(Login);
