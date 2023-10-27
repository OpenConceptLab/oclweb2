import React from 'react';
import alertifyjs from 'alertifyjs';
import { Info as InfoIcon } from '@mui/icons-material';
import { TextField, Button, FormControlLabel, Checkbox, Tooltip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {
  set, get, cloneDeep, isEmpty, pickBy, startCase, isBoolean, isObject, values, map, isNumber, isString, uniq
} from 'lodash';
import APIService from '../../services/APIService';
import { recordGAUpsertEvent } from '../../common/utils';
import BetaLabel from '../common/BetaLabel';

const DEFAULT_TOOLTIP = 'This parameter is not yet supported.'
const PARAMETERS = {
  filter: {
    supported: true,
    tooltip: "Add search criteria"
  },
  activeOnly: {
    supported: true,
    tooltip: 'Select this to include unretired concepts/mappings only'
  },
  date: {
    supported: true,
    tooltip: 'The date (and optionally time) when a repo version was created or revised. This uses revision_date value of repo versions to filter. The format is YYYY, YYYY-MM, YYYY-MM-DD or YYYY-MM-DD hh:mm:ss',
    regex: /([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?/mg,
    format: 'YYYY, YYYY-MM, YYYY-MM-DD or YYYY-MM-DD hh:mm:ss'
  },
  count: {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
  offset: {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
  includeDesignations: {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
  includeDefinition: {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
  excludeNested: {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
  excludeNotForUI: {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
  excludePostCoordinated: {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
  "exclude-system": {
    supported: true,
    tooltip: 'Code system, or a particular version of a code system to be excluded from the value set expansion. The format is the same as a canonical URL: [system]|[version] - e.g. http://loinc.org|2.56'
  },
  "system-version": {
    supported: true,
    tooltip: 'Specifies a version to use for a system, if the value set does not specify which one to use. The format is the same as a canonical URL: [system]|[version] - e.g. http://loinc.org|2.56'
  },
  "check-system-version": {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
  "force-system-version": {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
}

class ExpansionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      versions: get(props, 'versions'),
      selectedVersion: get(props, 'version') || props?.id,
      fields: {
        mnemonic: '',
        canonical_url: '',
        parameters: {
          filter: "",
          "exclude-system": "",
          "system-version": "",
          date: "",
          count: 0,
          offset: 0,
          activeOnly: false,
          includeDesignations: true,
          includeDefinition: false,
          excludeNested: false,
          excludeNotForUI: true,
          excludePostCoordinated: true,
          "check-system-version": "",
          "force-system-version": ""
        },
      },
      fieldErrors: {},
      helperTexts: {},
    }
  }

  onTextFieldChange = event => this.setFieldValue(event.target.id, event.target.value)

  onCheckboxChange = event => this.setFieldValue(event.target.name, event.target.checked)

  onAutoCompleteChange = (id, item) => this.setFieldValue(id, item)

  onRegexTextFieldChange = (event, parameter) => {
    if(!parameter) {
      event.persist()
      this.onTextFieldChange(event)
      return
    }

    const { value, id } = event.target
    if(id) {
      const fieldId = id.replace('fields.parameters.', '')
      const re = new RegExp(parameter.regex)
      const matches = value.match(re)
      const newState = {...this.state}
      newState.fields.parameters[fieldId] = value
      if(matches) {
        newState.fieldErrors[fieldId] = undefined
        const newValue = uniq(matches).join(',')
        if(newValue !== value)
          newState.helperTexts[fieldId] = `Cleaned values: ${newValue}`
        else
          newState.helperTexts[fieldId] = undefined
      } else if (value) {
        newState.helperTexts[fieldId] = undefined
        newState.fieldErrors[fieldId] = `Format: ${parameter.format}`
      } else {
        newState.helperTexts[fieldId] = undefined
        newState.fieldErrors[fieldId] = undefined
      }
      this.setState(newState)
    }
  }

  onRegexTextFieldBlur = (event, parameter) => {
    const { value, id } = event.target
    const fieldId = id.replace('fields.parameters.', '')
    const helperText = get(this.state.helperTexts, fieldId)
    const error = get(this.state.fieldErrors, fieldId)
    if(helperText && !error) {
      const re = new RegExp(parameter.regex)
      const matches = value.match(re)
      if(matches) {
        const newState = {...this.state}
        newState.helperTexts[fieldId] = undefined
        newState.fields.parameters[fieldId] = uniq(matches).join(',')
        this.setState(newState)
      }
    }
  }

  setFieldValue(id, value) {
    const newState = {...this.state}
    set(newState, id, value)

    const fieldName = get(id.split('fields.'), '1')
    if(fieldName && !isEmpty(value) && get(newState.fieldErrors, fieldName))
      newState.fieldErrors[fieldName] = null
    this.setState(newState)
  }

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();
    const { selectedVersion } = this.state
    let fields = cloneDeep(this.state.fields);
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    if(selectedVersion && isFormValid) {
      recordGAUpsertEvent('Expansion', false)

      this.alert = alertifyjs.warning('Starting Expansion Creation. This might take few seconds.', 0)
      fields = pickBy(fields, value => value)
      let _version = selectedVersion?.version || selectedVersion?.id
      const url = _version === 'HEAD' ? selectedVersion.url + _version + '/' : selectedVersion.version_url
      APIService.new().overrideURL(url).appendToUrl('expansions/').post(fields).then(response => this.handleSubmitResponse(response))
    }
  }

  handleSubmitResponse(response) {
    const { reloadOnSuccess, onCancel, onSubmit } = this.props
    if(this.alert)
      this.alert.dismiss();
    if(response.status === 201) { // success
      const successMsg = `Successfully created expansion`;
      const message = reloadOnSuccess ? successMsg + '. Reloading..' : successMsg;
      onCancel();
      alertifyjs.success(message, 1, () => {
        if(onSubmit)
          onSubmit(response.data)
        else if(reloadOnSuccess)
          window.location.reload()
      })
    } else { // error
      const genericError = get(response, '__all__')
      if(genericError) {
        alertifyjs.error(genericError.join('\n'))
      } else if(get(response, 'detail')) {
        alertifyjs.error(response.detail)
      } else if (isObject(response)) {
        alertifyjs.error(values(response).join('\n'))
      } else {
        this.setState(
          {fieldErrors: response || {}},
          () => alertifyjs.error('Please fill mandatory fields.')
        )
      }
    }
  }
  render() {
    const { fields, fieldErrors, selectedVersion, versions, helperTexts } = this.state;
    const { onCancel } = this.props;
    const idLabel = fields.id ? fields.id : 'expansion-id';
    const _version = selectedVersion?.version || selectedVersion?.id
    const versionLabel = `${selectedVersion.short_code} / ${_version} / [${idLabel}]`;
    const header = `New Expansion: ${versionLabel}`;
    return (
      <div className='col-md-12' style={{marginBottom: '30px'}}>
        <div className='col-md-12 no-side-padding'>
          <h2>{header}</h2>
        </div>
        <div className='col-md-12 no-side-padding'>
          <form>
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px'}}>
              <TextField
                error={Boolean(fieldErrors.mnemonic)}
                id="fields.mnemonic"
                label="ID"
                placeholder="Name this expansion"
                variant="outlined"
                fullWidth
                required
                onChange={this.onTextFieldChange}
                value={fields.mnemonic}
                inputProps={{ pattern: "[a-zA-Z0-9-._@]+" }}
                helperText="Alphanumeric characters, @, hyphens, periods, and underscores are allowed."
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px'}}>
              <Autocomplete
                openOnFocus
                disableClearable
                isOptionEqualToValue={(option, value) => (option?.id === value?.id) || (option?.version && option?.version === value?.version)}
                value={selectedVersion}
                id="selectedVersion"
                options={versions}
                getOptionLabel={option => option.version || option.id}
                fullWidth
                required
                renderInput={
                  params => <TextField
                              {...params}
                              required
                              label='Collection Version'
                                     variant="outlined"
                                     fullWidth
                  />
                }
                onChange={(event, item) => this.onAutoCompleteChange(`selectedVersion`, item)}
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px'}}>
              <TextField
                error={Boolean(fieldErrors.canonical_url)}
                id="fields.canonical_url"
                label="Canonical URL"
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.canonical_url}
                type='url'
              />
            </div>
            <div className='col-md-12 no-side-padding'>
              <div className='col-md-12 no-side-padding'>
                <h4 style={{marginTop: '20px', marginBottom: '5px', paddingLeft: '5px'}}>
                  <BetaLabel label="Parameters"/>
                </h4>
              </div>
              {
                map(pickBy(fields.parameters, isBoolean), (value, attr) => {
                  const parameter = PARAMETERS[attr]
                  return (
                    <div className='col-md-4' key={attr}>
                      <FormControlLabel
                        control={<Checkbox style={{paddingRight: '5px'}} size='small' checked={fields.parameters[attr]} onChange={this.onCheckboxChange} name={`fields.parameters.${attr}`} />}
                        label={
                          <span style={{fontSize: '15px'}} className='flex-vertical-center'>
                            <span style={{marginRight: '5px', whiteSpace: 'pre'}}>
                              {startCase(attr)}
                            </span>
                            <span style={{marginRight: '5px'}} className='flex-vertical-center'>
                              <Tooltip title={parameter.tooltip}>
                                <InfoIcon color={parameter.supported ? 'primary' : 'disabled'} fontSize='small' />
                              </Tooltip>
                            </span>
                          </span>
                        }
                        disabled={!parameter.supported}
                      />
                    </div>
                  )
                })
              }
              {
                map(pickBy(fields.parameters, isString), (value, attr) => {
                  const parameter = PARAMETERS[attr]
                  const helperText = get(helperTexts, attr)
                  const errorText = get(fieldErrors, attr)
                  let color = 'primary'
                  if(helperText)
                    color = 'warning'
                  if (errorText)
                    color = 'error'
                  return (
                    <div className='col-md-4 flex-vertical-center' style={{marginTop: '15px'}} key={attr}>
                      <div className='col-md-11 no-side-padding' style={{marginRight: '5px'}}>
                        <TextField
                          color={color}
                          size='small'
                          id={`fields.parameters.${attr}`}
                          label={startCase(attr)}
                          variant="outlined"
                          fullWidth
                          onChange={
                            event => parameter.regex ?
                              this.onRegexTextFieldChange(event, parameter) :
                              this.onTextFieldChange(event)
                          }
                          value={fields.parameters[attr]}
                          disabled={!parameter.supported}
                          helperText={helperText || errorText}
                          error={Boolean(helperText || errorText)}
                          onBlur={event => this.onRegexTextFieldBlur(event, parameter)}
                        />
                      </div>
                      <div className='col-md-1 no-side-padding flex-vertical-center'>
                        <Tooltip title={parameter.tooltip}>
                          <InfoIcon color={parameter.supported ? 'primary' : 'disabled'} fontSize='small' />
                        </Tooltip>
                      </div>
                    </div>
                  )
                })
              }
              {
                map(pickBy(fields.parameters, isNumber), (value, attr) => {
                  const parameter = PARAMETERS[attr]
                  return (
                    <div className='col-md-4 flex-vertical-center' style={{marginTop: '15px'}} key={attr}>
                      <div className='col-md-11 no-side-padding' style={{marginRight: '5px'}}>
                        <TextField
                          size='small'
                          id={`fields.parameters.${attr}`}
                          label={startCase(attr)}
                          variant="outlined"
                          fullWidth
                          onChange={this.onTextFieldChange}
                          value={fields.parameters[attr]}
                          type='number'
                          disabled={!parameter.supported}
                        />
                      </div>
                      <div className='col-md-1 no-side-padding flex-vertical-center'>
                        <Tooltip title={parameter.tooltip}>
                          <InfoIcon color={parameter.supported ? 'primary' : 'disabled'} fontSize='small' />
                        </Tooltip>
                      </div>
                    </div>
                  )
                })
              }
            </div>
            <div className='col-md-12' style={{textAlign: 'center', margin: '15px 0'}}>
              <Button style={{margin: '0 10px'}} color='primary' variant='outlined' type='submit' onClick={this.onSubmit}>
                Create
              </Button>
              <Button style={{margin: '0 10px'}} variant='outlined' onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default ExpansionForm;
