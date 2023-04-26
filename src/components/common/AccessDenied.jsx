import React from 'react';
import { getLoginURL, isSSOEnabled } from '../../common/utils'
import ErrorUI from './ErrorUI';

const AccessDenied = () => {
  const loginURL = getLoginURL(isSSOEnabled() ? window.location.origin + '/' + window.location.hash : window.location.hash.replace('#', ''))
  return (
    <ErrorUI
      header='401'
      message={`You need to <a href='${loginURL}'>Sign-in</a> to view this.`}
    />
  )
}

export default AccessDenied;
