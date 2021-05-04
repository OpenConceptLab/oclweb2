import React from 'react';
import ErrorUI from './ErrorUI';

const AccessDenied = () => {
  return (
    <ErrorUI
      header='401'
      message={`You need to <a href='/#/accounts/login?returnTo=${window.location.hash.replace('#', '')}'>Sign-in</a> to view this.`}
    />
  )
}

export default AccessDenied;
