import React from 'react';
import { Divider } from '@mui/material';
import { Copyright as CopyrightIcon } from '@mui/icons-material';
import { get } from 'lodash';
import {
  getAppliedServerConfig
} from '../../common/utils';
import AppVersions from './AppVersions';
const DEFAULT_FOOTER_TEXT = '2021 Open Concept Lab';
const Footer = () => {
  const text = get(getAppliedServerConfig(), 'info.site.footerText', DEFAULT_FOOTER_TEXT);
  const isDefault = text === DEFAULT_FOOTER_TEXT;
  return (
    <footer className='col-sm-12 footer-container flex-vertical-center'>
      {
        isDefault &&
        <CopyrightIcon fontSize='small'/>
      }
      <span className='footer-company'>{text}</span>
      <Divider orientation='vertical' className='footer-divider-vertical' />
      <AppVersions />
    </footer>
  );

}

export default Footer;
