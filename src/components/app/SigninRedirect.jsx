import React, { useEffect } from 'react'
import { getLoginURL } from '../../common/utils'

const SigninRedirect = () => {
  useEffect(() => {
    window.location.href = getLoginURL();
  }, []);

  return <h4>Redirecting...</h4>;
};

export default SigninRedirect;
