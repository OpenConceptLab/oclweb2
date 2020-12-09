import React from 'react';
import alertifyjs from 'alertifyjs';
import { Paper, TextField, Button } from '@material-ui/core';
import { values, map, get } from 'lodash';
import APIService from '../../services/APIService';


class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      serverError: null,
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
        } else if(get(response, 'non_field_errors')) {
          this.setState({serverError: values(response)})
        } else {
          this.setState({serverError: ['Something bad happened!']})
        }
      })
    })
  }

  afterLoginSuccess(token) {
    localStorage.setItem('token', token)
    this.cacheUserData()
  }

  cacheUserData() {
    APIService.user().get().then(response => {
      if(response.status === 200) {
        localStorage.setItem('user', JSON.stringify(response.data))
        alertifyjs.success(`Successfully signed in as ${this.state.username}.`)
        window.location.hash  = '#' + response.data.url
      }

    })
  }

  render() {
    const { serverError } = this.state;
    return (
      <div className='col-md-12' style={{marginTop: '25px'}}>
        <div className='col-md-4' />
        <div className='col-md-4'>
          <Paper style={{padding: '10px'}} className='login-paper'>
            <h1 style={{textAlign: 'center'}}>Sign In</h1>
            {
              serverError &&
              <div className='col-md-12 alert-danger'>
                <ul> {map(serverError, error => (<li key={error}>{error}</li>))} </ul>
              </div>
            }
            <div className='col-md-12 no-side-padding'>
              <form>
                <div>
                  <TextField
                    required
                    id="username"
                    label="Username"
                    variant="outlined"
                    onChange={this.onFieldChange}
                    fullWidth
                  />
                </div>
                <div style={{marginTop: '10px'}}>
                  <TextField
                    required
                    id="password"
                    label="Password"
                    variant="outlined"
                    type="password"
                    onChange={this.onFieldChange}
                    fullWidth
                  />
                </div>
                <div style={{marginTop: '20px', textAlign: 'center', marginBottom: '20px'}}>
                  <Button onClick={this.handleSubmit} type='submit' color='primary' variant='contained'>Sign In</Button>
                </div>
              </form>
            </div>
          </Paper>
        </div>
        <div className='col-md-4' />
      </div>
    )
  }
}

export default Login;
