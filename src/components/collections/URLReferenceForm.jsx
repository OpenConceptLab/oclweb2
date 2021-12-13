import React from 'react';
import { TextField, IconButton, Button } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { map, isNumber } from 'lodash';
import { getSiteTitle } from '../../common/utils';

const SITE_TITLE = getSiteTitle()

const URLReferenceForm = ({expressions, onAdd, onChange, onBlur, onDelete}) => {
  return (
    <div className='col-md-12 no-side-padding'>
      <div className='col-md-12 no-side-padding' style={{marginTop: '15px'}}>
        <Button onClick={onAdd} startIcon={<AddIcon />} variant='outlined'>Expression</Button>
      </div>
      {
        map(expressions, (expression, index) => {
          const resultLabel = isNumber(expression.count) ? `Found ${expression.count} result(s) with this expression.` : '';
          return (
            <div className='col-md-12 no-side-padding' key={index} style={{width: '100%', marginTop: '15px'}}>
              <div className='col-md-11 no-left-padding'>
                <TextField
                  error={Boolean(expression.error)}
                  id={`fields.expressions[${index}]`}
                  label="Expression"
                  placeholder="e.g. /orgs/WHO/sources/ICD-10/concepts/A15.0/"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={onChange}
                  onBlur={event => onBlur(event, index)}
                  value={expression.uri}
                  helperText={expression.error || resultLabel || `Any relative URL which is valid in ${SITE_TITLE}`}
                />
              </div>
              {
                index > 0 &&
                <div className='col-md-1 no-side-padding'>
                  <IconButton onClick={() => onDelete(index)} size="large"><DeleteIcon fontSize='inherit'/></IconButton>
                </div>
              }
            </div>
          );
        })
      }
    </div>
  );
}

export default URLReferenceForm;
