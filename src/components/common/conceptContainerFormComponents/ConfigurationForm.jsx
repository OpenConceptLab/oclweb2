import React from 'react';
import {
  TextField, Button, Autocomplete, FormControl, Select, ListItemText, MenuItem, InputLabel,
  FormControlLabel, Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
} from '@mui/icons-material';
import { fetchLocales } from '../../../common/utils';
import { get, merge, map, find, filter, includes, forEach, compact, flatten, uniqBy } from 'lodash';
import FormTooltip from '../../common/FormTooltip';
import LocaleAutoComplete from '../../common/LocaleAutoComplete'

const SelectItemText = ({icon, primaryText, secondaryText}) => (
  <ListItemText
    primary={
      <span className='flex-vertical-center'>
        {
          icon &&
            <span className='flex-vertical-center' style={{marginRight: '5px', marginLeft: '-5px'}}>
              {icon}
            </span>
        }
        <span className='flex-vertical-center'>
          {primaryText}
        </span>
      </span>
    }
    secondary={
      <span style={{whiteSpace: 'pre-wrap', fontSize: '12px'}}>
        {secondaryText}
      </span>
    }
  />
)

const ConfigurationForm = props => {
  const [locales, setLocales] = React.useState([])
  const [showSupportedLocales, setShowSupportedLocales] = React.useState(false)
  const [defaultLocale, setDefaultLocale] = React.useState(null)
  const [supportedLocales, setSupportedLocales] = React.useState([])
  const [type, setType] = React.useState(null)
  const [customValidationSchema, setCustomValidationSchema] = React.useState('None')
  const [publicAccess, setPublicAccess] = React.useState('View')
  const [canonicalURL, setCanonicalURL] = React.useState('')
  const [autoexpandHEAD, setAutoexpandHEAD] = React.useState(true)
  const onChange = (id, value, setter, propogateValue) => {
    setter(value)
    props.onChange(toState({[id]: propogateValue === undefined ? value : propogateValue}))
  }
  const toState = newValue => merge({public_access: publicAccess}, newValue)
  const configs = props.configuration
  const setUp = () => {
    fetchLocales(_locales => {
      let __locales = [..._locales]
      if(props.edit) {
        forEach(compact(flatten(compact([props.repo.default_locale, props.repo.supported_locales]))), _locale => {
          if(!find(_locales, {id: _locale}))
            __locales.push({id: _locale, displayName: _locale, name: _locale})
        })
      }
      setLocales(__locales)
      if(props.edit) {
        setAutoexpandHEAD(props.repo.autoexpand_head)
        if(props.repo.custom_validation_schema)
          setCustomValidationSchema(props.repo.custom_validation_schema)
        setDefaultLocale(find(__locales, {id: props.repo.default_locale}))
        if(props.repo.supported_locales) {
          setShowSupportedLocales(true)
          setSupportedLocales(uniqBy(filter(__locales, _locale => includes(props.repo.supported_locales, _locale.id)), 'id'))
        }
        const _type = get(props.repo, `${props.resource}_type`)
        setType({id: _type, name: _type})
        setPublicAccess(props.repo.public_access)
        setCanonicalURL(props.repo.canonical_url || '')
      }
    }, true)
  }

  React.useEffect(setUp, [])

  return (
    <div className='col-xs-12 no-side-padding' style={{margin: '-5px 0 20px 0'}}>
      <div className='col-xs-12 no-side-padding'>
        <h2>{configs.title}</h2>
      </div>
      <div className='col-xs-12 no-side-padding' style={{marginBottom: '15px'}}>
        <div className='col-xs-12 no-side-padding form-text-gray'>
          {configs.subTitle}
        </div>
      </div>
      <div className='col-xs-12 no-side-padding flex-vertical-center'>
        <LocaleAutoComplete
          cachedLocales={locales}
          label={configs.defaultLanguage.label}
          size='small'
          required
          value={defaultLocale}
          onChange={(id, item) => onChange('default_locale', item, setDefaultLocale, get(item, 'id'))}
        />
        <FormTooltip title={configs.defaultLanguage.tooltip} style={{marginLeft: '10px'}} />
      </div>
      <div className='col-xs-12 no-side-padding flex-vertical-center'>
        {
          showSupportedLocales ?
            <div className='col-xs-12 no-side-padding flex-vertical-center' style={{marginTop: '15px'}}>
              <LocaleAutoComplete
                cachedLocales={locales}
                multiple
                filterSelectedOptions
                label={configs.supportedLanguages.label}
                size='small'
                value={supportedLocales}
                onChange={(id, items) => onChange('supported_locales', items, setSupportedLocales, map(items, 'id').join(','))}
              />
              <FormTooltip title={configs.supportedLanguages.tooltip} style={{marginLeft: '10px'}} />
            </div> :
          <Button style={{marginTop: '8px'}} size='small' variant='text' onClick={() => setShowSupportedLocales(true)} startIcon={<AddIcon />}>
            Add Supported Language
          </Button>
        }
      </div>
      <div className='col-xs-12 no-side-padding'>
        <div className='col-xs-12 no-side-padding form-text-gray' style={{marginTop: '20px'}}>
          {`What type of ${props.resource} would you like to create?`}
        </div>
        <div className='col-xs-12 no-side-padding form-text-gray' style={{margin: '15px 0'}}>
          <div className='col-xs-12 no-side-padding form-text-gray flex-vertical-center'>
            <Autocomplete
              openOnFocus
              isOptionEqualToValue={(option, value) => option.id === get(value, 'id')}
              options={props.types}
              getOptionLabel={(option) => option.name}
              value={type}
              onChange={(event, item) => onChange('type', item, setType, get(item, 'id'))}
              fullWidth
              required
              size='small'
              renderInput={
                params => <TextField
                            {...params}
                            required
                            label={configs.type.label}
                            variant="outlined"
                            fullWidth
                          />
              }
            />
            <FormTooltip title={configs.type.tooltip} style={{marginLeft: '10px'}} />
          </div>

        </div>
      </div>
      <div className='col-xs-12 no-side-padding'>
        <div className='col-xs-12 no-side-padding form-text-gray' style={{marginTop: '5px'}}>
          {`Helps with formatting of your ${props.resource}`}
        </div>
        <div className='col-xs-12 no-side-padding form-text-gray' style={{margin: '15px 0'}}>
          <div className='col-xs-12 no-side-padding form-text-gray flex-vertical-center'>
            <FormControl variant="outlined" fullWidth  size="small">
              <InputLabel id="demo-simple-select-label">{configs.customValidationSchema.label}</InputLabel>
              <Select
                label={configs.customValidationSchema.label}
                required
                id="publicAccess"
                defaultValue="None"
                value={customValidationSchema}
                onChange={event => onChange('custom_validation_schema', event.target.value, setCustomValidationSchema, event.target.value === 'None' ? null : event.target.value)}
              >
                <MenuItem value="None">
                  <SelectItemText
                    value='None'
                    primaryText='None'
                    secondaryText="Default validation schema"
                  />
                </MenuItem>
                <MenuItem value='OpenMRS'>
                  <SelectItemText
                    value='OpenMRS'
                    primaryText='OpenMRS Validation Schema'
                    secondaryText="Custom OpenMRS Validation schema"
                  />
                </MenuItem>
              </Select>
            </FormControl>
            <FormTooltip title={configs.customValidationSchema.tooltip} style={{marginLeft: '10px'}} />
          </div>
        </div>
      </div>
      <div className='col-xs-12 no-side-padding'>
        <div className='col-xs-12 no-side-padding form-text-gray' style={{marginTop: '5px'}}>
          {configs.publicAccess.label}
        </div>
        <div className='col-xs-12 no-side-padding form-text-gray' style={{margin: '15px 0'}}>
          <div className='col-xs-12 no-side-padding form-text-gray flex-vertical-center'>
            <FormControl variant="outlined" fullWidth  size="small">
              <Select
                required
                id="publicAccess"
                defaultValue="View"
                value={publicAccess}
                onChange={event => onChange('public_access', event.target.value, setPublicAccess)}
              >
                <MenuItem value="View">
                  <SelectItemText
                    icon={<PublicIcon fontSize="small" />}
                    primaryText="Public (read only)"
                    secondaryText={`Anyone can view the content in this ${props.resource}`}
                  />
                </MenuItem>
                <MenuItem value='Edit'>
                  <SelectItemText
                    icon={<PublicIcon fontSize="small" />}
                    primaryText="Public (read/write)"
                    secondaryText={`Anyone can view/edit the content in this ${props.resource}`}
                  />
                </MenuItem>
                <MenuItem value='None'>
                  <SelectItemText
                    icon={<PrivateIcon fontSize="small" />}
                    primaryText="Private"
                    secondaryText={`No one can view the content in this ${props.resource}`}
                  />
                </MenuItem>
              </Select>
            </FormControl>
            <FormTooltip title={configs.publicAccess.tooltip} style={{marginLeft: '10px'}} />
          </div>
        </div>
      </div>
      <div className='col-xs-12 no-side-padding' style={{display: 'inline-flex', alignItems: 'center', marginTop: '5px'}}>
        <TextField
          size='small'
          type='url'
          label={configs.canonicalURL.label}
          value={canonicalURL}
          onChange={event => onChange('canonical_url', event.target.value || '', setCanonicalURL)}
          fullWidth
          helperText={configs.canonicalURL.helperText}
        />
        <FormTooltip title={configs.canonicalURL.tooltip} style={{marginLeft: '10px'}} />
      </div>
      {
        configs.autoexpandHEAD &&
          <div className='col-xs-12 no-side-padding flex-vertical-center' style={{marginTop: '10px'}}>
            <FormControlLabel
              control={<Checkbox size='small' checked={autoexpandHEAD} onChange={event => onChange('autoexpand_head', event.target.checked, setAutoexpandHEAD)} />}
              label={configs.autoexpandHEAD.label}
              disabled={props.edit}
            />
            <FormTooltip title={configs.autoexpandHEAD.tooltip} style={{marginLeft: '10px'}} />
          </div>
      }
    </div>
)
}

export default ConfigurationForm;
