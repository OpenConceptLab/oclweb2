import React from 'react';
import {Person as PersonIcon, Home as HomeIcon} from '@mui/icons-material';
import { TextField, CircularProgress } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { get, debounce, map, orderBy, isEmpty } from 'lodash'
import APIService from '../../services/APIService';
import { ORANGE } from '../../common/constants';

const MixedOwnersAutocomplete = ({onChange, label, id, required, minCharactersForSearch}) => {
  const minLength = minCharactersForSearch || 2;
  const [input, setInput] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [fetched, setFetched] = React.useState(false)
  const [owners, setOwners] = React.useState([])
  const [selected, setSelected] = React.useState(undefined)
  const isSearchable = input && input.length >= minLength;
  const loading = Boolean(open && !fetched && isSearchable && isEmpty(owners))
  const handleInputChange = (event, value) => {
    setInput(value || '')
    setFetched(false)
    if(value && value.length >= minLength)
      fetchOwners(value)
  }

  const handleChange = (id, item) => {
    setSelected(item)
    onChange(id, item)
  }

  const fetchOwners = debounce(searchStr => {
    const searchQuery = searchStr ? searchStr.replace(' (org)', '').replace(' (user)', '') : searchStr;
    const query = {limit: 1000, q: searchQuery}
    APIService.orgs().get(null, null, query).then(response => {
      const orgs = orderBy(
        map(response.data, org => ({...org, ownerType: 'org', name: org.id})),
        ['name']
      )
      APIService.users().get(null, null, query).then(response => {
        const users = orderBy(
          map(response.data, user => ({...user, ownerType: 'user', name: user.username})),
          'name'
        )
        setOwners(() => [...orgs, ...users])
        setFetched(true)
      })
    })
  }, 700)

  return (
    <Autocomplete
      openOnFocus
      blurOnSelect
      open={open}
      onOpen={() => {
          setOpen(true);
      }}
      onClose={() => {
          setOpen(false);
      }}
      isOptionEqualToValue={(option, value) => option.id === get(value, 'id')}
      value={selected}
      id={id || 'owner'}
      options={owners}
      loading={loading}
      loadingText={loading ? 'Loading...' : `Type atleast ${minLength} characters to search`}
      noOptionsText={(isSearchable && !loading) ? "No results" : 'Start typing...'}
      getOptionLabel={option => option ? `${option.name} (${option.ownerType})` : ''}
      fullWidth
      required={required}
      onInputChange={handleInputChange}
      onChange={(event, item) => handleChange(id || 'owner', item)}
      renderInput={
        params => (
          <TextField
            {...params}
            value={input}
                  required
                  label={label || "Organization/User"}
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
      renderOption={
        (props, option) => (
          <li {...props} key={`${option.ownerType}-${option.name}`}>
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
          </li>
        )
      }
    />
  );
}

export default MixedOwnersAutocomplete;
