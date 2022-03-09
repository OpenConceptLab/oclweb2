import React from 'react';
import {
  Link as LinkIcon,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { merge } from 'lodash';
import { toFullAPIURL, copyURL } from '../../common/utils';

const MappingIcon = ({ url, shrink, style }) => {
  const onIconClick = () => copyURL(toFullAPIURL(url))
  const classes = 'no-side-padding col-xs-1 home-icon mapping flex-vertical-center' + (shrink ? ' xsmall' : '')

  return (
    <div className={classes} style={merge({width: '5%', cursor: 'auto'}, style || {})}>
      {
        url ?
        <Tooltip arrow title='Copy URL'>
          <LinkIcon onClick={onIconClick} className='default-svg' />
        </Tooltip> :
        <LinkIcon className='default-svg' />
      }
    </div>
  );
}

export default MappingIcon;
