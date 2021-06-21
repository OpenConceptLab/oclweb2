import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  TextField, Button, IconButton, FormControlLabel, Checkbox
} from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import {
  set, get, isEmpty, cloneDeep, merge, map, pullAt, isEqual, uniq, without, includes,
} from 'lodash';
import APIService from '../../services/APIService';
import { arrayToObject, isAdminUser, getCurrentUserUsername } from '../../common/utils';
import { AUTH_GROUPS } from '../../common/constants';
import ExtrasForm from '../common/ExtrasForm';
const EXTRAS_MODEL = {key: '', value: ''}

class UserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAdminUser: isAdminUser(),
      isUserEditingSelf: false,
      fieldErrors: {},
      fields: {
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        company: '',
        location: '',
        extras: [cloneDeep(EXTRAS_MODEL)],
        auth_groups: [],
      }
    }
  }

  componentDidMount() {
    if(this.props.edit && this.props.user)
      this.setFieldsForEdit()
  }

  setFieldsForEdit() {
    const { user } = this.props;
    const attrs = ['username', 'first_name', 'last_name', 'email', 'company', 'location', 'auth_groups']
    const newState = {...this.state}
    attrs.forEach(attr => set(newState.fields, attr, get(user, attr, '') || ''))
    if(newState.fields.first_name === '-')
      newState.fields.first_name = ''
    if(newState.fields.last_name === '-')
      newState.fields.last_name = ''
    newState.fields.extras = isEmpty(user.extras) ? newState.fields.extras : map(user.extras, (v, k) => ({key: k, value: v}))
    newState.isUserEditingSelf = getCurrentUserUsername() === user.username
    this.setState(newState);
  }

  onTextFieldChange = event => this.setFieldValue(event.target.id, event.target.value)

  onAuthGroupChange = event => {
    const group = event.target.id
    const applied = event.target.checked
    let groups = cloneDeep(this.state.fields.auth_groups)
    if(applied)
      groups = uniq([...groups, group])
    else
      groups = without(groups, group)
    this.setFieldValue('fields.auth_groups', groups)
  }

  setFieldValue(id, value) {
    const newState = {...this.state}
    set(newState, id, value)

    const fieldName = get(id.split('fields.'), '1')
    if(fieldName && !isEmpty(value) && get(newState.fieldErrors, fieldName))
      newState.fieldErrors[fieldName] = null
    this.setState(newState)
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

  canEditAuthGroups = () => this.state.isAdminUser && !this.state.isUserEditingSelf

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const { edit, user } = this.props
    let fields = cloneDeep(this.state.fields);
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()

    const isFormValid = form.checkValidity()
    if(isFormValid) {
      fields.extras = arrayToObject(fields.extras)
      if(!this.canEditAuthGroups() || (edit && isEqual(user.auth_groups, fields.auth_groups)))
        delete fields.auth_groups;

      if(edit) {
        APIService.users(fields.username).put(fields, null, null, {includeAuthGroups: true, includeSubscribedOrgs: true}).then(response => this.handleSubmitResponse(response))
      } else {
        APIService.users().post(fields, null, null, {includeAuthGroups: true, includeSubscribedOrgs: true}).then(response => this.handleSubmitResponse(response))
      }
    }
  }

  handleSubmitResponse(response) {
    const { edit, reloadOnSuccess, onCancel, loggedIn } = this.props
    if(response.status === 201 || response.status === 200) { // success
      if(loggedIn) this.updateCachedUserInfo(response.data)
      const verb = edit ? 'updated' : 'created'
      const successMsg = `Successfully ${verb} user`;
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

  updateCachedUserInfo(updatedUser) {
    localStorage.setItem(
      'user',
      JSON.stringify(merge(JSON.parse(localStorage.user), updatedUser))
    )
  }

  render() {
    const { fields, fieldErrors } = this.state;
    const { onCancel, edit } = this.props;
    const header = edit ? `Edit User: ${fields.username}` : 'New User';
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
                  error={Boolean(fieldErrors.username)}
                  id="fields.username"
                  label="Username"
                  variant="outlined"
                  fullWidth
                  onChange={this.onTextFieldChange}
                  value={fields.username}
                  disabled={edit}
                  required
                />
              </div>
            }
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
              <TextField
                id="fields.first_name"
                label="First Name"
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.first_name}
                required
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
              <TextField
                id="fields.last_name"
                label="Last Name"
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.last_name}
                required
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
              <TextField
                id="fields.email"
                label="Email"
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.email}
                required
                type='email'
              />
            </div>
            <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
              <TextField
                id="fields.company"
                label="Company"
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
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.location}
              />
            </div>
            {
              this.canEditAuthGroups() &&
              <div className='col-md-12' style={{marginTop: '15px', width: '100%'}}>
                {
                  map(AUTH_GROUPS, group => (
                    <div className='col-md-4 no-side-padding' key={group.id}>
                      <FormControlLabel
                        control={<Checkbox checked={includes(fields.auth_groups, group.id)} onChange={this.onAuthGroupChange} id={group.id} name="fields.auth_groups" />}
                        label={group.name}
                      />
                    </div>
                  ))
                }

              </div>
            }
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

export default UserForm;
