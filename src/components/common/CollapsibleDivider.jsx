import React from 'react';
import { Divider, IconButton, Tooltip } from '@material-ui/core';
import { ArrowDropDown as DownIcon, ArrowDropUp as UpIcon } from '@material-ui/icons';
import { BLACK } from '../../common/constants';
const LIGHT_GRAY = 'rgba(0, 0, 0, 0.12)';

const CollapsibleDivider = ({open, tooltip, onClick}) => {
  return (
    <div className='col-md-12 no-side-padding flex-vertical-center'>
      <Divider style={{width: '48%', backgroundColor: open ? BLACK : LIGHT_GRAY}} />
      <Tooltip title={tooltip} arrow>
        <IconButton onClick={onClick} color={open ? 'secondary' : 'default'} size='small' style={{border: '1px solid', borderColor: open ? BLACK : LIGHT_GRAY}}>
          {open ? <UpIcon fontSize='inherit' /> : <DownIcon fontSize='inherit' />}
        </IconButton>
      </Tooltip>
      <Divider style={{width: '48%', backgroundColor: open ? BLACK : LIGHT_GRAY}} />
    </div>

  )
}

export default CollapsibleDivider;
