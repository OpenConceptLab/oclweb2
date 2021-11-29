import React from 'react';
import { Tooltip } from '@mui/material';
import { map } from 'lodash';

const SupportedLocales = ({default_locale, supported_locales}) => {
  return (
    <span>
      <Tooltip arrow title='Default Locale'>
        <span><b>{default_locale}</b></span>
      </Tooltip>
      {
        map(supported_locales, locale => {
          if(locale !== default_locale) {
            return (
              <span key={locale}>, {locale}</span>
            )
          }
        })
      }
    </span>
  )
}

export default SupportedLocales;
