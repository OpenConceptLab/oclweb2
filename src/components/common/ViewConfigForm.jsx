import React from 'react';
import alertifyjs from 'alertifyjs';
import { get, map, set, findIndex, cloneDeep, find, reject, values, isEmpty } from 'lodash';
import {
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  FormHelperText
} from '@material-ui/core';
import {
  Visibility as PreviewIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@material-ui/icons';
import APIService from '../../services/APIService';
import { ORANGE } from '../../common/constants';
import JSONEditor from './JSONEditor';

const DEFAULT_STATE = {
  name: '',
  config: {},
  is_default: false,
};

const NEW_CONFIG = {id: 'new', name: 'New Configuration'};

class ViewConfigForm extends React.Component {
  constructor(props) {
    super(props);
    const initialConfig = get(props.previewFields, 'config') ? cloneDeep(props.previewFields.config) : cloneDeep(get(props.selected, 'config', {}));
    this.state = {
      initialConfig: initialConfig,
      selected: props.selected,
      selectedConfig: findIndex([...props.configs, NEW_CONFIG], props.selected),
      fields: props.previewFields ? cloneDeep(props.previewFields) : cloneDeep(DEFAULT_STATE),
      errors: null,
    }
  }

  componentDidMount() {
    this.setFieldsForEdit()
  }

  setFieldsForEdit() {
    const { previewFields } = this.props;
    const { selected } = this.state;
    const newState = {...this.state}
    const attrs = ['name', 'layout', 'page_size', 'config', 'is_default']
    attrs.forEach(
      attr => {
        if(isEmpty(previewFields))
          set(newState, `fields.${attr}`, get(selected, attr))
        else
          set(newState, `fields.${attr}`, get(previewFields, attr))
      }
    )
    newState.initialConfig = get(previewFields, 'config') ? cloneDeep(previewFields.config) : cloneDeep(get(selected, 'config', {}))
    this.setState(newState)
  }

  setFieldValue(id, value, callback) {
    const newState = {...this.state}
    set(newState, id, value)
    this.setState(newState, () => {
      if(id === 'selected') {
        (value.id === 'new') ?
        this.setState({fields: cloneDeep(DEFAULT_STATE)}) :
        this.setFieldsForEdit()
      }
      if(callback) callback();
    })
  }

  onTextFieldChange = event => {
    this.setFieldValue(event.target.id, event.target.value)
  }

  getDefaultCheckboxHelperText() {
    const { configs } = this.props;
    const { selected, fields } = this.state;
    const existingDefaultConfigOtherThanSelected = find(reject(configs, {name: selected.name}), {is_default: true});

    if(existingDefaultConfigOtherThanSelected && fields.is_default)
      return (
        <FormHelperText style={{color: ORANGE}}>
          This action will <b>un-default</b> existing configuration: {existingDefaultConfigOtherThanSelected.name}.
        </FormHelperText>
      )

    if(selected.is_default && !fields.is_default)
      return (
        <FormHelperText style={{color: ORANGE}}>
          This action will leave no default configuration to apply.
        </FormHelperText>
      )

  }

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()

    const isFormValid = form.checkValidity()

    if(isFormValid)
      this.setState({errors: null}, () => this.state.selected.id === 'new' ? this.createConfiguration() : this.updateConfiguration())
  }

  createConfiguration() {
    const { fields } = this.state;
    const { resourceURL, onCancel, reloadOnSuccess } = this.props;
    APIService.new().overrideURL(resourceURL).appendToUrl('client-configs/').post(fields).then(response => {
      if(get(response, 'status') === 201) {
        alertifyjs.success('Successfully created new configuration. Reloading...', 1, () => {
          onCancel();
          if(reloadOnSuccess)
            window.location.reload()
        })
      } else this.setState(
        {errors: response},
        () => alertifyjs.error('Invalid Configurations')
      )
    })
  }

  updateConfiguration() {
    const { selected, fields } = this.state;
    const { onCancel, reloadOnSuccess } = this.props;
    APIService.new().overrideURL(selected.url).put(fields).then(response => {
      if(get(response, 'status') === 200) {
        alertifyjs.success('Successfully updated configuration. Reloading...', 1, () => {
          onCancel();
          if(reloadOnSuccess)
            window.location.reload()
        })
      } else this.setState(
        {errors: response},
        () => alertifyjs.error('Invalid Configurations')
      )
    })
  }

  moveToCreateSimilar = () => {
    const { selected } = this.state;
    const newState = {...this.state}
    newState.fields.name = ''
    newState.fields.is_default = false
    newState.fields.config = selected.config
    newState.selected = NEW_CONFIG;
    this.setState(newState);
  }

  toggleDefault() {
    this.setFieldValue('fields.is_default', !this.state.fields.is_default)
  }

  onConfigurationChange(config) {
    const newState = {...this.state}
    newState.errors = null
    newState.initialConfig = {}
    newState.selected = config
    newState.fields.name = config.name
    newState.fields.config = config.config
    newState.fields.is_default = config.is_default
    this.setState(newState, () => {
      this.setState({initialConfig: cloneDeep(get(config, 'config', {}))}, () => {
        if(config.id !== 'new')
          this.props.onChange(this.state.fields)
      })
    })
  }

  onDelete() {
    alertifyjs.confirm(
      `Delete Configuration: ${this.state.selected.name}`,
      'Are you sure you want to delete this?',
      () => APIService.new().overrideURL(this.state.selected.url).delete().then(() => alertifyjs.success('Successfully Deleted. Reload...', 1, () => window.location.reload())),
      () => {}
    )
  }

  getErrorHelperText() {
    const { errors } = this.state
    return isEmpty(errors) ? '' : values(errors).join('\n')
  }

  onJSONUpdate = value => {
    this.setFieldValue('fields.config', value.jsObject, () => {
      if(!value.error && this.props.onChange) {
        this.props.onChange(this.state.fields)
      }
    })
  }

  togglePreview = () => {
    this.props.onCancel()
    this.props.onPreview({fields: this.state.fields, selected: this.state.selected})
  }

  onCancel = () => {
    this.props.onPreview(null)
    this.props.onCancel()
  }

  render() {
    const { configs } = this.props;
    const { selected, fields, initialConfig, errors } = this.state;
    const isOCLDefaultConfigSelected = get(selected, 'web_default');
    const configOptions = [...configs, NEW_CONFIG];
    const isNew = get(selected, 'id') === 'new';
    const isDefault = fields.is_default;
    return (
      <div className='col-md-12' style={{marginBottom: '30px'}}>
        <div className='col-md-12 no-side-padding'>
          <h2>Manage View Configurations</h2>
        </div>
        <div className='col-md-6 no-side-padding' style={{marginTop: '15px'}}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Select Configuration</InputLabel>
            <Select
              required
              id="config"
              value={findIndex(configOptions, selected)}
              onChange={event => this.onConfigurationChange(configOptions[event.target.value])}
              label="Existing Configuration"
            >
              {
                map(configOptions, (config, index) => (
                  <MenuItem key={index} value={index}>
                    {
                      config.id === 'new' ?
                      <i>{config.name}</i> :
                      config.name
                    }
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
        <div className="col-md-6 no-right-padding flex-vertical-center" style={{marginTop: '15px', height: '56px'}}>
          {
            !isOCLDefaultConfigSelected &&
            <Button size="small" color={isDefault ? 'primary' : 'default'} variant="outlined" onClick={() => this.toggleDefault()}>
              {isDefault ? 'Un-Default': 'Default'}
            </Button>
          }
          {
            !isOCLDefaultConfigSelected &&
            <Button style={{marginLeft: '4px'}} size="small" variant="outlined" onClick={() => this.onDelete()}>
              Delete
            </Button>
          }
          {
            !isNew &&
            <Button style={{marginLeft: '4px'}} size="small" variant="outlined" onClick={this.moveToCreateSimilar}>Create Similar</Button>
          }
        </div>
        <div className="col-md-12 no-side-padding">
          {this.getDefaultCheckboxHelperText()}
        </div>
        <div className='col-md-12 no-side-padding' style={{marginTop: '15px'}}>
          <form>
            <div className='col-md-12 no-side-padding' style={{width: '100%'}}>
              <h3 className="form-subheading">View/Edit Configuration</h3>
            </div>
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px'}}>
              <TextField
                error={!isEmpty(errors)}
                id="fields.name"
                label="Name"
                placeholder="Give a name to this configuration"
                variant="outlined"
                fullWidth
                required
                onChange={this.onTextFieldChange}
                value={fields.name}
                disabled={isOCLDefaultConfigSelected}
                helperText={this.getErrorHelperText()}
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{marginTop: '5px', width: '100%'}}>
              <JSONEditor
                placeholder={initialConfig}
                viewOnly={isOCLDefaultConfigSelected}
                onChange={this.onJSONUpdate}
              />
            </div>
            <div className='col-md-12' style={{textAlign: 'center', margin: '15px 0'}}>
              <Button style={{margin: '0 10px'}} color='primary' variant='outlined' onClick={this.togglePreview} startIcon={<PreviewIcon />}>
                Preview
              </Button>
              <Button className='green-btn-outlined' style={{margin: '0 10px'}} variant='outlined' type='submit' onClick={this.onSubmit} startIcon={<SaveIcon />} disabled={isOCLDefaultConfigSelected}>
                {isNew ? 'Create' : 'Update'}
              </Button>
              <Button className='red-btn-outlined' style={{margin: '0 10px'}} variant='outlined' onClick={this.onCancel} startIcon={<CancelIcon />}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default ViewConfigForm;
