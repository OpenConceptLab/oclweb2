import React from 'react';
import alertifyjs from 'alertifyjs';
import ReactSuggestionBox from 'react-suggestion-box';
import { TextField } from '@material-ui/core';
import { ReportProblem as Icon } from '@material-ui/icons';
import Captcha from './Captcha';
import { isLoggedIn } from '../../common/utils';
import { WHITE } from '../../common/constants';
import APIService from '../../services/APIService';


const Feedback = props => {
  const isAuth = isLoggedIn();
  const [name, setName] = React.useState(undefined)
  const [email, setEmail] = React.useState(undefined)
  const [captcha, setCaptcha] = React.useState(undefined)

  const getStartControls = () => {
    if(isAuth)
      return null;
    return (
      <div className='col-md-12 no-side-padding'>
        <TextField
          id='feedback-name'
          style={{marginBottom: '10px', background: WHITE}}
          required
          label="Name"
          variant="outlined"
          fullWidth
          onChange={event => setName(event.target.value)}
        />
        <TextField
          id='feedback-email'
          style={{marginBottom: '10px', background: WHITE}}
          label="Email"
          variant="outlined"
          fullWidth
          onChange={event => setEmail(event.target.value)}
          required
          type='email'
        />
      </div>
    )
  }

  const getEndControls = () => {
    if(isAuth)
      return null;

    return (
      <div className='col-md-12 no-side-padding' style={{marginTop: '10px'}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Captcha onChange={ value => setCaptcha(value) } />
        </div>
      </div>

    );
  }

  const sendFeedback = data => APIService.feedback().post(data).then(() => alertifyjs.success('Successfully submit feedback!'));

  const onSubmit = data => {
    if(isAuth)
      sendFeedback(data);
    else {
      if(!name) {
        document.getElementById('feedback-name').reportValidity()
        return
      }
      if(!email) {
        document.getElementById('feedback-email').reportValidity()
        return
      }

      sendFeedback({...data, name: name, email: email})
    }
  }

  const triggerValidity = () => {
    if(isAuth)
      return true

    const isNameValid = document.getElementById('feedback-name').reportValidity()
    if(isNameValid)
      return document.getElementById('feedback-email').reportValidity()

    return isNameValid
  }

  const isSendDisabled = !isAuth && !captcha;

  return (
    <ReactSuggestionBox
      startControls={getStartControls()}
      endControls={getEndControls()}
      onSubmit={onSubmit}
      isSendDisabled={isSendDisabled}
      beforeSendValidator={triggerValidity}
      icon={<Icon />}
      title='Provide Feedback/Suggestion'
      buttonTooltipText='Feedback'
      {...props}
    />
  );
}

export default Feedback;
