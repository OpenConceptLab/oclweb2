import React, { useEffect } from 'react'
import { getLoginURL } from '../../common/utils'

const SigninRedirect = () => {
  useEffect(() => {
    getLoginURL().then(url => { window.location.href = url });
  }, []);

  return <h4>Redirecting...</h4>;
};

export default SigninRedirect;
