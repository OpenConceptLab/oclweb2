import React from 'react';
import {
  Public as PublicIcon,
} from '@material-ui/icons';
import { Tooltip, Chip } from '@material-ui/core';
import { startCase } from 'lodash';

const PublicAccessChip = props => {
  const publicAccess = props.public_access || props.publicAccess;
  return (
    <span style={{marginTop: '-5px'}}>
      <Tooltip title={`Public Access: ${startCase(publicAccess)}`} placement="top-start">
        <Chip label='Public' size='small' icon=<PublicIcon fontSize='inherit' /> />
      </Tooltip>
    </span>
  );
}

export default PublicAccessChip;
