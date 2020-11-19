import React from 'react';
import {
  Link as LinkIcon,
} from '@material-ui/icons';
import { Tooltip } from '@material-ui/core';
import { toFullAPIURL, copyURL } from '../../common/utils';

const MappingIcon = ({ url }) => {
  const onIconClick = () => copyURL(toFullAPIURL(url))

  return (
    <div className='no-side-padding col-md-1 home-icon mapping'>
      <Tooltip title='Copy URL'>
        <LinkIcon onClick={onIconClick} />
      </Tooltip>
    </div>
  );
}

export default MappingIcon;
