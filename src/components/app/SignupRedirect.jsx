import React, { useEffect } from 'react'
import { getRegisterURL } from '../../common/utils'

const SignupRedirect = () => {
  useEffect(() => {
    getRegisterURL().then(url => { window.location.href = url });
  }, []);

  return <h4>Redirecting...</h4>;
};

export default SignupRedirect;
