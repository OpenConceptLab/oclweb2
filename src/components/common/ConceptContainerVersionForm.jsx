import React from 'react';
import alertifyjs from 'alertifyjs';
import { TextField, Button, FormControlLabel, Checkbox } from '@material-ui/core';
import { set, get, cloneDeep, isEmpty, pickBy, startCase } from 'lodash';
import APIService from '../../services/APIService';

class ConceptContainerVersionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        id: '',
        description: '',
        external_id: '',
        released: false,
        autoexpand: true,
      },
      fieldErrors: {},
    }
  }

  componentDidMount() {
    if(this.props.edit && this.props.version)
      this.setFieldsForEdit()
  }

  setFieldsForEdit() {
    const { version } = this.props;
    const attrs = ['id', 'description', 'external_id', 'released']
    const newState = {...this.state}
    attrs.forEach(attr => set(newState.fields, attr, get(version, attr, '') || ''))
    this.setState(newState);
  }

  onTextFieldChange = event => this.setFieldValue(event.target.id, event.target.value)

  onCheckboxChange = event => this.setFieldValue(event.target.name, event.target.checked)

  onAutoCompleteChange = (id, item) => this.setFieldValue(id, get(item, 'id', ''), true)

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

    const { parentURL, edit, resource } = this.props
    let fields = cloneDeep(this.state.fields);


    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    if(parentURL && isFormValid) {
      this.alert = alertifyjs.warning('Starting Version Creation. This might take few seconds.', 0)
      fields = pickBy(fields, value => value)
      fields.released = this.state.fields.released

      if(resource !== 'collection')
        delete fields.autoexpand
      else
        fields.autoexpand = this.state.fields.autoexpand

      let service = APIService.new().overrideURL(parentURL)
      if(edit) {
        service.put(fields).then(response => this.handleSubmitResponse(response))
      } else {
        service.appendToUrl('versions/').post(fields).then(response => this.handleSubmitResponse(response))
      }
    }
  }

  handleSubmitResponse(response) {
    const { edit, reloadOnSuccess, onCancel, resourceType, onSubmit } = this.props
    if(response.status === 201 || response.status === 200) { // success
      if(this.alert)
        this.alert.dismiss();
      const verb = edit ? 'updated' : 'created'
      const successMsg = `Successfully ${verb} ${resourceType} version`;
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
      } else {
        this.setState(
          {fieldErrors: response || {}},
          () => alertifyjs.error('Please fill mandatory fields.')
        )
      }
    }
  }

  render() {
    const { fields, fieldErrors } = this.state;
    const { onCancel, edit, version, resourceType } = this.props;
    const idLabel = fields.id ? fields.id : 'version-id';
    const resourceTypeLabel = startCase(resourceType)
    const versionLabel = `${version.short_code} [${idLabel}]`;
    const header = edit ? `Edit ${resourceTypeLabel} Version: ${versionLabel}` : `New ${resourceTypeLabel} Version: ${versionLabel}`;
    return (
      <div className='col-md-12' style={{marginBottom: '30px'}}>
        <div className='col-md-12 no-side-padding'>
          <h2>{header}</h2>
        </div>
        <div className='col-md-12 no-side-padding'>
          <form>
            {
              !edit &&
              <div className='col-md-12 no-side-padding' style={{width: '100%', marginTop: '15px'}}>
                <TextField
                  error={Boolean(fieldErrors.id)}
                  id="fields.id"
                  label="ID"
                  placeholder="Name this version"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={this.onTextFieldChange}
                  value={fields.id}
                  disabled={edit}
                  inputProps={{ pattern: "[a-zA-Z0-9-._@]+" }}
                  helperText="Alphanumeric characters, @, hyphens, periods, and underscores are allowed."
                />
              </div>
            }
            <div className='col-md-12 no-side-padding' style={{width: '100%', marginTop: '15px'}}>
              <TextField
                error={Boolean(fieldErrors.description)}
                id="fields.description"
                label="Description"
                placeholder="Describe this version"
                variant="outlined"
                fullWidth
                required
                onChange={this.onTextFieldChange}
                value={fields.description}
                multiline
                rows={3}
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{width: '100%', marginTop: '15px'}}>
              <TextField
                error={Boolean(fieldErrors.external_id)}
                id="fields.external_id"
                label="External ID"
                placeholder="e.g. UUID from external system"
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.external_id}
              />
            </div>
            <div className='col-md-12' style={{width: '100%', marginTop: '15px'}}>
              <FormControlLabel
                control={<Checkbox checked={fields.released} onChange={this.onCheckboxChange} name="fields.released" />}
                label="Release"
              />
            </div>
            {
              this.props.resource === 'collection' &&
              <div className='col-md-12' style={{width: '100%', marginTop: '15px'}}>
                <FormControlLabel
                  control={<Checkbox checked={fields.autoexpand} onChange={this.onCheckboxChange} name="fields.autoexpand" />}
                  label="Auto Expand"
                  disabled={edit}
                />
              </div>
            }
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

export default ConceptContainerVersionForm;
