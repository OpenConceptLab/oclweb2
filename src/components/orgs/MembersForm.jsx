import React from 'react';
import alertifyjs from 'alertifyjs';
import { Autocomplete, Alert } from '@mui/material';
import { Button, TextField } from '@mui/material';
import { reject, get, map, includes, forEach, compact } from 'lodash';
import APIService from '../../services/APIService';

class MembersForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
      selectedMembers: [],
      members: [],
      originalMembers: [],
      success: [],
      failed: [],
    }
  }

  componentDidMount() {
    this.fetchMembers();
    this.fetchUsers();
  }

  fetchMembers() {
    const { parentURL } = this.props;
    APIService.new().overrideURL(parentURL).appendToUrl('members/').get(null, null, {limit: 1000}).then(
      response => this.setState({originalMembers: response.data, selectedMembers: response.data, members: map(response.data, 'username')})
    )
  }

  fetchUsers() {
    APIService.users().get(null, null, {limit: 1000}).then(
      response => this.setState({users: response.data})
    )
  }

  onMultiAutoCompleteChange = (event, items) => {
    this.setState({selectedMembers: items, members: map(items, 'username')})
  }

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const { parentURL } = this.props
    if(parentURL) {
      this.setState({success: [], failed: []}, () => {
        this.createMembers()
        this.deleteMembers()
      })
    }
  }

  getService(memberUsername) {
    const { parentURL } = this.props
    return APIService.new().overrideURL(parentURL).appendToUrl(`members/${memberUsername}/`)
  }

  closeDrawerIfDone = () => {
    const totalMembers = compact([...this.getMembersToCreate(), ...this.getMembersToDelete()])
    if(this.state.success.length === totalMembers.length)
      window.location.reload();
  }

  createMembers() {
    const members = this.getMembersToCreate()
    forEach(members, member => {
      const service = this.getService(member.username)
      service.put().then(response => {
        if(get(response, 'status') === 204)
          this.setState(
            {success: [...this.state.success, member.username]},
            () => alertifyjs.success(`Successfully added ${member.username}`, 1, this.closeDrawerIfDone)
          )
        else
          this.setState(
            {failed: [...this.state.failed, member.username]},
            () => alertifyjs.error(`Failed to add ${member.username}`, 0)
          )
      })
    })
  }

  deleteMembers() {
    const members = this.getMembersToDelete()
    forEach(members, member => {
      const service = this.getService(member.username)
      service.delete().then(response => {
        if(get(response, 'status') === 204)
          this.setState(
            {success: [...this.state.success, member.username]},
            () => alertifyjs.success(`Successfully removed ${member.username}`, 1, this.closeDrawerIfDone)
          )
        else
          this.setState(
            {failed: [...this.state.failed, member.username]},
            () => alertifyjs.error(`Failed to remove ${member.username}`, 0)
          )
      })
    })
  }

  getMembersToCreate() {
    const { selectedMembers, originalMembers } = this.state
    return reject(selectedMembers, member => includes(map(originalMembers, 'username'), member.username))
  }

  getMembersToDelete() {
    const { members, originalMembers } = this.state
    return reject(originalMembers, member => includes(members, member.username))
  }

  getMemberDisplayName(member) {
    let name = member.username
    const memberName = member.name.trim()
    if(memberName && !includes(['- -', '-'], memberName))
      name += ` (${memberName})`
    return name
  }

  render() {
    const { onCancel } = this.props
    const { users, selectedMembers } = this.state;
    const membersToCreate = this.getMembersToCreate()
    const membersToDelete = this.getMembersToDelete();
    return (
      <div className='col-md-12' style={{marginBottom: '30px'}}>
        <div className='col-md-12 no-side-padding'>
          <h2>Manage Organization Membership</h2>
        </div>
        <div className='col-md-12 no-side-padding'>
          <form>
            <Autocomplete
              className='multi-auto-select'
              multiple
              openOnFocus
              filterSelectedOptions
              isOptionEqualToValue={(option, value) => option.username === get(value, 'username')}
              value={selectedMembers}
              options={users}
              getOptionLabel={this.getMemberDisplayName}
              fullWidth
              required
              renderInput={
                params => <TextField
                            {...params}
                            label="Organization Members"
                                   variant="outlined"
                                   id='org-members-input'
                                   fullWidth
                />
              }
              onChange={this.onMultiAutoCompleteChange}
            />
          </form>
          {
            map(membersToCreate, member => (
              <Alert key={member.username} variant="filled" severity="success" style={{margin: '5px 0'}}>
                <b>{member.username}</b> will be added to this org.
              </Alert>
            ))
          }
          {
            map(membersToDelete, member => (
              <Alert key={member.username} variant="filled" severity="warning" style={{margin: '5px 0'}}>
                <b>{member.username}</b> will be removed from this org.
              </Alert>
            ))
          }
          <div className='col-md-12' style={{textAlign: 'center', margin: '15px 0'}}>
            <Button style={{margin: '0 10px'}} color='primary' variant='outlined' type='submit' onClick={this.onSubmit}>
              Update
            </Button>
            <Button style={{margin: '0 10px'}} variant='outlined' onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default MembersForm;
