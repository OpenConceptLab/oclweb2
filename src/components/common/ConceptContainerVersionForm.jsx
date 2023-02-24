import React from 'react';
import alertifyjs from 'alertifyjs';
import moment from 'moment';
import { TextField, Button, FormControlLabel, Checkbox, Autocomplete } from '@mui/material';
import { set, get, cloneDeep, isEmpty, pickBy, startCase, isBoolean, isObject, values, map } from 'lodash';
import APIService from '../../services/APIService';
import { recordGAUpsertEvent } from '../../common/utils';


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
        expansion_url: '',
        revision_date: '',
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
    const attrs = ['id', 'description', 'external_id', 'released', 'expansion_url', 'autoexpand']
    const newState = {...this.state}
    attrs.forEach(attr => set(newState.fields, attr, get(version, attr, '') || ''))
    if(version.revision_date)
      newState.fields.revision_date = moment(version.revision_date).format('YYYY-MM-DDTHH:mm')
    this.setState(newState);
  }

  onTextFieldChange = event => this.setFieldValue(event.target.id, event.target.value)

  onCheckboxChange = event => this.setFieldValue(event.target.name, event.target.checked)

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
    const { parentURL, edit, resource, resourceType } = this.props
    let fields = cloneDeep(this.state.fields);
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    if(parentURL && isFormValid) {
      const isCollectionVersion = (resource || resourceType) === 'collection'
      recordGAUpsertEvent(isCollectionVersion ? `Collection Version` : 'Source Version', edit)
      this.alert = alertifyjs.warning('Starting Version Creation. This might take few seconds.', 0)
      fields = pickBy(fields, value => value)

      if(isBoolean(this.state.fields.released))
        fields.released = this.state.fields.released
      if(fields.revision_date)
        fields.revision_date = moment(fields.revision_date).utc().format('YYYY-MM-DD HH:mm:ss')

      if(isCollectionVersion) {
        fields.autoexpand = isBoolean(this.state.fields.autoexpand) ? this.state.fields.autoexpand : false
        fields.expansion_url = this.state.fields.expansion_url || null
      } else {
        delete fields.autoexpand
        delete fields.expansion_url
      }


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
    if(this.alert)
      this.alert.dismiss();
    if(response.status === 201 || response.status === 200) { // success
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
        alertifyjs.error(genericError.join('<br />'))
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
    const { fields, fieldErrors } = this.state;
    const { onCancel, edit, version, resourceType, resource } = this.props;
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
            <div className='col-md-12 no-side-padding' style={{width: '100%', marginTop: '15px'}}>
              <TextField
                error={Boolean(fieldErrors.revision_date)}
                id="fields.revision_date"
                label="Revision Date"
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.revision_date || ''}
                type='datetime-local'
                InputLabelProps={{ shrink: true }}
              />
            </div>
            {
              resource === 'collection' && edit &&
              <div className='col-md-12 no-side-padding' style={{width: '100%', marginTop: '15px'}}>
                <Autocomplete
                  disablePortal
                  id="fields.expansion_url"
                  options={map(this.props.expansions, expansion => ({...expansion, label: `${expansion.mnemonic} (${expansion.url})`}))}
                  renderInput={params => <TextField {...params} label="Expansion URL" />}
                  onChange={(event, value) => this.setFieldValue('fields.expansion_url', get(value, 'url', ''))}
                  value={fields.expansion_url}
                  isOptionEqualToValue={(option, value) => value && option.url === value}
                />
              </div>
            }
            <div className='col-md-12' style={{width: '100%', marginTop: '15px'}}>
              <FormControlLabel
                control={<Checkbox checked={Boolean(fields.released)} onChange={this.onCheckboxChange} name="fields.released" />}
                label="Release"
              />
            </div>
            {
              resource === 'collection' &&
              <div className='col-md-12' style={{width: '100%', marginTop: '15px'}}>
                <FormControlLabel
                  control={<Checkbox checked={Boolean(fields.autoexpand)} onChange={this.onCheckboxChange} name="fields.autoexpand" />}
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
