import React from 'react';
import { Copyright as CopyrightIcon } from '@material-ui/icons';

const Footer = () => {
  return (
    <footer className='col-sm-12 footer-container flex-vertical-center'>
      <CopyrightIcon fontSize='small'/>
      <span className='footer-company'>2021 Open Concept Lab</span>
    </footer>
  );

}

export default Footer;
