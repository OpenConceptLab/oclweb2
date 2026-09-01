import React from 'react';
import { getLoginURL } from '../../common/utils'
import ErrorUI from './ErrorUI';

const AccessDenied = () => {
  const [loginURL, setLoginURL] = React.useState('')

  React.useEffect(() => {
    getLoginURL().then(setLoginURL)
  }, [])

  return (
    <ErrorUI
      header='401'
      message={`You need to <a href='${loginURL}'>Sign-in</a> to view this.`}
    />
  )
}

export default AccessDenied;
