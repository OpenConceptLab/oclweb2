import React from 'react';
import { LinkOff as Icon } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { merge } from 'lodash';
import { ORANGE } from '../../common/constants';

const DoesnotExistsInOCLIcon = ({containerStyles, iconStyles, title}) => {
  return (
    <span className='flex-vertical-center' style={containerStyles || {}}>
      <Tooltip arrow title={title || "Not defined in OCL"}>
        <Icon style={merge({color: ORANGE, cursor: 'not-allowed'}, (iconStyles || {}))} fontSize='small' />
      </Tooltip>
    </span>
  );
}
export default DoesnotExistsInOCLIcon;
