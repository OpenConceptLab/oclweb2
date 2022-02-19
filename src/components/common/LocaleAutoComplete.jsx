import React from 'react';
import { TextField, CircularProgress } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { get, debounce, map, orderBy, isEmpty } from 'lodash'
import APIService from '../../services/APIService';

const LocaleAutoComplete = ({ id, selected, multiple, minCharactersForSearch, required, onChange, label, error, size, ...rest }) => {
  const minLength = minCharactersForSearch || 2;
  const [input, setInput] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [fetched, setFetched] = React.useState(false)
  const [locales, setLocales] = React.useState([])

  const isSearchable = val => val && val.length >= minLength
  const loading = Boolean(open && !fetched && isSearchable(input) && isEmpty(locales))
  const handleInputChange = (event, value) => {
    const val = value || ''
    setInput(val)
    setFetched(false)
    if(isSearchable(val))
      fetchLocales(val)
  }

  const searchLocales = searchStr => {
    APIService
      .orgs('OCL')
      .sources('Locales')
      .appendToUrl('concepts/')
      .get(null, null, {limit: 25, q: searchStr})
      .then(response => {
        const _locales = orderBy(map(response.data, l => ({id: l.id, name: `${l.display_name} [${l.id}]`, uuid: l.uuid})), 'name');
        setLocales(_locales)
        setFetched(true)
      })
  }

  const fetchLocales = React.useCallback(debounce(searchLocales, 700), [])

  return (
    <Autocomplete
      openOnFocus
      fullWidth
      blurOnSelect={!multiple}
      disableCloseOnSelect={Boolean(multiple)}
      multiple={Boolean(multiple)}
      required={required}
      open={open}
      onOpen={() => {
          setOpen(true);
      }}
      onClose={() => {
          setOpen(false);
      }}
      isOptionEqualToValue={(option, value) => option.uuid === get(value, 'uuid')}
      defaultValue={isEmpty(selected) ? (multiple ? [] : '') : selected}
      value={selected}
      id={id || 'localesAutoComplete'}
      options={locales}
      loading={loading}
      loadingText={loading ? 'Loading...' : `Type atleast ${minLength} characters to search`}
      noOptionsText={(isSearchable(input) && !loading) ? "No results" : 'Start typing...'}
      getOptionLabel={option => (option.name || '')}
      onInputChange={handleInputChange}
      onChange={(event, item) => onChange(id || 'localesAutoComplete', item)}
      renderInput={
        params => (
          <TextField
            {...params}
            value={input}
                  size={size || 'medium'}
                  required={required}
                  label={label}
                  error={error}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
          />
        )
      }
      {...rest}
    />
  );
}

export default LocaleAutoComplete;
