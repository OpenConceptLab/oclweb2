import React from 'react';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import { merge } from 'lodash';
import { BLUE, WHITE, RED, BLACK, UUID_LENGTH } from '../../common/constants';

const MappingButton = ({label, mapType, onClick, retired, href, style, ...rest}) => {
  const _style = retired ?
        {background: 'lightgray', color: RED, boxShadow: 'none', textDecoration: 'line-through', textDecorationColor: BLACK, textTransform: 'none'} :
        {background: BLUE, color: WHITE, boxShadow: 'none', textTransform: 'none'};

  const truncLabel = label && label.length === UUID_LENGTH ? `${label.split('-')[0]}...` : label
  return (
    <Tooltip title={label} arrow>
      <ButtonGroup variant='contained' style={{boxShadow: 'none'}} {...rest}>
        <Button
          className={mapType ? 'light-gray-bg' : ''}
          href={href}
          startIcon={<LinkIcon />}
          onClick={onClick}
          style={merge(_style, style || {})}
          {...rest}
        >
          {truncLabel}
        </Button>
        {
          mapType &&
            <Button
              href={href}
              variant='contained'
              onClick={onClick}
              style={merge(_style, style || {})}
              {...rest}
            >
              {mapType}
            </Button>
        }
      </ButtonGroup>
    </Tooltip>
  )
}

export default MappingButton;
