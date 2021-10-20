import React from 'react';
import {List as ListIcon, Loyalty as LoyaltyIcon} from '@mui/icons-material';
import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { get } from 'lodash'
import { GREEN } from '../../common/constants';

const ConceptContainersAutocomplete = ({onChange, items, label, id, required, selected}) => {
  return (
    <Autocomplete
      openOnFocus
      blurOnSelect
      isOptionEqualToValue={(option, value) => (option.id === get(value, 'id') && option.type === get(value, 'type'))}
      value={selected}
      id={id || 'conceptContainer'}
      options={items}
      getOptionLabel={option => option ? `${option.name} (${option.type})` : ''}
      fullWidth
      required={required}
      renderInput={
        params => <TextField {...params} required label={label || "Collection/Source"} variant="outlined" fullWidth />
      }
      renderOption={
        (props, option) => (
          <li {...props} key={option.type + '-' + option.name}>
            <span className='flex-vertical-center'>
              <span style={{marginRight: '5px'}}>
                {
                  option.type === 'source' ?
                  <ListIcon fontSize='small' style={{marginTop: '5px', color: GREEN, fontSize: '1rem'}} />:
                  <LoyaltyIcon fontSize='small' style={{marginTop: '5px', color: GREEN, fontSize: '1rem'}} />
                }
              </span>
              {option.name}
            </span>
          </li>
        )
      }
      onChange={(event, item) => onChange(get(item, 'type') || 'source', item)}
    />
  );
}

export default ConceptContainersAutocomplete;
