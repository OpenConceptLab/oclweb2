import React from 'react';
import { TextField, Button, Autocomplete, FormControl, Select, ListItemText, MenuItem } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { get, merge, map } from 'lodash';
import FormTooltip from '../../common/FormTooltip';
import LocaleAutoComplete from '../../common/LocaleAutoComplete'

const ConfigurationForm = props => {
  const [showSupportedLocales, setShowSupportedLocales] = React.useState(false)
  const [defaultLocale, setDefaultLocale] = React.useState(null)
  const [supportedLocales, setSupportedLocales] = React.useState([])
  const [type, setType] = React.useState(null)
  const [publicAccess, setPublicAccess] = React.useState('View')
  const [canonicalURL, setCanonicalURL] = React.useState('')
  const onChange = (id, value, setter, propogateValue) => {
    setter(value)
    props.onChange(toState({[id]: propogateValue === undefined ? value : propogateValue}))
  }
  const toState = newValue => merge({public_access: publicAccess}, newValue)
  const configs = props.configuration

  return (
    <div className='col-xs-12 no-side-padding' style={{marginBottom: '20px'}}>
      <div className='col-xs-12 no-side-padding'>
        <h2>{configs.title}</h2>
      </div>
      <div className='col-xs-12 no-side-padding' style={{marginBottom: '5px'}}>
        <div className='col-xs-12 no-side-padding form-text-gray'>
          {configs.subTitle}
        </div>
      </div>
      <div className='col-xs-12 no-side-padding flex-vertical-center'>
        <LocaleAutoComplete
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
                multiple
                filterSelectedOptions
                label={configs.supportedLanguages.label}
                size='small'
                value={supportedLocales}
                onChange={(id, items) => onChange('supported_locales', items, setSupportedLocales, map(items, 'id').join(','))}
              />
              <FormTooltip title={configs.supportedLanguages.tooltip} style={{marginLeft: '10px'}} />
            </div> :
          <Button size='small' variant='text' onClick={() => setShowSupportedLocales(true)} startIcon={<AddIcon />}>
            Add Supported Language
          </Button>
        }
      </div>
      <div className='col-xs-12 no-side-padding'>
        <div className='col-xs-12 no-side-padding form-text-gray' style={{marginTop: '10px'}}>
          {`What type of ${props.resource} would you like to create?`}
        </div>
        <div className='col-xs-12 no-side-padding form-text-gray' style={{margin: '10px 0'}}>
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
        <div className='col-xs-12 no-side-padding form-text-gray' style={{marginTop: '10px'}}>
          {configs.publicAccess.label}
        </div>
        <div className='col-xs-12 no-side-padding form-text-gray' style={{margin: '10px 0'}}>
          <div className='col-xs-12 no-side-padding form-text-gray flex-vertical-center'>
            <FormControl variant="outlined" fullWidth  size="small">
              <Select
                required
                id="publicAccess"
                defaultValue="View"
                value={publicAccess}
                onChange={event => onChange('public_access', event.target.value, setPublicAccess)}
              >
                <MenuItem value='View'>
                  <ListItemText primary="Public (read only)" secondary={`Anyone can view the content is this ${props.resource}`} />
                </MenuItem>
                <MenuItem value='Edit'>
                  <ListItemText primary="Public (read/write)" secondary={`Anyone can view/edit the content is this ${props.resource}`} />
                </MenuItem>
                <MenuItem value='None'>
                  <ListItemText primary="Private" secondary={`No one can view the content is this ${props.resource}`} />
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
          required
          fullWidth
        />
        <FormTooltip title={configs.canonicalURL.tooltip} style={{marginLeft: '10px'}} />
      </div>
    </div>
  )
}

export default ConfigurationForm;
