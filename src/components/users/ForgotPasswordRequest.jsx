import React from 'react';
import alertifyjs from 'alertifyjs';
import { TextField, Button, Paper } from '@mui/material';
import { set, get } from 'lodash';
import APIService from '../../services/APIService';
import ForgotPasswordEmailSentMessage from './ForgotPasswordEmailSentMessage';
import { getSiteTitle } from '../../common/utils';

const SITE_TITLE = getSiteTitle()

class ForgotPasswordRequest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      success: false,
    }
  }

  setFieldValue(id, value) {
    const newState = {...this.state}
    set(newState, id, value)
    this.setState(newState)
  }

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    if(isFormValid && this.state.email)
      APIService.users().password().appendToUrl('reset/')
                .post({email: this.state.email})
                            .then(response => {
                              if(get(response, 'status') === 200)
                                this.setState({success: true})
                              else
                                alertifyjs.error(`This email is known to ${SITE_TITLE}.`)
                            })
  }

  render() {
    const { email, success } = this.state;
    return (
      <div className='col-md-12' style={{marginTop: '25px'}}>
        <div className='col-md-3' />
        <div className='col-md-6'>
          <Paper style={{padding: '10px'}} className='login-paper'>
            {
              success ?
              <ForgotPasswordEmailSentMessage email={email} /> :
              <React.Fragment>
                <h1>Password Reset</h1>
                <p>
                  Forgotten your password? Enter your email address below, and we will send you an email allowing you to reset it.
                </p>
                <div className='col-md-12 no-side-padding'>
                  <form>
                    <div>
                      <TextField
                        required
                        id='email'
                        label="E-mail"
                        variant="outlined"
                        onChange={event => this.setFieldValue('email', event.target.value)}
                        type='email'
                        fullWidth
                      />
                    </div>
                    <div style={{marginTop: '20px', textAlign: 'center', marginBottom: '20px'}}>
                      <Button onClick={this.onSubmit} type='submit' color='primary' variant='contained'>
                        Reset My Password
                      </Button>
                      <div style={{marginTop: '15px'}}>
                        Please contact us if you have any trouble resetting your password.
                      </div>
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

export default ForgotPasswordRequest;
