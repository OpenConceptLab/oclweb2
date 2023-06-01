import React from 'react';
import { Alert, TextField, Box, Divider, Autocomplete, Dialog, DialogContent, DialogActions, DialogTitle, Button, Chip, Tooltip } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { Add as AddIcon } from '@mui/icons-material';
import { get, isEmpty, find, uniqBy, compact, map } from 'lodash'
import { fetchLocales, getSiteTitle, sortValuesBySourceSummary } from '../../common/utils';
import FormTooltip from './FormTooltip';
import GroupHeader from './GroupHeader';
import GroupItems from './GroupItems';

const SITE_TITLE = getSiteTitle()

const CUSTOM_MODEL_CONFIG = {
  multiple: {
    title: 'Add custom language code(s)',
    warning: 'OCL is optimized for 2-letter and 4-letter language codes (e.g. “en” or “en-GB”). Only use custom codes if absolutely necessary.',
    label: 'Custom language code(s)',
    helperText: 'Custom language codes may only have letters and hyphens, e.g. "eng". Use a comma or space to separate multiple custom codes',
    validation: 'Letters and “-” are allowed for language codes. Comma or space can be used to separate custom codes if applicable. No other characters e.g. numbers are accepted.',
    tooltip: 'Language codes in OCL use the syntax “en” or “en-GB” in accordance with ISO 639-1, with an optional 2-letter country code following BCP47. OCL allows language codes in other formats, however these codes may limit certain features or be incompatible with client systems, like OpenMRS. Letters and “-” are allowed for language codes.'
  },
  single: {
    title: 'Add custom language code',
    warning: 'OCL is optimized for 2-letter and 4-letter language codes (e.g. “en” or “en-GB”). Only use custom codes if absolutely necessary.',
    helperText: 'Custom language code may only have letters and hyphens, e.g. "eng".',
    label: 'Custom language code',
    validation: 'Letters and “-” are allowed for language code. No other characters e.g. numbers are accepted.',
    tooltip: 'Language codes in OCL use the syntax “en” or “en-GB” in accordance with ISO 639-1, with an optional 2-letter country code following BCP47. OCL allows language codes in other formats, however these codes may limit certain features or be incompatible with client systems, like OpenMRS. Letters and “-” are allowed for language codes.'
  }
}

const CustomLocaleDialog = ({ open, onClose, onSave, isMultiple }) => {
  const [input, setInput] = React.useState('')
  const config = isMultiple ? CUSTOM_MODEL_CONFIG.multiple : CUSTOM_MODEL_CONFIG.single
  const [error, setError] = React.useState(false)
  const onChange = event => {
    const isValid = event.target.checkValidity()
    const newValue = event.target.value || ''
    setInput(newValue)
    if(!isValid) {
      setError(true)
    } else {
      const values = newValue.trim().split(/[\s,]+/)
      setError(Boolean(!values || (!isMultiple && values.length > 1)))
    }
  }
  const pattern = isMultiple ? "[a-zA-Z-, ]+" : "[a-zA-Z-]+"
  return (
    <Dialog open={open}>
      <DialogTitle>{config.title}</DialogTitle>
      <DialogContent>
        <Alert severity="warning">
          {config.warning}
        </Alert>
        <div className='col-xs-12 no-side-padding flex-vertical-center' style={{marginTop: '20px'}}>
          <TextField
            size='small'
            autoFocus
            margin="dense"
            label={config.label}
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            value={input}
            onChange={onChange}
            helperText={config.helperText}
            inputProps={{ pattern: pattern }}
            error={error}
          />
          <FormTooltip title={config.tooltip} style={{marginLeft: '10px', marginTop: '-20px'}} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='text'>Cancel</Button>
        <Button onClick={() => onSave(input)} variant='contained' disabled={error}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

const LocaleAutoComplete = ({ cachedLocales, id, selected, multiple, required, onChange, label, error, size, fullWidth, placeholder, custom, limit, disabled, value, optionsLimit, sourceVersionSummary, ...rest }) => {
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
    let __locales = _locales
    if(get(selected, 'id') && !find(_locales, {id: selected.id})) {
      __locales = uniqBy([..._locales, selected], 'id')
    }

    setLocales(sortValuesBySourceSummary(compact(__locales), sourceVersionSummary, 'concepts.locale', true))
  }

  const getOptionLabel = option => {
    if(option?.displayName) {
      let label = option.locale
      const name = option.displayName || option.name
      const suffix = option.id.length > 3 ? option.id : ''
      if(name)
        label = `${label} - ${name}`
      if(suffix)
        label = `${label} - ${suffix}`

      return label
    } else
      return option?.name || option?.id || ''
  }

  const isValidOption = option => Boolean(option.displayName)

  const _value = selected || value || (multiple ? [] : '')
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

  const defaultFilterOptions = createFilterOptions();
  const filterOptions = (options, state) => {
    let result = defaultFilterOptions(options, state)
    if(optionsLimit) {
      let _limit = optionsLimit
      if(custom)
        _limit += 1

      result = result.slice(0, _limit)

      if(custom)
        result.push({id: 'custom', name: 'Add custom code'})
    }
    return result
  };

  const onCustomAddOptionClick = event => {
    event.preventDefault()
    event.stopPropagation()
    setCustomDialog(true)
  }


  return (
    <React.Fragment>
      <Autocomplete
        openOnFocus
        filterOptions={filterOptions}
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
        groupBy={option => option.resultType}
        renderGroup={params => (
          <li style={{listStyle: 'none'}} key={params.group}>
            <GroupHeader>{params.group}</GroupHeader>
            <GroupItems>{params.children}</GroupItems>
          </li>
        )}
        renderOption={(props, option) => {
          const isCustom = option.id === 'custom'
          const suffix = (option.id.length > 3 && !isCustom) ? option.id : false
          const boxProps = isCustom ? {...props, onClick: onCustomAddOptionClick} : props
          return (
            <React.Fragment key={option.id + option.name}>
              <Box component='li' {...boxProps}>
                {
                  isCustom ?
                    <span className='flex-vertical-center' style={{cursor: 'pointer'}}>
                      <AddIcon fontSize='small' style={{marginRight: '5px'}}/>
                      <span>
                        Add custom code
                      </span>
                    </span> :
                  <span style={{width: '100%', display: 'flex'}}>
                    <span style={{minWidth: '10%', marginRight: '10px'}} className='form-text-gray'>
                      {option.locale}
                    </span>
                    <span style={{minWidth: suffix ? '75%' : '85%'}}>
                      {option.name}
                    </span>
                    {
                      suffix &&
                        <span style={{minWidth: '10%'}} className='form-text-gray'>
                          {suffix}
                        </span>
                    }
                  </span>
                }
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
      <CustomLocaleDialog isMultiple={multiple && (!limit || limit > 1) } open={customDialog} searchText={input} onClose={() => setCustomDialog(false)} onSave={onCustomAdd}/>
    </React.Fragment>
);
}

export default LocaleAutoComplete;
