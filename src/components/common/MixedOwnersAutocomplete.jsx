import React from 'react';
import {Person as PersonIcon, Home as HomeIcon} from '@material-ui/icons';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { get } from 'lodash'
import { ORANGE } from '../../common/constants';

const MixedOwnersAutocomplete = ({onChange, owners, label, id, required, selected}) => {
  return (
    <Autocomplete
      openOnFocus
      blurOnSelect
      getOptionSelected={(option, value) => option.id === get(value, 'id')}
      value={selected}
      id={id || 'owner'}
      options={owners}
      getOptionLabel={option => option ? `${option.name} (${option.ownerType})` : ''}
      fullWidth
      required={required}
      renderInput={
        params => <TextField {...params} required label={label || "Organization/User"} variant="outlined" fullWidth />
      }
      renderOption={
        option => (
          <React.Fragment>
            <span className='flex-vertical-center'>
              <span style={{marginRight: '5px'}}>
                {
                  option.ownerType === 'org' ?
                  <HomeIcon fontSize='small' style={{marginTop: '5px', color: ORANGE, fontSize: '1rem'}} />:
                  <PersonIcon fontSize='small' style={{marginTop: '5px', color: ORANGE, fontSize: '1rem'}} />
                }
              </span>
              {option.name}
            </span>
          </React.Fragment>
        )
      }
      onChange={(event, item) => onChange(id || 'owner', item)}
    />
  )
}

export default MixedOwnersAutocomplete;
