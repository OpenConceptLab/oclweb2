import React from 'react';
import alertifyjs from 'alertifyjs';
import { Info as InfoIcon } from '@mui/icons-material';
import { TextField, Button, FormControlLabel, Checkbox, Tooltip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {
  set, get, cloneDeep, isEmpty, pickBy, startCase, isBoolean, isObject, values, map, isNumber, isString
} from 'lodash';
import APIService from '../../services/APIService';
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
    supported: false,
    tooltip: DEFAULT_TOOLTIP
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
  "exclude - system": {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
  "system - version": {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
  "check - system - version": {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
  "force - system - version": {
    supported: false,
    tooltip: DEFAULT_TOOLTIP
  },
}

class ExpansionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      versions: get(props, 'versions'),
      selectedVersion: get(props, 'version'),
      fields: {
        mnemonic: '',
        canonical_url: '',
        parameters: {
          filter: "",
          date: "",
          count: 0,
          offset: 0,
          activeOnly: false,
          includeDesignations: true,
          includeDefinition: false,
          excludeNested: false,
          excludeNotForUI: true,
          excludePostCoordinated: true,
          "exclude - system": "",
          "system - version": "",
          "check - system - version": "",
          "force - system - version": ""
        },
      },
      fieldErrors: {},
    }
  }

  onTextFieldChange = event => this.setFieldValue(event.target.id, event.target.value)

  onCheckboxChange = event => this.setFieldValue(event.target.name, event.target.checked)

  onAutoCompleteChange = (id, item) => this.setFieldValue(id, item)

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
      this.alert = alertifyjs.warning('Starting Expansion Creation. This might take few seconds.', 0)
      fields = pickBy(fields, value => value)
      const url = selectedVersion.version === 'HEAD' ? selectedVersion.url + selectedVersion.version + '/' : selectedVersion.version_url
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
    const { fields, fieldErrors, selectedVersion, versions } = this.state;
    const { onCancel } = this.props;
    const idLabel = fields.id ? fields.id : 'expansion-id';
    const versionLabel = `${selectedVersion.short_code} / ${selectedVersion.version} / [${idLabel}]`;
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
                isOptionEqualToValue={(option, value) => option.version === get(value, 'version')}
                value={selectedVersion}
                id="selectedVersion"
                options={versions}
                getOptionLabel={option => option.version}
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
                  Parameters
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
              {
                map(pickBy(fields.parameters, isString), (value, attr) => {
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
