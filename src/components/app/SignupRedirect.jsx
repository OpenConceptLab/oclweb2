import React, { useEffect } from 'react'
import { getRegisterURL } from '../../common/utils'

const SignupRedirect = () => {
  useEffect(() => {
    window.location.href = getRegisterURL();
  }, []);

  return <h4>Redirecting...</h4>;
};

export default SignupRedirect;
