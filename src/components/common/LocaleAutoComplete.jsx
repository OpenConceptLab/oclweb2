import React from 'react';
import { Alert, TextField, Box, Divider, Autocomplete, Dialog, DialogContent, DialogActions, DialogTitle, Button, Chip, Tooltip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { get, isEmpty, find, uniqBy, compact, map } from 'lodash'
import { fetchLocales, getSiteTitle } from '../../common/utils';
import FormTooltip from './FormTooltip';

const SITE_TITLE = getSiteTitle()

const CustomLocaleDialog = ({ open, onClose, onSave }) => {
  const [input, setInput] = React.useState('')
  return (
    <Dialog open={open}>
      <DialogTitle>Add custom language code</DialogTitle>
      <DialogContent>
        <Alert severity="warning">
          OCL is optimized for 2-letter and 4-letter language codes (e.g. “en” or “en-GB”). Only use custom codes if absolutely necessary.
        </Alert>
        <div className='col-xs-12 no-side-padding flex-vertical-center' style={{marginTop: '20px'}}>
          <TextField
            size='small'
            autoFocus
            margin="dense"
            label="Custom Codes"
            placeholder='Enter custom codes'
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            value={input}
            onChange={event => setInput(event.target.value || '')}
          />
          <FormTooltip title='Language codes in OCL use the syntax “en” or “en-GB” in accordance with ISO 639-1, with an optional 2-letter country code following BCP47. OCL allows language codes in other formats, however these codes may limit certain features or be incompatible with client systems, like OpenMRS. Letters and “-” are allowed for language codes.' style={{marginLeft: '10px'}} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='text'>Cancel</Button>
        <Button onClick={() => onSave(input)} variant='contained'>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

const LocaleAutoComplete = ({ cachedLocales, id, selected, multiple, required, onChange, label, error, size, fullWidth, placeholder, custom, limit, disabled, value, ...rest }) => {
  const [locales, setLocales] = React.useState(cachedLocales || [])
  const _fullWidth = !(fullWidth === false)
  const [input, setInput] = React.useState('')
  const [customDialog, setCustomDialog] = React.useState(false)

  React.useEffect(() => {
    if(isEmpty(cachedLocales)) {
      fetchLocales(_locales => {
        prepareLocales(_locales)
      }, true)
    }
  }, [])

  React.useEffect(() => {
    prepareLocales(locales)
  }, [selected])

  const prepareLocales = _locales => {
    if(get(selected, 'id') && !find(_locales, {id: selected.id})) {
      setLocales(uniqBy([..._locales, selected], 'id'))
    } else {
      setLocales(_locales)
    }
  }

  const getOptionLabel = option => {
    if(option.displayName) {
      let label = option.locale
      const name = option.displayName || option.name
      const suffix = option.id.length > 3 ? option.id : ''
      if(name)
        label = `${label} - ${name}`
      if(suffix)
        label = `${label} - ${suffix}`

      return label
    } else
      return option.name || option.id
  }

  const isValidOption = option => Boolean(option.displayName)

  const _value = selected || value || []
  const isLimitReached = limit && Boolean(multiple) && _value.length === limit

  const onCustomAdd = newValues => {
    setCustomDialog(false)
    onChange(
      id || 'localesAutoComplete',
      compact([
        ..._value,
        ...map(newValues.split(/[\s,]+/), val => {
          const _val = val.trim()
          return _val ? {id: _val} : false
        })
      ])
    )
  }

  return (
    <React.Fragment>
      <Autocomplete
        openOnFocus
        fullWidth={_fullWidth}
        blurOnSelect={!multiple}
        disableCloseOnSelect={Boolean(multiple)}
        multiple={Boolean(multiple)}
        required={required}
        isOptionEqualToValue={(option, value) => get(value, 'uuid') ? (option.uuid === get(value, 'uuid')) : (option.id === get(value, 'id'))}
        defaultValue={isEmpty(selected) ? (multiple ? [] : '') : selected}
        value={_value}
        id={id || 'localesAutoComplete'}
        options={locales}
        getOptionLabel={getOptionLabel}
        onChange={(event, item) => onChange(id || 'localesAutoComplete', item)}
        renderOption={(props, option) => {
          const suffix = option.id.length > 3 ? option.id : false
          return (
            <React.Fragment key={option.id + option.name}>
              <Box component='li' {...props}>
                <span style={{width: '100%', display: 'flex'}}>
                  <span style={{minWidth: '10%'}} className='form-text-gray'>
                    {option.locale}
                  </span>
                  <span style={{minWidth: suffix ? '80%' : '90%'}}>
                    {option.name}
                  </span>
                  {
                    suffix &&
                      <span style={{minWidth: '10%'}} className='form-text-gray'>
                        {suffix}
                      </span>
                  }
                </span>
              </Box>
              <Divider style={{width: '100%'}}/>
            </React.Fragment>
          )
        }}
        renderInput={
          params => (
            <TextField
              {...params}
              size={size || 'medium'}
              required={required}
              label={label}
              placeholder={isLimitReached ? undefined : placeholder}
              error={error}
              variant="outlined"
              fullWidth={_fullWidth}
              value={input}
              onChange={event => setInput(event.target.value || '')}
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
        noOptionsText={
          custom ?
            <span className='flex-vertical-center' style={{cursor: 'pointer'}} onClick={() => setCustomDialog(true)}>
              <AddIcon fontSize='small' style={{marginRight: '5px'}}/>
              <span>{`Add "${input}" as custom language code...`}</span>
            </span> :
          'No options'
        }
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const isValid = isValidOption(option)
            return (
              <Tooltip key={index} title={isValid ? 'ISO-639-1 language code' : `${SITE_TITLE}'s data model supports ISO-639-1 (two digit) codes as standard. Consider updating.`}>
                <Chip
                  size='small'
                  label={getOptionLabel(option)}
                  {...getTagProps({ index })}
                  disabled={disabled}
                  color={isValid ? 'primary' : 'default'}
                  className={isValid ? '' : 'invalid-locale-chip'}
                  style={{margin: '4px'}}
                />
              </Tooltip>
            )
          })
        }
        disabled={disabled || isLimitReached}
        {...rest}
      />
      <CustomLocaleDialog open={customDialog} searchText={input} onClose={() => setCustomDialog(false)} onSave={onCustomAdd}/>
    </React.Fragment>
);
}

export default LocaleAutoComplete;
