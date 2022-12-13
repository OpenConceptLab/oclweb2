import React from 'react';
import { Divider, IconButton, Tooltip } from '@mui/material';
import { ArrowDropDown as DownIcon, ArrowDropUp as UpIcon } from '@mui/icons-material';
import { BLACK } from '../../common/constants';
import { merge } from 'lodash';
const LIGHT_GRAY = 'rgba(0, 0, 0, 0.12)';

const CollapsibleDivider = ({open, tooltip, onClick, light, width, style}) => {
  const expandColor = light ? LIGHT_GRAY : BLACK;
  const _width = width || '48%'
  return (
    <div onClick={onClick} className='col-xs-12 no-side-padding flex-vertical-center divider-highlight-hover' style={merge({justifyContent: 'center', cursor: 'pointer'}, style || {})}>
      <Divider style={{width: _width, backgroundColor: open ? expandColor : LIGHT_GRAY}} />
      <Tooltip title={tooltip || (open ? 'Collapse' : 'Expand')} arrow>
        <IconButton onClick={onClick} color={open ? 'secondary' : 'default'} size='small' style={{border: '1px solid', borderColor: open ? expandColor : LIGHT_GRAY}}>
          {open ? <UpIcon fontSize='inherit' /> : <DownIcon fontSize='inherit' />}
        </IconButton>
      </Tooltip>
      <Divider style={{width: _width, backgroundColor: open ? expandColor : LIGHT_GRAY}} />
    </div>

  )
}

export default CollapsibleDivider;
