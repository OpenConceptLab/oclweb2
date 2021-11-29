import React from 'react';
import {
  Public as PublicIcon,
  Lock as PrivateIcon,
} from '@mui/icons-material';
import { Tooltip, Chip } from '@mui/material';
import { startCase, includes } from 'lodash';

const AccessChip = props => {
  const publicAccess = props.public_access || props.publicAccess || '';
  const isPublic = includes(['view', 'edit'], publicAccess.toLowerCase())
  const label = isPublic ? 'Public' : 'Private';
  const title = isPublic ? `Public Access: ${startCase(publicAccess)}` : 'Private';
  return (
    <span style={{marginTop: '-5px'}}>
      <Tooltip arrow title={title} placement="top">
        <Chip
          label={label}
          size='small'
          icon={
            isPublic ?
                <PublicIcon fontSize='inherit' /> :
                <PrivateIcon fontSize='inherit' />
          }
          style={{backgroundColor: '#e0e0e0'}}
        />
      </Tooltip>
    </span>
  );
}

export default AccessChip;
