import React from 'react';
import {
  LocalOfferOutlined as ConceptIcon,
} from '@mui/icons-material';
import { TextField, CircularProgress, ListItem, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { get, debounce, map } from 'lodash'
import APIService from '../../services/APIService';
import { BLUE } from '../../common/constants';
import AutocompleteLoading from './AutocompleteLoading';

const SubText = ({ label, value, divider }) => (
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

        <span className='flex-vertical-center'>
          {
            label &&
              <span className='flex-vertical-center' style={{fontSize: '14px', marginRight: '5px'}}>
                {`${label}:`}
              </span>
          }
          <span className='flex-vertical-center' style={{fontSize: '14px'}}>
            {value}
          </span>
        </span>
      </span>
    </Typography>
  </span>
)

const SubTexts = ({ option }) => {
  return (
    <span className='flex-vertical-center'>
      {
        map([{field: 'id', label: 'ID'}, {field: 'concept_class', label: 'Concept Class'}], (field, index) => (
          <SubText key={index} label={field.label} value={option[field.field]} divider={index != 0} />
        ))
      }
    </span>
  )
}


const ConceptSearchAutocomplete = ({onChange, label, id, required, minCharactersForSearch, size, parentURI, disabled, value, freeSolo, onInputChange}) => {
  const minLength = minCharactersForSearch || 1;
  const [input, setInput] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [concepts, setConcepts] = React.useState([])
  const [selected, setSelected] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const isSearchable = input && input.length >= minLength;
  const handleInputChange = debounce((event, value, reason) => {
    setInput(value || '')
    if(reason !== 'reset' && value && value.length >= minLength)
      fetchConcepts(value)
    else
      setLoading(false)
    if(freeSolo && onInputChange)
      onInputChange(id, value || '')
  }, 300)

  const handleChange = (event, id, item) => {
    event.preventDefault()
    event.stopPropagation()
    setSelected(item)
    onChange(id, item)
  }

  const fetchConcepts = searchStr => {
    setLoading(true)
    const query = {limit: 10, q: searchStr}
    let service = parentURI ? APIService.new().overrideURL(parentURI).appendToUrl('concepts/') : APIService.concepts()
    setConcepts([])
    service.get(null, null, query).then(response => {
      setConcepts(response.data)
      setLoading(false)
    })
  }

  React.useEffect(() => {
    setSelected(value || '')
    if(!value) {
      setInput('')
      setConcepts([])
    }
  }, [value])

  return (
    <Autocomplete
      freeSolo={freeSolo}
      disabled={disabled}
      filterOptions={x => x}
      openOnFocus
      blurOnSelect
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) => option.url === get(value, 'url')}
      value={selected}
      id={id || 'concept'}
      size={size || 'medium'}
      options={concepts}
      loading={loading}
      loadingText={
        loading ?
          <AutocompleteLoading text={input} /> :
        `Type atleast ${minLength} characters to search`
      }
      noOptionsText={(isSearchable && !loading) ? "No results" : 'Start typing...'}
      getOptionLabel={option => option ? option.id : ''}
      fullWidth
      required={required}
      onInputChange={handleInputChange}
      onChange={(event, item) => handleChange(event, id || 'concept', item)}
      renderInput={
        params => (
          <TextField
            {...params}
            value={input}
            required
            label={label || "Concept"}
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
            <ListItem {...props}>
              <ListItemIcon>
                <ConceptIcon style={{color: BLUE}} fontSize='large' />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    className='ellipsis-text-2'
                    sx={{ maxWidth: 'calc(100% - 5px)' }}>
                    <span>{option.display_name}</span>
                    {
                      option.display_locale &&
                        <span style={{color: 'rgba(0, 0, 0, 0.6)', marginLeft: '5px'}}>
                          <i>{`[${option.display_locale}]`}</i>
                        </span>
                    }
                  </Typography>
                }
                secondary={
                  <SubTexts option={option} />
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

export default ConceptSearchAutocomplete;
