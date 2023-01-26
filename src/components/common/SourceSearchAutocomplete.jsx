import React from 'react';
import { TextField, CircularProgress, Divider } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { get, debounce, map } from 'lodash'
import APIService from '../../services/APIService';
import { styled } from '@mui/system';
import AutocompleteLoading from './AutocompleteLoading';
import SourceListItem from './SourceListItem';


const GroupHeader = styled('div')({
  position: 'sticky',
  top: '-8px',
  padding: '4px 16px',
  zIndex: 1000,
  backgroundColor: '#f5f5f5',
  fontSize: '12px',
  color: 'rgba(0, 0, 0, 0.6)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
});

const GroupItems = styled('ul')({
  padding: 0,
});


const SourceSearchAutocomplete = ({onChange, label, id, required, minCharactersForSearch, size, suggested}) => {
  const minLength = minCharactersForSearch || 2;
  const [input, setInput] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [sources, setSources] = React.useState(map(suggested || [], instance => ({...instance, resultType: 'Suggested Sources'})))
  const [selected, setSelected] = React.useState(undefined)
  const [loading, setLoading] = React.useState(false)
  const isSearchable = input && input.length >= minLength;
  const handleInputChange = debounce((event, value, reason) => {
    setInput(value || '')
    if(reason !== 'reset' && value && value.length >= minLength)
      fetchSources(value)
    else
      setLoading(false)
  }, 300)

  const handleChange = (event, id, item) => {
    event.preventDefault()
    event.stopPropagation()
    setSelected(item)
    onChange(id, item)
  }

  const fetchSources = searchStr => {
    setLoading(true)
    setSources([])
    const query = {limit: 25, q: searchStr, includeSummary: true}
    APIService.sources().get(null, null, query).then(response => {
      const sources = response.data
      setSources(map(sources, source => ({...source, resultType: 'Search Results'})))
      setLoading(false)
    })
  }

  return (
    <Autocomplete
      filterOptions={x => x}
      openOnFocus
      blurOnSelect
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) => option.url === get(value, 'url')}
      value={selected}
      id={id || 'source'}
      size={size || 'medium'}
      options={sources}
      loading={loading}
      loadingText={
        loading ?
          <AutocompleteLoading text={input} /> :
        `Type atleast ${minLength} characters to search`
      }
      noOptionsText={(isSearchable && !loading) ? "No results" : 'Start typing...'}
      getOptionLabel={option => option ? option.name : ''}
      fullWidth
      required={required}
      onInputChange={handleInputChange}
      onChange={(event, item) => handleChange(event, id || 'source', item)}
      groupBy={option => option.resultType}
      renderGroup={params => (
        <li style={{listStyle: 'none'}} key={params.group}>
          <GroupHeader>{params.group}</GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
      )}
      renderInput={
        params => (
          <TextField
            {...params}
            value={input}
            required
            label={label || "Source"}
            variant="outlined"
            fullWidth
            size={size || 'medium'}
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
          <React.Fragment key={option.url}>
            <SourceListItem listItemProps={props} option={option} />
            <Divider variant="inset" component="li" style={{listStyle: 'none'}} />
          </React.Fragment>
        )
      }
    />
  );
}

export default SourceSearchAutocomplete;
