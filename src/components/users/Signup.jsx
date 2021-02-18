import React from 'react';
import { Link } from 'react-router-dom';
import alertifyjs from 'alertifyjs';
import { TextField, Button, Paper } from '@material-ui/core';
import {set, get, isEmpty, cloneDeep, startCase, map, includes} from 'lodash';
import APIService from '../../services/APIService';
import VerifyEmailMessage from './VerifyEmailMessage';
import PasswordFields from '../common/PasswordFields';
import Captcha from '../common/Captcha';

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldErrors: {},
      serverError: null,
      successMsg: null,
      captcha: null,
      validPassword: false,
      fields: {
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
      }
    }
  }

  setFieldValue(id, value) {
    const newState = {...this.state}
    set(newState, id, value)

    const fieldName = get(id.split('fields.'), '1')
    if(fieldName && !isEmpty(value) && get(newState.fieldErrors, fieldName))
      newState.fieldErrors[fieldName] = null
    this.setState(newState)
  }

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    const fields = cloneDeep(this.state.fields);
    const isConfirmPasswordSameAsPassword = fields.confirm_password === fields.password;
    if(!isConfirmPasswordSameAsPassword) {
      this.setState({serverError: ['Password and Confirm Password must match.']})
      return
    }
    if(this.state.isValidPassword) {
      this.setState({serverError: ['Invalid Password']})
      return
    }


    if(isFormValid && isConfirmPasswordSameAsPassword) {
      this.setState({serverError: null}, () => {
        APIService.users().signup().post(fields).then(response => {
          if(get(response, 'status') === 201) {
            alertifyjs.success('Successfully created.')
            this.setState({successMsg: response.data.detail})
          } else {
            this.setState({fieldErrors: response})
          }
        })
      })
    }
  }

  onCaptchaChange = value => this.setState({captcha: value})

  render() {
    const { fields, fieldErrors, serverError, successMsg, captcha, validPassword } = this.state;
    return (
      <div className='col-md-12' style={{marginTop: '25px'}}>
        <div className='col-md-3' />
        <div className='col-md-6'>
          <Paper style={{padding: '10px'}} className='login-paper'>
            {
              successMsg ?
              <VerifyEmailMessage email={fields.email} message={successMsg} /> :
              <React.Fragment>
                <h1>Sign Up</h1>
                {
                  serverError &&
                  <div className='col-md-12 alert-danger'>
                    <ul> {map(serverError, error => (<li key={error}>{error}</li>))} </ul>
                  </div>
                }
                <div className='col-md-12 no-side-padding'>
                  <form>
                    {
                      map(['first_name', 'last_name', 'username', 'email'], (attr, index) => (
                        <div style={index !== 0 ? {marginTop: '10px'} : {}} key={attr}>
                          <TextField
                            required
                            error={Boolean(get(fieldErrors, attr))}
                            helperText={get(fieldErrors, `${attr}.0`)}
                            id={`fields.${attr}`}
                            label={startCase(attr)}
                            variant="outlined"
                            onChange={event => this.setFieldValue(`fields.${attr}`, event.target.value)}
                            type={attr === "email" ? 'email' : (includes(['password', 'confirm_password'], attr) ? 'password' : 'text') }
                            fullWidth
                          />
                        </div>
                      ))
                    }
                    <PasswordFields
                      onChange={event => this.setFieldValue(event.target.id, event.target.value)}
                      passwordErrors={get(fieldErrors, 'password')}
                      passwordFieldId="fields.password"
                      confirmPasswordFieldId="fields.confirm_password"
                      password={fields.password}
                      onBlur={valid => this.setFieldValue('validPassword', valid)}
                    />
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                      <Captcha onChange={this.onCaptchaChange} />
                    </div>
                    <div style={{marginTop: '20px', textAlign: 'center', marginBottom: '20px'}}>
                      <Button disabled={!captcha || !validPassword} onClick={this.onSubmit} type='submit' color='primary' variant='contained'>Sign Up</Button>
                      <div style={{marginTop: '15px'}}>
                        Already have an account? <Link to="/accounts/login">Sign In</Link>
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

export default Signup;
