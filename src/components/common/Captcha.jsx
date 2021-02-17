/*eslint no-process-env: 0*/

import React from 'react';
import ReCAPTCHA from "react-google-recaptcha";

/*eslint no-undef: 0*/
const SITE_KEY = process.env.RECAPTCHA_SITE_KEY

const Captcha = ({ onChange }) => {
  return (
    <ReCAPTCHA sitekey={SITE_KEY} onChange={onChange} />
  )
}

export default Captcha;
