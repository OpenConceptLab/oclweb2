import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  get, set, findIndex, cloneDeep, find, reject, values, isEmpty, isArray, isNumber,
  isEqual
} from 'lodash';
import Autocomplete from '@mui/material/Autocomplete';
import {
  TextField, Button, MenuItem,
  FormHelperText, IconButton, Menu, MenuList, Chip
} from '@mui/material';
import {
  Visibility as PreviewIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MoreVert as MenuIcon,
} from '@mui/icons-material';
import APIService from '../../services/APIService';
import { ORANGE, WHITE } from '../../common/constants';
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
    this.menuRef = React.createRef();
    this.state = {
      resource: props.resource,
      templates: [],
      initialConfig: initialConfig,
      selected: props.selected,
      selectedConfig: findIndex([...props.configs, NEW_CONFIG], props.selected),
      fields: props.previewFields ? cloneDeep(props.previewFields) : cloneDeep(DEFAULT_STATE),
      errors: null,
      menu: false,
      configs: props.configs,
    }
  }

  fetchTemplates() {
    const { resource } = this.state;
    if(resource) {
      APIService.new().overrideURL(`/client-configs/${resource}/templates/`).get().then(response => this.setState({templates: isArray(response.data) ? response.data : []}))
    }
  }

  componentDidUpdate(prevProps) {
    if(!isEqual(prevProps.configs, this.props.configs))
      this.setState({configs: this.props.configs})
  }

  componentDidMount() {
    this.setFieldsForEdit()
    this.fetchTemplates()
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

  onTextFieldChange = event => this.setFieldValue(event.target.id, event.target.value)

  getDefaultCheckboxHelperText() {
    const { selected, fields, configs } = this.state;
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
    newState.menu = false
    this.setState(newState);
  }

  toggleDefault = () => {
    this.setFieldValue('fields.is_default', !this.state.fields.is_default)
    this.setState({menu: false})
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

  onDelete = () => {
    this.setState({menu: false})
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
    const { selected, fields, initialConfig, errors, menu, configs, templates } = this.state;
    const isOCLDefaultConfigSelected = get(selected, 'web_default');
    const isTemplateSelected = get(selected, 'is_template');
    const configOptions = [...configs, ...templates, NEW_CONFIG];
    const isNew = get(selected, 'id') === 'new';
    const isDefault = fields.is_default;
    return (
      <div className='col-md-12' style={{marginBottom: '30px', textAlign: 'left'}}>
        <div className='col-md-12 no-side-padding'>
          <h2>Manage Configurations</h2>
        </div>
        <div className='col-md-12 no-side-padding flex-vertical-center'>
          <div className='col-md-11 no-side-padding' style={{}}>
            <Autocomplete
              openOnFocus
              isOptionEqualToValue={(option, value) => option.id === get(value, 'id')}
              value={findIndex(configOptions, selected)}
              id="config"
              options={configOptions}
              getOptionLabel={option => {
                  let opt = option
                  if(isNumber(opt))
                    opt = get(configOptions, opt)

                  return get(opt, 'name', '')
              }}
              fullWidth
              required
              renderInput={
                params => <TextField
                            {...params}
                            required
                            label="Select"
                                   variant="outlined"
                                   fullWidth
                />
              }
              onChange={(event, item) => this.onConfigurationChange(item)}
              clearIcon={false}
              renderOption={
                (props, option) => (
                  <li {...props} key={option.name}>
                    <span className='flex-vertical-center'>
                      {
                        option.id === 'new' ?
                        <i>{option.name}</i> :
                        <span>{option.name}</span>
                      }
                      {
                        option.is_template &&
                        <span style={{marginLeft: '10px'}}>
                          <Chip style={{backgroundColor: ORANGE, color: WHITE, border: `1px solid ${ORANGE}`, fontSize: '10px'}} label="Template" size='small' />
                        </span>
                      }

                    </span>
                  </li>
                )
              }
            />
          </div>
          <div className='col-md-1 no-side-padding' style={{marginLeft: '5px'}}>
            <IconButton size='small' ref={this.menuRef} onClick={() => this.setState({menu: !menu})}>
              <MenuIcon />
            </IconButton>
          </div>
        </div>
        <div className='col-md-12 no-side-padding' style={{marginBottom: '35px'}}>
          {this.getDefaultCheckboxHelperText()}
        </div>
        {
          menu &&
          <Menu open anchorEl={this.menuRef.current} onClose={() => this.setState({menu: false})}>
            <MenuList id="split-button-menu">
              {
                !isOCLDefaultConfigSelected && !isTemplateSelected &&
                <MenuItem onClick={this.toggleDefault}>
                  {isDefault ? 'Un-Default': 'Mark Default'}
                </MenuItem>
              }
              {
                !isNew &&
                <MenuItem onClick={this.moveToCreateSimilar}>
                  Create Similar
                </MenuItem>
              }
              {
                !isOCLDefaultConfigSelected && !isTemplateSelected &&
                <MenuItem onClick={this.onDelete}>
                  Delete
                </MenuItem>
              }
            </MenuList>
          </Menu>
        }
        <div className='col-md-12 no-side-padding' style={{}}>
          <form>
            <div className='col-md-12 no-side-padding' style={{}}>
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
                disabled={isOCLDefaultConfigSelected || isTemplateSelected}
                helperText={this.getErrorHelperText()}
                size='small'
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{marginTop: '5px', width: '100%'}}>
              <JSONEditor
                placeholder={initialConfig}
                viewOnly={isOCLDefaultConfigSelected ||  isTemplateSelected}
                onChange={this.onJSONUpdate}
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{textAlign: 'center', margin: '10px 0'}}>
              <Button size='small' style={{margin: '2px'}} color='primary' variant='outlined' onClick={this.togglePreview} startIcon={<PreviewIcon fontSize='inherit' />}>
                Preview
              </Button>
              <Button size='small' className='green-btn-outlined' style={{margin: '2px'}} variant='outlined' type='submit' onClick={this.onSubmit} startIcon={<SaveIcon fontSize='inherit' />} disabled={isOCLDefaultConfigSelected || isTemplateSelected}>
                {isNew ? 'Create' : 'Update'}
              </Button>
              <Button size='small' className='red-btn-outlined' style={{margin: '2px'}} variant='outlined' onClick={this.onCancel} startIcon={<CancelIcon fontSize='inherit' />}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default ViewConfigForm;
