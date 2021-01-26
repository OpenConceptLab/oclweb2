import React from 'react';
import MuiAlert from '@material-ui/lab/Alert';

const ForgotPasswordEmailSentMessage = ({ email }) => {
  return (
    <div className='col-md-12' style={{padding: '10px'}}>
      <div style={{marginBottom: '10px'}}>
        {
          email &&
          <MuiAlert elevation={6} variant="filled" severity="success">
            { `Password reset e-mail sent to ${email}.` }
          </MuiAlert>
        }
      </div>
      <h1>Password Reset</h1>
      <div className='col-md-12 no-side-padding'>
        We have sent you an email. Please contact us if you do not receive it within a few minutes.
      </div>
    </div>
  )
}

export default ForgotPasswordEmailSentMessage;
