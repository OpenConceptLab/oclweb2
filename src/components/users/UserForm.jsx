import React from 'react';
import alertifyjs from 'alertifyjs';
import { TextField, Button } from '@material-ui/core';
import {set, get, isEmpty, cloneDeep, merge} from 'lodash';
import APIService from '../../services/APIService';

class UserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldErrors: {},
      fields: {
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        company: '',
        location: '',
      }
    }
  }

  componentDidMount() {
    if(this.props.edit && this.props.user)
      this.setFieldsForEdit()
  }

  setFieldsForEdit() {
    const { user } = this.props;
    const attrs = ['username', 'first_name', 'last_name', 'email', 'company', 'location',]
    const newState = {...this.state}
    attrs.forEach(attr => set(newState.fields, attr, get(user, attr, '') || ''))
    if(newState.fields.first_name === '-')
      newState.fields.first_name = ''
    if(newState.fields.last_name === '-')
      newState.fields.last_name = ''
    this.setState(newState);
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
      if(edit) {
        APIService.users(fields.username).put(fields).then(response => this.handleSubmitResponse(response))
      } else {
        APIService.users().post(fields).then(response => this.handleSubmitResponse(response))
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
