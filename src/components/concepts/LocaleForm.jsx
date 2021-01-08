import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField, Checkbox, IconButton, FormControlLabel } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { ERROR_RED } from '../../common/constants';

const LocaleForm = ({
  localeAttr, index, onTextFieldChange, onAutoCompleteChange, onCheckboxChange, locales, types,
  onDelete, error
}) => {
  const idPrefix = `${localeAttr}.${index}`;
  const isName = localeAttr === 'fields.names';
  const borderColor = error ? ERROR_RED : 'lightgray'
  return (
    <div className='col-md-12' style={{border: `1px solid ${borderColor}`, borderRadius: '4px', paddingBottom: '15px', width: '100%'}}>
      <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
        <div className='col-md-10 no-side-padding'>
          <div className="col-md-6 no-left-padding">
            <Autocomplete
              id={`${idPrefix}.locale`}
              options={locales}
              getOptionLabel={(option) => option.name}
              fullWidth
              required
              renderInput={(params) => <TextField {...params} required size='small' label="Locale" variant="outlined" fullWidth />}
              onChange={(event, item) => onAutoCompleteChange(`${idPrefix}.locale`, item)}
            />
          </div>
          <div className="col-md-6 no-left-padding">
            <Autocomplete
              id={`${idPrefix}.type`}
              options={types}
              getOptionLabel={(option) => option.name}
              fullWidth
              required
              renderInput={(params) => <TextField {...params} required size='small' label="Type" variant="outlined" fullWidth />}
              onChange={(event, item) => onAutoCompleteChange(`${idPrefix}.type`, item)}
            />
          </div>
          <div className="col-md-6 no-left-padding" style={{marginTop: '15px'}}>
            <TextField
              id={isName ? `${idPrefix}.name` : `${idPrefix}.description`}
              label={isName ? "Name" : "Description"}
              variant="outlined"
              fullWidth
              required
              onChange={onTextFieldChange}
              size='small'
            />
          </div>
          <div className="col-md-6 no-left-padding" style={{marginTop: '15px'}}>
            <TextField
              id={`${idPrefix}.external_id`}
              label="External ID"
              variant="outlined"
              fullWidth
              onChange={onTextFieldChange}
              size='small'
            />
          </div>
        </div>
        <div className='col-md-2 no-side-padding' style={{textAlign: 'right'}}>
          <div className="col-md-12">
            <FormControlLabel
              control={<Checkbox name="preferred" onChange={event => onCheckboxChange(`${idPrefix}.locale_preferred`, event.target.checked)} />}
              label="Preferred"
            />
          </div>
          <div className="col-md-12">
            <IconButton onClick={() => onDelete(index)}><DeleteIcon /></IconButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocaleForm;
