import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { find } from 'lodash'

const OPTIONS = [{id: '1', name: '1'}, {id: '2', name: '2'}, {id: '3', name: '3'}, {id: '4', name: '4'}, {id: '5', name: '5'}, {id: '*', name: 'All'}]

const CascadeLevelDropdown = ({value, size, placeholder, onChange}) => {
  return (
    <Autocomplete
      options={OPTIONS}
      value={find(OPTIONS, {id: value})}
      size={size || 'medium'}
      renderInput={
        params => <TextField {...params} placeholder={placeholder} size={size || 'medium'}  label="Cascade Levels" />
      }
      getOptionLabel={option => option.name}
      onChange={(event, val) => onChange(val?.id)}
    />
  )
}

export default CascadeLevelDropdown;
