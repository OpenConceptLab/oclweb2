import React from 'react';
import { Divider } from '@material-ui/core';
import { Copyright as CopyrightIcon } from '@material-ui/icons';
import AppVersions from './AppVersions';

const Footer = () => {
  return (
    <footer className='col-sm-12 footer-container flex-vertical-center'>
      <CopyrightIcon fontSize='small'/>
      <span className='footer-company'>2021 Open Concept Lab</span>
      <Divider orientation='vertical' className='footer-divider-vertical' />
      <AppVersions />
    </footer>
  );

}

export default Footer;
