import React from 'react';
import {
  Link as LinkIcon,
} from '@material-ui/icons';
import { Tooltip } from '@material-ui/core';
import { toFullAPIURL, copyURL } from '../../common/utils';

const MappingIcon = ({ url }) => {
  const onIconClick = () => copyURL(toFullAPIURL(url))

  return (
    <div className='no-side-padding col-md-1 home-icon mapping flex-vertical-center' style={{width: '5%'}}>
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
