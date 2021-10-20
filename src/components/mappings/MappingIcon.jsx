import React from 'react';
import {
  Link as LinkIcon,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { toFullAPIURL, copyURL } from '../../common/utils';

const MappingIcon = ({ url, shrink }) => {
  const onIconClick = () => copyURL(toFullAPIURL(url))
  const classes = 'no-side-padding col-md-1 home-icon mapping flex-vertical-center' + (shrink ? ' xsmall' : '')

  return (
    <div className={classes} style={{width: '5%', cursor: 'auto'}}>
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
