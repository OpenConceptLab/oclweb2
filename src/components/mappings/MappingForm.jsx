import React from 'react';
import alertifyjs from 'alertifyjs';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField, Button, CircularProgress, IconButton } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import {
  set, get, cloneDeep, isEmpty, pickBy, pullAt, map
} from 'lodash';
import APIService from '../../services/APIService';
import { arrayToObject, getCurrentURL, fetchMapTypes } from '../../common/utils';
import ExtrasForm from '../common/ExtrasForm';

const EXTRAS_MODEL = {key: '', value: ''}
class MappingForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldErrors: {},
      mapTypes: [],
      selected_map_type: null,
      fields: {
        id: '',
        map_type: '',
        external_id: '',
        from_concept_url: '',
        from_concept_code: '',
        from_concept_name: '',
        from_source_url: '',
        from_source_version: '',
        to_concept_url: '',
        to_concept_code: '',
        to_concept_name: '',
        to_source_url: '',
        to_source_version: '',
        comment: '',
        extras: [cloneDeep(EXTRAS_MODEL)],
      }
    }
  }

  componentDidMount() {
    fetchMapTypes(data => this.setState({mapTypes: data}))
    if(this.props.edit && this.props.mapping)
      this.setFieldsForEdit()
  }

  setFieldsForEdit() {
    const { mapping } = this.props;
    const attrs = [
      'id', 'map_type', 'external_id',
      'from_concept_url', 'from_concept_code', 'from_concept_name',
      'from_source_url', 'from_source_version',
      'to_concept_url', 'to_concept_code', 'to_concept_name',
      'to_source_url', 'to_source_version',
    ]
    const newState = {...this.state}
    attrs.forEach(attr => set(newState.fields, attr, get(mapping, attr, '') || ''))
    newState.selected_map_type = {id: mapping.map_type, name: mapping.map_type}
    newState.fields.extras = isEmpty(mapping.extras) ? newState.fields.extras : map(mapping.extras, (v, k) => ({key: k, value: v}))

    this.setState(newState);
  }

  getIdHelperText() {
    const id = this.state.fields.id || "[generated-mapping-id]"
    return (
      <span>
        <span>Alphanumeric characters, hyphens, periods, and underscores are allowed.</span>
        <br />
        <span>
          <span>Your new mapping will live at: <br />
            {
              `${getCurrentURL()}/mappings/`
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

    const { parentURL, edit } = this.props
    let fields = cloneDeep(this.state.fields);
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()

    const isFormValid = form.checkValidity()
    if(parentURL && isFormValid) {
      fields.extras = arrayToObject(fields.extras)
      if(edit)
        fields.update_comment = fields.comment
      fields = pickBy(fields, value => value)
      let service = APIService.new().overrideURL(parentURL)
      if(edit) {
        service.put(fields).then(response => this.handleSubmitResponse(response))
      } else {
        service.appendToUrl('mappings/').post(fields).then(response => this.handleSubmitResponse(response))
      }
    }
  }

  handleSubmitResponse(response) {
    const { edit, reloadOnSuccess, onCancel } = this.props
    if(response.status === 201 || response.status === 200) { // success
      const verb = edit ? 'updated' : 'created'
      const successMsg = `Successfully ${verb} mapping`;
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
    this.setFieldValue('fields.extras', [...this.state.fields.extras, cloneDeep(EXTRAS_MODEL)])
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
    const { fields, fieldErrors, selected_map_type, mapTypes } = this.state;
    const { onCancel, edit } = this.props;
    const isLoading = isEmpty(mapTypes);
    const header = edit ? `Edit Mapping: ${fields.id}` : 'New Mapping'
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
                <div className='col-md-12 no-side-padding'>
                  <TextField
                    error={Boolean(fieldErrors.id)}
                    id="fields.id"
                    label="Mapping ID"
                    placeholder="e.g. A15.0"
                    helperText={this.getIdHelperText()}
                    variant="outlined"
                    fullWidth
                    onChange={this.onTextFieldChange}
                    value={fields.id}
                    disabled={edit}
                  />
                </div>
              }
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <Autocomplete
                  getOptionSelected={(option, value) => option.id === get(value, 'id')}
                  value={selected_map_type}
                  id="fields.map_type"
                  options={mapTypes}
                  getOptionLabel={(option) => option.name}
                  fullWidth
                  required
                  renderInput={
                    params => <TextField
                                {...params}
                                error={Boolean(fieldErrors.map_type)}
                                      required
                                      label="Map Type"
                                      variant="outlined"
                                      fullWidth
                    />
                  }
                  onChange={(event, item) => this.onAutoCompleteChange('fields.map_type', item)}
                />
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <TextField
                  id="fields.external_id"
                  label="External ID"
                  placeholder="e.g. UUID from external system"
                  variant="outlined"
                  fullWidth
                  onChange={this.onTextFieldChange}
                  value={fields.external_id}
                />
              </div>
              {
                edit &&
                <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                  <TextField
                    id="fields.comment"
                    label="Update Comment"
                    variant="outlined"
                    fullWidth
                    onChange={this.onTextFieldChange}
                    value={fields.comment}
                    required
                  />
                </div>
              }
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <h3 className='divider'>
                  <span className='text'>From Concept</span>
                </h3>
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <div className='col-md-8 no-left-padding'>
                  <TextField
                    id="fields.from_source_url"
                    label="From Source URL"
                    placeholder="e.g. /orgs/MyOrg/sources/MySource/"
                    variant="outlined"
                    fullWidth
                    onChange={this.onTextFieldChange}
                    value={fields.from_source_url}
                  />
                </div>
                <div className='col-md-4 no-side-padding'>
                  <TextField
                    id="fields.from_source_version"
                    label="From Source Version"
                    placeholder="e.g. 2.46"
                    variant="outlined"
                    fullWidth
                    onChange={this.onTextFieldChange}
                    value={fields.from_source_version}
                  />
                </div>
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <TextField
                  id="fields.from_concept_url"
                  label="From Concept URL"
                  placeholder="e.g. /orgs/MyOrg/sources/MySource/concepts/1234/"
                  variant="outlined"
                  fullWidth
                  onChange={this.onTextFieldChange}
                  value={fields.from_concept_url}
                />
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <div className='col-md-8 no-left-padding'>
                  <TextField
                    id="fields.from_concept_name"
                    label="From Concept Name"
                    placeholder="e.g. A14"
                    variant="outlined"
                    fullWidth
                    onChange={this.onTextFieldChange}
                    value={fields.from_concept_name}
                  />
                </div>
                <div className='col-md-4 no-side-padding'>
                  <TextField
                    id="fields.from_concept_code"
                    label="From Concept Code"
                    placeholder="e.g. 1234"
                    variant="outlined"
                    fullWidth
                    onChange={this.onTextFieldChange}
                    value={fields.from_concept_code}
                  />
                </div>
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <h3 className='divider'>
                  <span className='text'>To Concept</span>
                </h3>
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <div className='col-md-8 no-left-padding'>
                  <TextField
                    id="fields.to_source_url"
                    label="To Source URL"
                    placeholder="e.g. /orgs/IHTSDO/sources/SNOMED-CT/"
                    variant="outlined"
                    fullWidth
                    onChange={this.onTextFieldChange}
                    value={fields.to_source_url}
                  />
                </div>
                <div className='col-md-4 no-side-padding'>
                  <TextField
                    id="fields.to_source_version"
                    label="To Source Version"
                    placeholder="e.g. v1.2"
                    variant="outlined"
                    fullWidth
                    onChange={this.onTextFieldChange}
                    value={fields.to_source_version}
                  />
                </div>
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <TextField
                  id="fields.to_concept_url"
                  label="To Concept URL"
                  placeholder="e.g. /orgs/CIEL/sources/CIEL/concepts/32/"
                  variant="outlined"
                  fullWidth
                  onChange={this.onTextFieldChange}
                  value={fields.to_concept_url}
                />
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <div className='col-md-8 no-left-padding'>
                  <TextField
                    id="fields.to_concept_name"
                    label="To Concept Name"
                    placeholder="e.g. Tuberculosis of lung, confirmed by culture only"
                    variant="outlined"
                    fullWidth
                    onChange={this.onTextFieldChange}
                    value={fields.to_concept_name}
                  />
                </div>
                <div className='col-md-4 no-side-padding'>
                  <TextField
                    id="fields.to_concept_code"
                    label="To Concept Code"
                    placeholder="e.g. A15.1"
                    variant="outlined"
                    fullWidth
                    onChange={this.onTextFieldChange}
                    value={fields.to_concept_code}
                  />
                </div>
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
              <div className='col-md-12' style={{textAlign: 'center', margin: '20px 0'}}>
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

export default MappingForm;
