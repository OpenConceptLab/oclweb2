import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Button, Paper, CircularProgress } from '@mui/material';
import {set, get, map, values} from 'lodash';
import APIService from '../../services/APIService';
import ForgotPasswordSuccessMessage from './ForgotPasswordSuccessMessage';
import PasswordFields from '../common/PasswordFields';
import Captcha from '../common/Captcha';

class ForgotPasswordForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      captcha: null,
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
      validPassword: false,
    }
  }

  componentDidMount() {
    if(this.props.forceReset) {
      this.setState({user: this.props.user, validToken: true, isLoading: false})
    } else {
      this.fetchUser()
    }
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
    const { new_password, confirm_password, token, validPassword } = this.state;

    const isConfirmPasswordSameAsPassword = confirm_password === new_password;
    if(!isConfirmPasswordSameAsPassword) {
      this.setState({serverError: [this.props.t('user.auth.forgot_password_mismatch_error')]})
      return
    }
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    if(isFormValid && isConfirmPasswordSameAsPassword && new_password && token && validPassword) {
      const responseHandler = response => {
        if(get(response, 'status') === 200)
          this.setState({success: true})
        else if (get(response, 'errors'))
          this.setState({serverError: values(response.errors)})
      }
      if(this.props.onSubmit) {
        this.props.onSubmit(new_password, responseHandler)
      } else {
        this.setState({serverError: null}, () => {
          APIService.users().password().appendToUrl('reset/')
            .put({token: token, new_password: new_password})
            .then(responseHandler)
        })
      }
    }
  }

  getNotFoundDOM() {
    const { t } = this.props
    return (
      <React.Fragment>
        <h1 style={{textAlign: 'center'}}>{t('common.not_found')}</h1>
        <p>
          {t('user.auth.password_reset_link_invalid')} {t('common.please')} <Link to="/accounts/password/reset">{t('user.auth.reset_again')}</Link>.
        </p>
      </React.Fragment>
    )
  }

  getInvalidLinkDOM() {
    const { t } = this.props
    return (
      <React.Fragment>
        <h1 style={{textAlign: 'center'}}>{t('common.bad_token')}</h1>
        <p>
          {t('user.auth.password_reset_link_invalid')} {t('common.please')} <Link to="/accounts/password/reset">{t('user.auth.reset_again')}</Link>.
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

  onCaptchaChange = value => this.setState({captcha: value})

  render() {
    const { serverError, success, notFound, validToken, isLoading, new_password, captcha, validPassword } = this.state;
    const { t } = this.props
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
                  <h1>{t('user.auth.change_password')}</h1>
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
                        onBlur={valid => this.setFieldValue('validPassword', valid)}
                      />
                      <div style={{display: 'flex', justifyContent: 'center'}}>
                        <Captcha onChange={this.onCaptchaChange} />
                      </div>
                      <div style={{marginTop: '20px', textAlign: 'center', marginBottom: '20px'}}>
                        <Button disabled={!captcha || !validPassword} onClick={this.onSubmit} type='submit' color='primary' variant='contained'>
                          {t('user.auth.change_password')}
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

export default withTranslation('translations')(ForgotPasswordForm);
