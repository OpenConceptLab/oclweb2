import React from 'react';
import alertifyjs from 'alertifyjs';
import { TextField, Button, IconButton } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import {
  set, get, cloneDeep, isEmpty, pickBy, pullAt, map
} from 'lodash';
import APIService from '../../services/APIService';
import { arrayToObject, toFullURL } from '../../common/utils';
import ExtrasForm from '../common/ExtrasForm';

const EXTRAS_MODEL = {key: '', value: ''}
class OrgForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldErrors: {},
      fields: {
        id: '',
        name: '',
        description: '',
        website: '',
        company: '',
        location: '',
        extras: [cloneDeep(EXTRAS_MODEL)],
      }
    }
  }

  componentDidMount() {
    if(this.props.edit && this.props.org)
      this.setFieldsForEdit()
  }

  setFieldsForEdit() {
    const { org } = this.props;
    const attrs = ['id', 'name', 'description', 'website', 'company', 'location',]
    const newState = {...this.state}
    attrs.forEach(attr => set(newState.fields, attr, get(org, attr, '') || ''))
    newState.fields.extras = isEmpty(org.extras) ? newState.fields.extras : map(org.extras, (v, k) => ({key: k, value: v}))
    this.setState(newState);
  }

  getIdHelperText() {
    const id = this.state.fields.id || "[org-id]"
    const url = toFullURL("/orgs/")
    return (
      <span>
        <span>Alphanumeric characters, hyphens, periods, and underscores are allowed.</span>
        <br />
        <span>
          <span>Your new organization will live at: <br />
            {url}
          </span>
          <span><b>{id}</b>/</span>
        </span>
      </span>
    )
  }

  onTextFieldChange = event => {
    this.setFieldValue(event.target.id, event.target.value)
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

    const { edit } = this.props
    let fields = cloneDeep(this.state.fields);
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()

    const isFormValid = form.checkValidity()
    if(isFormValid) {
      fields.extras = arrayToObject(fields.extras)
      fields = pickBy(fields, value => value)
      if(edit) {
        APIService.orgs(fields.id).put(fields).then(response => this.handleSubmitResponse(response))
      } else {
        APIService.orgs().post(fields).then(response => this.handleSubmitResponse(response))
      }
    }
  }

  handleSubmitResponse(response) {
    const { edit, reloadOnSuccess, onCancel } = this.props
    if(response.status === 201 || response.status === 200) { // success
      const verb = edit ? 'updated' : 'created'
      const successMsg = `Successfully ${verb} organization`;
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

  onAddExtras = () => this.setFieldValue(
    'fields.extras', [...this.state.fields.extras, cloneDeep(EXTRAS_MODEL)]
  )

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
    const { fields, fieldErrors } = this.state;
    const { onCancel, edit } = this.props;
    const header = edit ? `Edit Organization: ${fields.id}` : 'New Organization'
    return (
      <div className='col-md-12' style={{marginBottom: '30px'}}>
        <div className='col-md-12 no-side-padding'>
          <h2>{header}</h2>
        </div>
        <div className='col-md-12 no-side-padding'>
          <form>
            {
              !edit &&
              <div className='col-md-12 no-side-padding'>
                <TextField
                  error={Boolean(fieldErrors.id)}
                  id="fields.id"
                  label="Short Name"
                  placeholder="e.g. WHO"
                  helperText={this.getIdHelperText()}
                  variant="outlined"
                  fullWidth
                  onChange={this.onTextFieldChange}
                  value={fields.id}
                  disabled={edit}
                  required
                />
              </div>
            }
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
              <TextField
                id="fields.name"
                label="Full Name"
                placeholder="e.g. World Health Organization"
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.name}
                required
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
              <TextField
                id="fields.description"
                label="Description"
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.description}
                multiline
                rows={3}
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
              <TextField
                id="fields.website"
                label="Website"
                placeholder="e.g. http://www.who.int/"
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.website}
                type='url'
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
              <TextField
                id="fields.company"
                label="Company Name"
                placeholder="e.g. World Health Organization"
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.company}
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
              <TextField
                id="fields.location"
                label="Location"
                placeholder="e.g. Geneva, Switzerland"
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.location}
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
      </div>
    )
  }
}

export default OrgForm;
