import React from 'react';
import { ErrorOutline as ErrorIcon } from '@material-ui/icons';
import { Tooltip } from '@material-ui/core';
import { merge } from 'lodash';
import { ORANGE } from '../../common/constants';

const DoesnotExistsInOCLIcon = ({containerStyles, iconStyles, title}) => {
  return (
    <span className='flex-vertical-center' style={containerStyles || {}}>
      <Tooltip title={title || "Doesn't Exists in OCL"}>
        <ErrorIcon style={merge({color: ORANGE, cursor: 'not-allowed'}, (iconStyles || {}))} fontSize='small' />
      </Tooltip>
    </span>
  );
}
export default DoesnotExistsInOCLIcon;
