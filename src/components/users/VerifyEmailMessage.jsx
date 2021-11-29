import React from 'react';
import MuiAlert from '@mui/material/Alert';

const VerifyEmailMessage = ({ email, message }) => {
  return (
    <div className='col-md-12' style={{padding: '10px'}}>
      <div style={{marginBottom: '10px'}}>
        {
          email &&
          <MuiAlert elevation={6} variant="filled" severity="success">
            { `Confirmation e-mail sent to ${email}.` }
          </MuiAlert>
        }
      </div>
      <h1>Verify Your Email Address</h1>
      <div className='col-md-12 no-side-padding'>
        {message}
      </div>
    </div>
  )
}

export default VerifyEmailMessage;
