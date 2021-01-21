import React from 'react';
import alertifyjs from 'alertifyjs';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Add as AddIcon } from '@material-ui/icons';
import {
  TextField, IconButton, Button, CircularProgress, Select, MenuItem, FormControl, InputLabel,
} from '@material-ui/core';
import {
  set, get, map, cloneDeep, pullAt, isEmpty, startCase, pickBy, isObject, isArray,
  find, intersectionBy
} from 'lodash';
import APIService from '../../services/APIService';
import { arrayToObject, getCurrentURL, fetchLocales } from '../../common/utils';
import ExtrasForm from '../common/ExtrasForm';
const JSON_MODEL = {key: '', value: ''}


// props => resource, resourceType (source), defaultIdText (SourceCode), urlPath (sources),
// props => types, placeholders ({id: ''})
// source => content_type, source_type
// collection => immutable, collection_type
class ConceptContainerForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        id: '',
        name: '',
        full_name: '',
        website: '',
        source_type: '',
        collection_type: '',
        public_access: 'View',
        external_id: '',
        default_locale: '',
        supported_locales: '',
        custom_validation_schema: 'None',
        description: '',
        extras: [cloneDeep(JSON_MODEL)],
        canonical_url: '',
        publisher: '',
        purpose: '',
        copyright: '',
        content_type: '',
        revision_date: '', //date
        identifier: '', //json
        contact: '', //json
        jurisdiction: '', //json
      },
      typeAttr: '',
      fieldErrors: {},
      serverErrors: null,
      selected_source_type: null,
      selected_collection_type: null,
      locales: [],
    }
  }

  componentDidMount() {
    fetchLocales(locales => this.setState({locales: locales}))
    const { edit, resource } = this.props

    this.setState({typeAttr: this.isSource() ? 'source_type' : 'collection_type'}, () => {
      if(edit && resource)
        this.setFieldsForEdit()
    })
  }

  isSource() {
    return get(this.props, 'resource.type') === 'Source' || this.props.resourceType === 'source'
  }

  componentDidUpdate() {
    this.setSupportedLocales()
  }

  setSupportedLocales() {
    this.setSupportedLocalesValidation();
    this.setSupportedLocalesDisplay();
  }

  setSupportedLocalesValidation() {
    const el = document.getElementById('fields.supported_locales')
    if(!el) return;
    if(this.state.fields.supported_locales)
      el.removeAttribute('required')
    else
      el.setAttribute('required', 'true')
  }

  setSupportedLocalesDisplay() {
    if(this.props.edit && this.props.resource && !isEmpty(this.state.locales)) {
      if(find(this.state.selected_supported_locales, local => local.name.indexOf('[') === -1)) {
        const newState = {...this.state}
        newState.selected_supported_locales = intersectionBy(this.state.locales, newState.selected_supported_locales, 'id')
        this.setState(newState)
      }
    }
  }

  setFieldsForEdit() {
    const { resource } = this.props;
    const { typeAttr } = this.state;
    const attrs = [
      'id', 'external_id', 'name', 'full_name', 'description', 'revision_date',
      'content_type', 'copyright', 'purpose', 'publisher', 'canonical_url', 'description',
      'custom_validation_schema', 'public_access', 'website', 'default_locale'
    ]
    const jsonAttrs = ['jurisdiction', 'contact', 'identifier']
    const newState = {...this.state}
    attrs.forEach(attr => set(newState.fields, attr, get(resource, attr, '') || ''))
    jsonAttrs.forEach(attr => this.setJSONValue(resource, newState, attr))
    newState.fields.supported_locales = isArray(resource.supported_locales) ? resource.supported_locales.join(',') : resource.supported_locales;

    newState.custom_validation_schema = get(resource, 'custom_validation_schema') || 'None';
    newState.fields[typeAttr] = get(resource, typeAttr, '') || '';
    newState[`selected_${typeAttr}`] = {id: resource[typeAttr], name: resource[typeAttr]}
    newState.selected_default_locale = {id: resource.default_locale, name: resource.default_locale}
    newState.selected_supported_locales = map(resource.supported_locales, l => ({id: l, name: l}))
    newState.fields.extras = isEmpty(resource.extras) ? newState.fields.extras : map(resource.extras, (v, k) => ({key: k, value: v}))
    this.setState(newState, this.setSupportedLocales);
  }

  setJSONValue(resource, state, field) {
    const value = get(resource, field);
    if(isEmpty(value))
      return

    if(isObject(value)) set(state.fields, field, JSON.stringify(value))
    else set(state.fields, field, value)
  }

  getIdHelperText() {
    const { defaultIdText, resourceType, urlPath } = this.props
    const id = this.state.fields.id || `[${defaultIdText}]`
    return (
      <span>
        <span>Allowed characters are : Alphabets(a-z,A-Z), Numbers(0-9) and Hyphen(-).</span>
        <br />
        <span>
          <span>{`Your new ${resourceType} will live at: `}<br />
            {
              `${getCurrentURL()}/${urlPath}/`
            }
          </span>
          <span><b>{id}</b>/</span>
        </span>
      </span>
    )
  }

  onTextFieldChange = event => {
    this.setFieldValue(event.target.id, event.target.value)
  }

  onAutoCompleteChange = (id, item) => {
    this.setFieldValue(id, get(item, 'id', ''), true)
  }

  onMultiAutoCompleteChange = (event, items) => {
    this.setFieldValue('fields.supported_locales', map(items, 'id').join(','))
    this.setFieldValue('selected_supported_locales', items)
  }

  setFieldValue(id, value, setObject=false) {
    const newState = {...this.state}
    set(newState, id, value)

    const fieldName = get(id.split('fields.'), '1')
    if(fieldName && !isEmpty(value) && get(newState.fieldErrors, fieldName))
      newState.fieldErrors[fieldName] = null
    if(setObject)
      newState[`selected_${fieldName}`] = {id: value, name: value}
    this.setState(newState)
  }

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const { parentURL, edit, urlPath } = this.props
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    if(parentURL && isFormValid) {
      const fields = this.getPayload()
      const service = APIService.new().overrideURL(parentURL)
      if(edit)
        service.put(fields).then(response => this.handleSubmitResponse(response))
      else
        service.appendToUrl(`${urlPath}/`).post(fields).then(response => this.handleSubmitResponse(response))
    }
  }

  getPayload() {
    let fields = cloneDeep(this.state.fields);

    if(this.isSource()) {
      delete fields.collection_type;
      delete fields.immutable;
    } else {
      delete fields.content_type;
      delete fields.source_type;
    }

    fields.extras = arrayToObject(fields.extras)

    if(this.props.edit)
      fields.update_comment = fields.comment
    fields = pickBy(fields, value => value)

    return fields
  }

  handleSubmitResponse(response) {
    const { edit, reloadOnSuccess, onCancel, resourceType } = this.props
    if(response.status === 201 || response.status === 200) { // success
      const verb = edit ? 'updated' : 'created'
      const successMsg = `Successfully ${verb} ${resourceType}`;
      const message = reloadOnSuccess ? successMsg + '. Reloading..' : successMsg;
      onCancel();
      alertifyjs.success(message, 1, () => {
        if(reloadOnSuccess)
          window.location.reload()
      })
    } else { // error
      const genericError = get(response, '__all__')
      if(genericError) {
        alertifyjs.error(genericError.join('\n'))
      } else {
        this.setState(
          {fieldErrors: response || {}},
          () => alertifyjs.error('Please fill mandatory fields.')
        )
      }
    }
  }

  onAddExtras = () => {
    this.setFieldValue('fields.extras', [...this.state.fields.extras, cloneDeep(JSON_MODEL)])
  }

  onDeleteExtras = index => {
    const newState = {...this.state}
    pullAt(newState.fields.extras, index)
    this.setState(newState)
  }

  onExtrasChange = (index, key, value) => {
    const newState = {...this.state}
    if(key !== '__')
      newState.fields.extras[index].key = key
    if(value !== '__')
      newState.fields.extras[index].value = value
    this.setState(newState)
  }

  render() {
    const {
      fields, fieldErrors, locales, selected_default_locale, selected_supported_locales, typeAttr,
      selected_source_type, selected_collection_type,
    } = this.state;
    const { onCancel, edit, types, resourceType, placeholders, extraFields } = this.props;
    const isSource = this.isSource()
    const selected_type = isSource ? selected_source_type : selected_collection_type;
    const isLoading = isEmpty(locales);
    const resourceTypeLabel = startCase(resourceType)
    const header = edit ? `Edit ${resourceTypeLabel}: ${fields.id}` : `New ${resourceTypeLabel}`
    return (
      <div className='col-md-12' style={{marginBottom: '30px'}}>
        <div className='col-md-12 no-side-padding'>
          <h2>{header}</h2>
        </div>
        {
          isLoading ?
          <div style={{width: '100%', textAlign: 'center', marginTop: '100px'}}>
            <CircularProgress />
          </div>:
          <div className='col-md-12 no-side-padding'>
            <form>
              {
                !edit &&
                <div className='col-md-12 no-side-padding' style={{width: '100%'}}>
                  <TextField
                    error={Boolean(fieldErrors.id)}
                    id="fields.id"
                    label="Short Code"
                    placeholder={get(placeholders, 'id', '')}
                    helperText={this.getIdHelperText()}
                    variant="outlined"
                    fullWidth
                    required
                    onChange={this.onTextFieldChange}
                    value={fields.id}
                    disabled={edit}
                  />
                </div>
              }
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <TextField
                  error={Boolean(fieldErrors.name)}
                  id="fields.name"
                  label="Name"
                  placeholder={get(placeholders, 'name', '')}
                  variant="outlined"
                  fullWidth
                  required
                  onChange={this.onTextFieldChange}
                  value={fields.name}
                />
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <TextField
                  error={Boolean(fieldErrors.full_name)}
                  id="fields.full_name"
                  label="Full Name"
                  placeholder={get(placeholders, 'full_name', '')}
                  variant="outlined"
                  fullWidth
                  required
                  onChange={this.onTextFieldChange}
                  value={fields.full_name}
                />
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <TextField
                  error={Boolean(fieldErrors.description)}
                  id="fields.description"
                  label="Description"
                  variant="outlined"
                  fullWidth
                  onChange={this.onTextFieldChange}
                  value={fields.description}
                />
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <TextField
                  error={Boolean(fieldErrors.website)}
                  id="fields.website"
                  label="Website"
                  placeholder={get(placeholders, 'website', '')}
                  variant="outlined"
                  fullWidth
                  onChange={this.onTextFieldChange}
                  value={fields.website}
                  type='url'
                />
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <Autocomplete
                  openOnFocus
                  getOptionSelected={(option, value) => option.id === get(value, 'id')}
                  value={selected_type}
                  id={`fields.${typeAttr}`}
                  options={types}
                  getOptionLabel={(option) => option.name}
                  fullWidth
                  required
                  renderInput={
                    params => <TextField
                                {...params}
                                error={Boolean(fieldErrors[typeAttr])}
                                      required
                                      label={`${resourceTypeLabel} Type`}
                                      variant="outlined"
                                      fullWidth
                    />
                  }
                  onChange={(event, item) => this.onAutoCompleteChange(`fields.${typeAttr}`, item)}
                />
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Public Access</InputLabel>
                  <Select
                    required
                    id="fields.public_access"
                    value={fields.public_access}
                    onChange={event => this.setFieldValue('fields.public_access', event.target.value)}
                    label="Public Access"
                  >
                    <MenuItem value='None'>None</MenuItem>
                    <MenuItem value='View'>View</MenuItem>
                    <MenuItem value='Edit'>Edit</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <Autocomplete
                  openOnFocus
                  getOptionSelected={(option, value) => option.id === get(value, 'id')}
                  value={selected_default_locale}
                  id="fields.default_locale"
                  options={locales}
                  getOptionLabel={(option) => option.name}
                  fullWidth
                  required
                  renderInput={
                    params => <TextField
                                {...params}
                                error={Boolean(fieldErrors.default_locale)}
                                      required
                                      label="Default Locale"
                                      variant="outlined"
                                      fullWidth
                    />
                  }
                  onChange={(event, item) => this.onAutoCompleteChange('fields.default_locale', item)}
                />
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <Autocomplete
                  className='multi-auto-select'
                  multiple
                  openOnFocus
                  filterSelectedOptions
                  getOptionSelected={(option, value) => option.id === get(value, 'id')}
                  value={selected_supported_locales}
                  id="fields.supported_locales"
                  options={locales}
                  getOptionLabel={(option) => option.name}
                  fullWidth
                  required
                  renderInput={
                    params => <TextField
                                {...params}
                                error={Boolean(fieldErrors.supported_locales)}
                                      label="Supported Locales"
                                      variant="outlined"
                                      id='supported-locale-input'
                                      required
                                      fullWidth
                    />
                  }
                  onChange={this.onMultiAutoCompleteChange}
                />
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Custom Validation Schema</InputLabel>
                  <Select
                    required
                    id="fields.custom_validation_schema"
                    value={fields.custom_validation_schema}
                    onChange={event => this.setFieldValue('fields.custom_validation_schema', event.target.value)}
                    label="Custom Validation Schema"
                  >
                    <MenuItem value='None'>None</MenuItem>
                    <MenuItem value='OpenMRS'>OpenMRS</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <TextField
                  error={Boolean(fieldErrors.external_id)}
                  id="fields.external_id"
                  label="External ID"
                  placeholder={get(placeholders, 'external_id', '')}
                  variant="outlined"
                  fullWidth
                  onChange={this.onTextFieldChange}
                  value={fields.external_id}
                />
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <TextField
                  error={Boolean(fieldErrors.canonical_url)}
                  id="fields.canonical_url"
                  label="Canonical URL"
                  placeholder={get(placeholders, 'canonical_url', '')}
                  variant="outlined"
                  fullWidth
                  onChange={this.onTextFieldChange}
                  value={fields.canonical_url}
                  type='url'
                />
              </div>
              {
                map(extraFields, attr => (
                  <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}} key={attr}>
                    <TextField
                      error={Boolean(get(fieldErrors, attr))}
                      id={`fields.${attr}`}
                      label={startCase(attr)}
                      variant="outlined"
                      fullWidth
                      onChange={this.onTextFieldChange}
                      value={fields[attr]}
                    />
                  </div>
                ))
              }
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <TextField
                  error={Boolean(fieldErrors.revision_date)}
                  id="fields.revision_date"
                  label="Revision Date"
                  variant="outlined"
                  fullWidth
                  onChange={this.onTextFieldChange}
                  value={fields.revision_date}
                  type='date'
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <div className='col-md-8'>
                  <h3>Custom Attributes</h3>
                </div>
                <div className='col-md-4' style={{textAlign: 'right'}}>
                  <IconButton color='primary' onClick={this.onAddExtras}>
                    <AddIcon />
                  </IconButton>
                </div>
                {
                  map(fields.extras, (extra, index) => (
                    <div className='col-md-12 no-side-padding' key={index} style={index > 0 ? {marginTop: '5px', width: '100%'} : {width: '100%'}}>
                      <ExtrasForm
                        extra={extra}
                        index={index}
                        onChange={this.onExtrasChange}
                        onDelete={this.onDeleteExtras}
                      />
                    </div>
                  ))
                }
              </div>
              <div className='col-md-12' style={{textAlign: 'center', margin: '15px 0'}}>
                <Button style={{margin: '0 10px'}} color='primary' variant='outlined' type='submit' onClick={this.onSubmit}>
                  {edit ? 'Update' : 'Create'}
                </Button>
                <Button style={{margin: '0 10px'}} variant='outlined' onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        }
      </div>
    )
  }
}

export default ConceptContainerForm;
