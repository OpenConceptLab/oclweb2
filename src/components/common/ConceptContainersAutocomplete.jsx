import React from 'react';
import {List as ListIcon, Loyalty as LoyaltyIcon} from '@material-ui/icons';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { get } from 'lodash'
import { GREEN } from '../../common/constants';

const ConceptContainersAutocomplete = ({onChange, items, label, id, required, selected}) => {
  return (
    <Autocomplete
      openOnFocus
      blurOnSelect
      getOptionSelected={(option, value) => option.id === get(value, 'id')}
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
        option => (
          <React.Fragment>
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
          </React.Fragment>
        )
      }
      onChange={(event, item) => onChange(get(item, 'type') || 'source', item)}
    />
  )
}

export default ConceptContainersAutocomplete;
