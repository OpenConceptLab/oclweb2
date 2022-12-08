import React from 'react';
import {
  List as SourceIcon, LocalOfferOutlined as ConceptIcon,
  Person as UserIcon, AccountBalance as OrgIcon,
} from '@mui/icons-material';
import { TextField, CircularProgress, ListItem, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { get, debounce, orderBy, isNumber, map } from 'lodash'
import APIService from '../../services/APIService';
import { GREEN } from '../../common/constants';
import { styled } from '@mui/system';
import AutocompleteLoading from './AutocompleteLoading';


const GroupHeader = styled('div')({
  position: 'sticky',
  top: '-8px',
  padding: '4px 16px',
  zIndex: 1000,
  backgroundColor: '#f5f5f5',
  fontSize: '12px',
  color: 'rgba(0, 0, 0, 0.6)',
});

const GroupItems = styled('ul')({
  padding: 0,
});

const SuggestionOption = ({ option, divider }) => (
  <span className='flex-vertical-center'>
    <Typography
      sx={{ display: 'inline', color: 'rgba(0, 0, 0, 0.6)' }}
      component="span"
      className='flex-vertical-center'>
      <span className='flex-vertical-center'>
        {
          divider &&
            <span className='flex-vertical-center' style={{backgroundColor: 'rgba(0, 0, 0, 0.6)', width: '3px', height: '3px', borderRadius: '100px', margin: '0 8px'}} />
        }
        <span className='flex-vertical-center' style={{fontSize: '14px'}}>
          {option.suggestionType}
        </span>
      </span>
    </Typography>
  </span>
)

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
      const sources = orderBy(response.data, ['name'])
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
        <li style={{listStyle: 'none'}}>
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
                    isNumber(option.summary.active_concepts) ?
                      <span className='flex-vertical-center'>
                        <Typography
                          sx={{ display: 'inline', color: 'rgba(0, 0, 0, 0.6)', fontSize: '14px' }}
                          component="span"
                          className='flex-vertical-center'>
                          <ConceptIcon size='small' style={{marginRight: '4px', width: '13.3px', height: '13.3px'}} />
                          {option.summary.active_concepts.toLocaleString()}
                        </Typography>
                        { option.suggestionType && <SuggestionOption option={option} divider /> }
                      </span> :
                    (
                      option.suggestionType ? <SuggestionOption option={option} /> : ''
                    )
                  )
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" style={{listStyle: 'none'}} />
          </React.Fragment>
        )
      }
    />
  );
}

export default SourceSearchAutocomplete;
