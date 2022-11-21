import React from 'react';
import {
  List as SourceIcon, LocalOfferOutlined as ConceptIcon,
  Person as UserIcon, AccountBalance as OrgIcon,
} from '@mui/icons-material';
import { TextField, CircularProgress, ListItem, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { get, debounce, orderBy, isEmpty } from 'lodash'
import APIService from '../../services/APIService';
import { GREEN } from '../../common/constants';

const SourceSearchAutocomplete = ({onChange, label, id, required, minCharactersForSearch, size}) => {
  const minLength = minCharactersForSearch || 2;
  const [input, setInput] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [fetched, setFetched] = React.useState(false)
  const [sources, setSources] = React.useState([])
  const [selected, setSelected] = React.useState(undefined)
  const isSearchable = input && input.length >= minLength;
  const loading = Boolean(open && !fetched && isSearchable && isEmpty(sources))
  const handleInputChange = debounce((event, value, reason) => {
    setInput(value || '')
    setFetched(false)
    if(reason !== 'reset' && value && value.length >= minLength)
      fetchSources(value)
  }, 300)

  const handleChange = (event, id, item) => {
    event.preventDefault()
    event.stopPropagation()
    setSelected(item)
    onChange(id, item)
  }

  const fetchSources = searchStr => {
    const query = {limit: 25, q: searchStr, includeSummary: true}
    APIService.sources().get(null, null, query).then(response => {
      const sources = orderBy(response.data, ['name'])
      setSources(sources)
      setFetched(true)
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
      loadingText={loading ? 'Loading...' : `Type atleast ${minLength} characters to search`}
      noOptionsText={(isSearchable && !loading) ? "No results" : 'Start typing...'}
      getOptionLabel={option => option ? option.name : ''}
      fullWidth
      required={required}
      onInputChange={handleInputChange}
      onChange={(event, item) => handleChange(event, id || 'source', item)}
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
            <ListItem
              {...props}
              secondaryAction={
                <span className='flex-vertical-center'>
                  {
                    option.owner_type === 'User' ?
                      <UserIcon style={{marginRight: '4px', color: 'rgba(0, 0, 0, 0.26)', fontSize: '13px' }}/> :
                    <OrgIcon style={{marginRight: '4px', color: 'rgba(0, 0, 0, 0.26)', fontSize: '13px'}} />
                  }
                  <span className='flex-vertical-center' style={{maxWidth: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'rgba(0, 0, 0, 0.26)', fontSize: '13px'}}>
                    {option.owner}
                  </span>
                </span>
              }>
              <ListItemIcon>
                <SourceIcon style={{color: GREEN}} fontSize='large' />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    sx={{ maxWidth: 'calc(100% - 90px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {option.name}
                  </Typography>
                }
                secondary={
                  (
                    option.summary.active_concepts &&
                      <Typography
                        sx={{ display: 'inline', color: 'rgba(0, 0, 0, 0.6)' }}
                        component="span"
                        className='flex-vertical-center'>
                        <ConceptIcon size='small' style={{marginRight: '4px', fontSize: '1rem'}} />
                        {option.summary.active_concepts.toLocaleString()}
                      </Typography>
                  )
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        )
      }
    />
  );
}

export default SourceSearchAutocomplete;
