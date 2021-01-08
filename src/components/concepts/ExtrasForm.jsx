import React from 'react';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { TextField, IconButton } from '@material-ui/core';
import { get } from 'lodash';

const ExtrasForm = ({ extra, index, onChange, onDelete }) => {
  return (
    <div className='col-md-12' style={{border: '1px solid lightgray', borderRadius: '4px', paddingBottom: '15px', width: '100%'}}>
      <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
        <div className='col-md-5 no-left-padding'>
          <TextField
            id={`extras.${index}.key`}
            label='Attribute Name'
            variant="outlined"
            fullWidth
            onChange={event => onChange(index, event.target.value, '__')}
            size='small'
            value={get(extra, 'key', '')}
          />
        </div>
        <div className='col-md-6 no-left-padding'>
          <TextField
            id={`extras.${index}.value`}
            label='Value'
            variant="outlined"
            fullWidth
            onChange={event => onChange(index, '__', event.target.value)}
            size='small'
            multiline
            rows={2}
            value={get(extra, 'value', '')}
          />
        </div>
        <div className='col-md-1 no-left-padding' style={{textAlign: 'right', minWidth: '8.33%', width: '8.33%'}}>
          <IconButton onClick={() => onDelete(index)}><DeleteIcon /></IconButton>
        </div>
      </div>
    </div>
  )
}

export default ExtrasForm;
