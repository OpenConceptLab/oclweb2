import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField, Checkbox, IconButton, FormControlLabel } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { find, get, map, includes } from 'lodash'
import { ERROR_RED } from '../../common/constants';
import LocaleAutoComplete from '../common/LocaleAutoComplete';

const LocaleForm = ({
  localeAttr, index, onTextFieldChange, onAutoCompleteChange, onCheckboxChange, types,
  onDelete, error, locale
}) => {
  const isName = localeAttr === 'fields.names';
  const nameAttr = isName ? 'name' : 'description';
  const typeAttr = `${nameAttr}_type`;
  const localeType = get(locale, typeAttr);
  const borderColor = error ? ERROR_RED : 'lightgray'
  const idPrefix = `${localeAttr}.${index}`;

  const [selectedLocale, setSelectedLocale] = React.useState(
    locale.locale ? {id: locale.locale, name: locale.locale} : null
  )

  let formattedTypes = isName ? map(types, _type => {
    const name = includes(['none', 'definition'], _type.id.toLowerCase()) ?
                 _type.id :
                 _type.id.toUpperCase().replaceAll(' ', '_')
    return {id: name, name: name}
  }) : types;

  let selectedLocaleType = localeType ? find(formattedTypes, {id: locale[typeAttr]}) : null;

  if(localeType && !selectedLocaleType) {
    const _type = {id: localeType, name: localeType}
    selectedLocaleType = _type
    formattedTypes = [_type, ...formattedTypes]
  }

  const onLocaleChange = (event, item) => {
    setSelectedLocale(item)
    onAutoCompleteChange(`${idPrefix}.locale`, item)
  }
  return (
    <div className='col-md-12' style={{border: `1px solid ${borderColor}`, borderRadius: '4px', paddingBottom: '15px', width: '100%'}}>
      <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
        <div className='col-md-10 no-side-padding'>
          <div className="col-md-6 no-left-padding">
            <LocaleAutoComplete
              id={`${idPrefix}.locale`}
              selected={selectedLocale}
              onChange={onLocaleChange}
              required
              label='Locale'
              size='small'
            />
          </div>
          <div className="col-md-6 no-left-padding">
            <Autocomplete
              openOnFocus
              value={selectedLocaleType}
              id={`${idPrefix}.${typeAttr}`}
              options={formattedTypes}
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
