import React from 'react';
import { Link } from 'react-router-dom';
import alertifyjs from 'alertifyjs';
import { Paper, TextField, Button, Divider, InputAdornment, IconButton } from '@material-ui/core';
import {
  PermIdentity as UserIcon, LockOutlined as LockIcon,
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
} from '@material-ui/icons';
import { values, map, get } from 'lodash';
import APIService from '../../services/APIService';
import {
  refreshCurrentUserCache, getAppliedServerConfig
} from '../../common/utils';
import VerifyEmailMessage from './VerifyEmailMessage';

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

  handleSubmit = event => {
    event.preventDefault()
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

  getTitle = () => `Sign In - ${get(getAppliedServerConfig(), 'name', 'OCL')}`

  render() {
    const { serverError, verificationMsg, email, showPassword } = this.state;
    return (
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
                        label="Username"
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
                        label="Password"
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
                              <IconButton aria-label="Toggle password visibility" onClick={this.handleClickShowPassword}>
                                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </div>
                    <div className='col-md-12 no-side-padding' style={{marginTop: '20px', textAlign: 'center', marginBottom: '20px'}}>
                      <Button onClick={this.handleSubmit} type='submit' color='primary' variant='contained'>Sign In</Button>
                    </div>
                    <div className='col-md-12 no-side-padding flex-vertical-center' style={{justifyContent: 'center'}}>
                      <Link to="/accounts/signup">Sign Up</Link>
                      <Divider orientation="vertical" style={{height: '16px', margin: '0 10px'}}/>
                      <Link to="/accounts/password/reset">Forgot Password?</Link>
                    </div>
                  </form>
                </div>
              </React.Fragment>
            }
          </Paper>
        </div>
        <div className='col-md-3' />
      </div>
    )
  }
}

export default Login;
