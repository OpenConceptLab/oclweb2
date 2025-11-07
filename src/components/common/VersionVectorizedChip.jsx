import React from 'react';
import { Chip, Tooltip } from '@mui/material';

const VersionVectorizedChip = props => {
  return (
    <Tooltip arrow placement='top-start' title='Concepts vectorization is enabled in this version for mapper tool'>
      <Chip
        icon={
          <i
            style={{fontSize: '0.8rem', paddingTop: '4px'}}
            className="fa-solid fa-diagram-project"
          />
        }
        label='Vectorized'
        variant='outlined'
        color='secondary'
        size={props.size || 'medium'}
        sx={{'.MuiChip-label': {paddingTop: '2px'}}}
      />
    </Tooltip>
  )
}

export default VersionVectorizedChip;
