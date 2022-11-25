import React from 'react';
import { Tooltip } from '@mui/material';
import { InfoOutlined as Icon } from '@mui/icons-material';

const FormTooltip = ({ title, placement, style, size }) => (
  <span style={{display: 'flex', ...(style || {})}}>
    <Tooltip title={title} placement={placement || 'right'}>
      <Icon color='default' fontSize={size || 'medium'} />
    </Tooltip>
  </span>
)

export default FormTooltip;
