import React from 'react';
import { TextField, Box, Divider, Autocomplete } from '@mui/material';
import { get, isEmpty } from 'lodash'
import { fetchLocales } from '../../common/utils';

const LocaleAutoComplete = ({ cachedLocales, id, selected, multiple, required, onChange, label, error, size, fullWidth, ...rest }) => {
  const [locales, setLocales] = React.useState(cachedLocales || [])
  const _fullWidth = !(fullWidth === false)

  React.useEffect(() => isEmpty(cachedLocales) && fetchLocales(_locales => setLocales(_locales), true), [])

  return (
    <Autocomplete
      openOnFocus
      fullWidth={_fullWidth}
      blurOnSelect={!multiple}
      disableCloseOnSelect={Boolean(multiple)}
      multiple={Boolean(multiple)}
      required={required}
      isOptionEqualToValue={(option, value) => get(value, 'uuid') ? (option.uuid === get(value, 'uuid')) : (option.id === get(value, 'id'))}
      defaultValue={isEmpty(selected) ? (multiple ? [] : '') : selected}
      value={selected}
      id={id || 'localesAutoComplete'}
      options={locales}
      getOptionLabel={option => (option.displayName || '')}
      onChange={(event, item) => onChange(id || 'localesAutoComplete', item)}
      renderOption={(props, option) => {
        return (
          <React.Fragment key={option.id + option.name}>
            <Box component='li' {...props}>
              <span style={{minWidth: '55px'}} className='form-text-gray'>
                {option.id}
              </span>
              <span>
                {option.name}
              </span>
            </Box>
            <Divider style={{width: '100%'}}/>
          </React.Fragment>
        )
      }}
      renderInput={
        params => (
          <TextField
            {...params}
            size={size || 'medium'}
            required={required}
            label={label}
            error={error}
            variant="outlined"
            fullWidth={_fullWidth}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
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
