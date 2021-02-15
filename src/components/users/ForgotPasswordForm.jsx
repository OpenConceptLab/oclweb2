import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Paper, CircularProgress } from '@material-ui/core';
import {set, get, map, values} from 'lodash';
import APIService from '../../services/APIService';
import ForgotPasswordSuccessMessage from './ForgotPasswordSuccessMessage';
import PasswordFields from '../common/PasswordFields';

class ForgotPasswordForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.match.params.user,
      token: props.match.params.token,
      user: null,
      validToken: true,
      notFound: false,
      isLoading: true,
      serverError: null,
      new_password: '',
      confirm_password: '',
      success: false,
    }
  }

  componentDidMount() {
    this.fetchUser()
  }


  fetchUser() {
    const { username } = this.state
    APIService.users(username).get(null, null, {includeVerificationToken: true})
                             .then(response => {
                               if(get(response, 'detail') === 'Not found.')
                                 this.setState({notFound: true, isLoading: false})
                               else {
                                 this.setState({
                                   user: response.data,
                                   isLoading: false,
                                   validToken: this.state.token === response.data.verification_token
                                 })
                               }
                             })
  }

  setFieldValue(id, value) {
    const newState = {...this.state}
    set(newState, id, value)
    this.setState(newState)
  }

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();
    const { new_password, confirm_password, token } = this.state;

    const isConfirmPasswordSameAsPassword = confirm_password === new_password;
    if(!isConfirmPasswordSameAsPassword) {
      this.setState({serverError: ['New Password and Confirm Password must match.']})
      return
    }
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    if(isFormValid && isConfirmPasswordSameAsPassword && new_password && token)
      this.setState({serverError: null}, () => {
        APIService.users().password().appendToUrl('reset/')
                  .put({token: token, new_password: new_password})
                  .then(response => {
                    if(get(response, 'status') === 200)
                      this.setState({success: true})
                    else if (get(response, 'errors'))
                      this.setState({serverError: values(response.errors)})
                  })
      })
  }

  getNotFoundDOM() {
    return (
      <React.Fragment>
        <h1 style={{textAlign: 'center'}}>Not Found</h1>
        <p>
          The password reset link was invalid, possibly because it has already been used. Please request a <Link to="/accounts/password/reset">new password reset</Link>.
        </p>
      </React.Fragment>
    )
  }

  getInvalidLinkDOM() {
    return (
      <React.Fragment>
        <h1 style={{textAlign: 'center'}}>Bad Token</h1>
        <p>
          The password reset link was invalid, possibly because it has already been used. Please request a <Link to="/accounts/password/reset">new password reset</Link>.
        </p>

      </React.Fragment>
    )
  }

  getDOM() {
    const { notFound, validToken, success } = this.state;
    if(notFound)
      return this.getNotFoundDOM()
    if(!validToken)
      return this.getInvalidLinkDOM()
    if(success)
      return <ForgotPasswordSuccessMessage />;
  }

  render() {
    const { serverError, success, notFound, validToken, isLoading, new_password } = this.state;
    return (
      <div className='col-md-12' style={{marginTop: '25px'}}>
        <div className='col-md-3' />
        <div className='col-md-6'>
          {
            isLoading ?
            <CircularProgress /> :
            <Paper style={{padding: '10px'}} className='login-paper'>
              {
                (success || notFound || !validToken) ?
                this.getDOM() :

                <React.Fragment>
                  <h1>Change Password</h1>
                  {
                    serverError &&
                    <div className='col-md-12 alert-danger'>
                      <ul> {map(serverError, error => (<li key={error}>{error}</li>))} </ul>
                    </div>
                  }
                  <div className='col-md-12 no-side-padding'>
                    <form>
                      <PasswordFields
                        onChange={event => this.setFieldValue(event.target.id, event.target.value)}
                        passwordFieldId="new_password"
                        confirmPasswordFieldId="confirm_password"
                        password={new_password}
                      />
                      <div style={{marginTop: '20px', textAlign: 'center', marginBottom: '20px'}}>
                        <Button onClick={this.onSubmit} type='submit' color='primary' variant='contained'>
                          Change Password
                        </Button>
                      </div>
                    </form>
                  </div>
                </React.Fragment>
              }
            </Paper>
          }
        </div>
        <div className='col-md-3' />
      </div>
    )
  }
}

export default ForgotPasswordForm;
