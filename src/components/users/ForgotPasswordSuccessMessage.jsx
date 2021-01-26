import React from 'react';
import { Link } from 'react-router-dom';
import MuiAlert from '@material-ui/lab/Alert';

const ForgotPasswordSuccessMessage = () => {
  return (
    <div className='col-md-12' style={{padding: '10px'}}>
      <div style={{marginBottom: '10px'}}>
        <MuiAlert elevation={6} variant="filled" severity="success">
          Password successfully changed.
        </MuiAlert>
      </div>
      <h1>Change Password</h1>
      <div className='col-md-12 no-side-padding'>
        Your password is now changed. Please proceed to <Link to="/accounts/login">Sign In</Link>.
      </div>
    </div>
  )
}

export default ForgotPasswordSuccessMessage;
