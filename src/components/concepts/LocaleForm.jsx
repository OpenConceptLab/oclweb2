import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField, Checkbox, IconButton, FormControlLabel } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { find, get } from 'lodash'
import { ERROR_RED } from '../../common/constants';

const LocaleForm = ({
  localeAttr, index, onTextFieldChange, onAutoCompleteChange, onCheckboxChange, locales, types,
  onDelete, error, locale
}) => {
  const isName = localeAttr === 'fields.names';
  const nameAttr = isName ? 'name' : 'description';
  const typeAttr = `${nameAttr}_type`;
  const selectedLocale = get(locale, 'locale') ? find(locales, {id: locale.locale}) : null;
  const selectedLocaleType = get(locale, typeAttr) ? find(types, {id: locale[typeAttr]}) : null;
  const idPrefix = `${localeAttr}.${index}`;
  const borderColor = error ? ERROR_RED : 'lightgray'
  return (
    <div className='col-md-12' style={{border: `1px solid ${borderColor}`, borderRadius: '4px', paddingBottom: '15px', width: '100%'}}>
      <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
        <div className='col-md-10 no-side-padding'>
          <div className="col-md-6 no-left-padding">
            <Autocomplete
              value={selectedLocale}
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
              value={selectedLocaleType}
              id={`${idPrefix}.${typeAttr}`}
              options={types}
              getOptionLabel={(option) => option.name}
              fullWidth
              required
              renderInput={(params) => <TextField {...params} required size='small' label="Type" variant="outlined" fullWidth />}
              onChange={(event, item) => onAutoCompleteChange(`${idPrefix}.${typeAttr}`, item)}
            />
          </div>
          <div className="col-md-6 no-left-padding" style={{marginTop: '15px'}}>
            <TextField
              id={`${idPrefix}.${nameAttr}`}
              label={isName ? "Name" : "Description"}
              variant="outlined"
              fullWidth
              required
              onChange={onTextFieldChange}
              size='small'
              value={get(locale, nameAttr, '')}
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
              value={get(locale, 'external_id', '')}
            />
          </div>
        </div>
        <div className='col-md-2 no-side-padding' style={{textAlign: 'right'}}>
          <div className="col-md-12">
            <FormControlLabel
              control={
                <Checkbox
                  checked={get(locale, 'locale_preferred', false)}
                  name="preferred"
                          onChange={event => onCheckboxChange(`${idPrefix}.locale_preferred`, event.target.checked)}
                />
              }
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
