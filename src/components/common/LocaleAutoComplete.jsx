import React from 'react';
import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { get, isEmpty } from 'lodash'
import { fetchLocales } from '../../common/utils';

const LocaleAutoComplete = ({ id, selected, multiple, required, onChange, label, error, size, ...rest }) => {
  const [locales, setLocales] = React.useState([])

  React.useEffect(() => fetchLocales(_locales => setLocales(_locales)), [])

  return (
    <Autocomplete
      openOnFocus
      fullWidth
      blurOnSelect={!multiple}
      disableCloseOnSelect={Boolean(multiple)}
      multiple={Boolean(multiple)}
      required={required}
      isOptionEqualToValue={(option, value) => option.uuid === get(value, 'uuid')}
      defaultValue={isEmpty(selected) ? (multiple ? [] : '') : selected}
      value={selected}
      id={id || 'localesAutoComplete'}
      options={locales}
      getOptionLabel={option => (option.name || '')}
      onChange={(event, item) => onChange(id || 'localesAutoComplete', item)}
      renderInput={
        params => (
          <TextField
            {...params}
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
