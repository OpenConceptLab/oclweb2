import React from 'react';
import { useLocation } from 'react-router-dom';
import { Chip, Tooltip } from '@mui/material';
import { toV3URL } from '../../common/utils';
import NewOCLLogo from './NewOCLLogo';

const V3_PRIMARY = '#4836ff';

const TryNewTermBrowser = () => {
  const location = useLocation();
  const href = toV3URL(location.pathname + (location.search || ''));

  return (
    <Tooltip arrow title='Try the new TermBrowser'>
      <Chip
        size='medium'
        variant='outlined'
        clickable
        component='a'
        href={href}
        icon={<NewOCLLogo sx={{fill: 'currentColor', width: '26px'}} />}
        label='Try the new TermBrowser'
        sx={{
          paddingLeft: '4px',
          verticalAlign: 'middle',
          maxWidth: {xs: '170px', sm: 'none'},
          color: V3_PRIMARY,
          borderColor: V3_PRIMARY,
          '& .MuiChip-icon': {color: 'inherit', marginRight: '-4px', marginTop: '-1px'},
          '.MuiChip-label': {
            padding: '0 8px',
          }
        }}
      />
    </Tooltip>
  );
};

export default TryNewTermBrowser;
