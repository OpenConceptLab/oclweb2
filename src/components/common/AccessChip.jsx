import React from 'react';
import {
  Public as PublicIcon,
  Lock as PrivateIcon,
} from '@material-ui/icons';
import { Tooltip, Chip } from '@material-ui/core';
import { startCase, includes } from 'lodash';

const AccessChip = props => {
  const publicAccess = props.public_access || props.publicAccess || '';
  const isPublic = includes(['view', 'edit'], publicAccess.toLowerCase())
  const label = isPublic ? 'Public' : 'Private';
  const title = isPublic ? `Public Access: ${startCase(publicAccess)}` : 'Private';
  return (
    <span style={{marginTop: '-5px'}}>
      <Tooltip title={title} placement="top">
        <Chip
          label={label}
          size='small'
          icon={
            isPublic ?
                <PublicIcon fontSize='inherit' /> :
                <PrivateIcon fontSize='inherit' />
          }
        />
      </Tooltip>
    </span>
  );
}

export default AccessChip;
