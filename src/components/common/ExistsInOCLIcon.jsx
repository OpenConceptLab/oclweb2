import React from 'react';
import { Link as Icon } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { merge } from 'lodash';
import { GREEN } from '../../common/constants';

const ExistsInOCLIcon = ({containerStyles, iconStyles, title}) => {
  return (
    <span className='flex-vertical-center' style={containerStyles || {}}>
      <Tooltip arrow title={title || 'Defined in OCL'}>
        <Icon style={merge({color: GREEN}, (iconStyles || {}))} fontSize='small' />
      </Tooltip>
    </span>
  );
}

export default ExistsInOCLIcon;
