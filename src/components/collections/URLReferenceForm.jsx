import React from 'react';
import { TextField, IconButton, Button, Tooltip } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { map } from 'lodash';

const URLReferenceForm = ({expressions, onAdd, onChange, onDelete}) => {
  return (
    <div className='col-md-12 no-side-padding'>
      {
        map(expressions, (expression, index) => {
          return (
            <div className='col-md-12 no-side-padding' key={index} style={{width: '100%', marginTop: '15px'}}>
              <div className='col-md-10 no-left-padding'>
                <TextField
                  error={Boolean(expression.error)}
                  id={`fields.expressions[${index}]`}
                  label="Expression"
                  placeholder="e.g. /orgs/WHO/sources/ICD-10/concepts/A15.0/"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={onChange}
                  value={expression.uri}
                  helperText={expression.error}
                />
              </div>
              {
                index > 0 &&
                  <div className='col-md-2 no-side-padding'>
                    <Tooltip title='Remove this expression' arrow>
                      <IconButton color='error' onClick={() => onDelete(index)} size="large"><DeleteIcon fontSize='inherit' /></IconButton>
                    </Tooltip>
                </div>
              }
            </div>
          );
        })
      }
      <div className='col-md-12 no-side-padding' style={{marginTop: '15px'}}>
        <Button onClick={onAdd} startIcon={<AddIcon />} variant='text'>Expression</Button>
      </div>
    </div>
  );
}

export default URLReferenceForm;
