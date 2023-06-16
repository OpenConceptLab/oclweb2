import React from 'react';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { TextField, IconButton } from '@mui/material';
import { get, isObject } from 'lodash';
import { jsonifySafe } from '../../common/utils';

const ExtrasForm = ({ extra, index, onChange, onDelete }) => {
  const value = get(extra, 'value', '');

  return (
    <div className='col-xs-12 no-side-padding'>
      <div className='col-xs-12 no-side-padding flex-vertical-center' style={{marginTop: '15px', width: '100%'}}>
        <div className='col-xs-5 no-left-padding'>
          <TextField
            id={`extras.${index}.key`}
            label='Attribute name'
            placeholder='Custom-name'
            variant="outlined"
            fullWidth
            onChange={event => onChange(index, event.target.value, '__')}
            size='small'
            value={get(extra, 'key', '')}
          />
        </div>
        <div className='col-xs-6 no-side-padding'>
          <TextField
            id={`extras.${index}.value`}
            label='Value'
            variant="outlined"
            fullWidth
            onChange={event => onChange(index, '__', jsonifySafe(event.target.value))}
            size='small'
            value={isObject(value) ? JSON.stringify(value) : value}
          />
        </div>
        <div className='col-xs-1 no-left-padding' style={{textAlign: 'right', minWidth: '8.33%', width: '8.33%'}}>
          <IconButton onClick={() => onDelete(index)} size="medium">
            <DeleteIcon fontSize='inherit' />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default ExtrasForm;
