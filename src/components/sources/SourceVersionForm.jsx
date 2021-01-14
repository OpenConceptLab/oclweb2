import React from 'react';
import alertifyjs from 'alertifyjs';
import { TextField, Button } from '@material-ui/core';
import { set, get, cloneDeep, isEmpty, pickBy } from 'lodash';
import APIService from '../../services/APIService';

class SourceVersionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        id: '',
        description: '',
        external_id: '',
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
    const attrs = ['id', 'description', 'external_id']
    const newState = {...this.state}
    attrs.forEach(attr => set(newState.fields, attr, get(version, attr, '') || ''))
    this.setState(newState);
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
      fields = pickBy(fields, value => value)
      let service = APIService.new().overrideURL(parentURL)
      if(edit) {
        service.put(fields).then(response => this.handleSubmitResponse(response))
      } else {
        service.appendToUrl('versions/').post(fields).then(response => this.handleSubmitResponse(response))
      }
    }
  }

  handleSubmitResponse(response) {
    const { edit, reloadOnSuccess, onCancel } = this.props
    if(response.status === 201 || response.status === 200) { // success
      const verb = edit ? 'updated' : 'created'
      const successMsg = `Successfully ${verb} source version`;
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
    const { onCancel, edit, version } = this.props;
    const idLabel = fields.id ? fields.id : 'version-id';
    const versionLabel = `${version.short_code} [${idLabel}]`;
    const header = edit ? `Edit Source Version: ${versionLabel}` : `New Source Version: ${versionLabel}`;
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
                  placeholder="Name this source version"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={this.onTextFieldChange}
                  value={fields.id}
                  disabled={edit}
                />
              </div>
            }
            <div className='col-md-12 no-side-padding' style={{width: '100%', marginTop: '15px'}}>
              <TextField
                error={Boolean(fieldErrors.description)}
                id="fields.description"
                label="Description"
                placeholder="Describe this source version"
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

export default SourceVersionForm;
