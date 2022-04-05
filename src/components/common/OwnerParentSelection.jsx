import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import {
  TextField
} from '@mui/material';
import { Person as PersonIcon, Home as HomeIcon } from '@mui/icons-material';
import { get, map, uniqBy, startCase, compact } from 'lodash';
import APIService from '../../services/APIService';
import { ORANGE } from '../../common/constants';
import { getCurrentUser } from '../../common/utils'

const OwnerParentSelection = ({
  selectedOwner, selectedParent, requiredParent, requiredOwner, onChange, disabled
}) => {
  const currentUser = getCurrentUser()
  const [owner, setOwner] = React.useState(selectedOwner || null)
  const [parent, setParent] = React.useState(selectedParent || null)
  const [owners, setOwners] = React.useState(compact([selectedOwner]))
  const [parents, setParents] = React.useState(compact([selectedParent]))

  const fetchOrgs = () => APIService.user().orgs().get(null, null, {limit: 1000}).then(response => setOwners(uniqBy([...owners, {id: currentUser.username, name: currentUser.username, url: currentUser.url, type: 'user'}, ...map(response.data, org => ({...org, type: 'organization'}))], 'id')))

  const onOwnerChange = newOwner => {
    onParentChange(null)
    setOwner(newOwner)
    fetchParents(newOwner)
  }

  const fetchParents = newOwner => {
    let service;
    if(newOwner.type === 'organization')
      service = APIService.orgs(newOwner.id || newOwner.username)
    else
      service = APIService.users(newOwner.id || newOwner.username)

    service.sources().get(null, null, {brief: true, limit: 1000}).then(response => setParents(response.data))
  }

  const onParentChange = newParent => {
    setParent(newParent)
    onChange(newParent)
  }

  React.useEffect(() => !disabled && fetchOrgs(), [])
  React.useEffect(() => {
    if(selectedOwner && !disabled)
      fetchParents(selectedOwner)
  }, [])

  return (
    <React.Fragment>
      <div style={{marginTop: '15px', width: '100%'}}>
        <Autocomplete
          disableClearable
          openOnFocus
          isOptionEqualToValue={(option, value) => option.id === get(value, 'id') && option.type === get(value, 'type')}
          value={owner}
          id='owner'
          options={owners}
          getOptionLabel={option => option ? `${option.name || option.id} (${startCase(option.type)})` : ''}
          fullWidth
          required
          renderInput={
            params => <TextField
                        {...params}
                        required={requiredOwner}
                        label='Owner'
                        variant="outlined"
                        fullWidth
                      />
          }
          renderOption={
            (props, option) => (
              <li {...props} key={`${option.type}-${option.id}`}>
                <span className='flex-vertical-center'>
                  <span style={{marginRight: '5px'}}>
                    {
                      option.type === 'organization' ?
                        <HomeIcon fontSize='small' style={{marginTop: '5px', color: ORANGE, fontSize: '1rem'}} /> :
                      <PersonIcon fontSize='small' style={{marginTop: '5px', color: ORANGE, fontSize: '1rem'}} />
                    }
                  </span>
                  {option.name || option.id}
                </span>
              </li>
            )
          }
          onChange={(event, item) => onOwnerChange(item)}
          disabled={disabled}
        />
      </div>
      <div style={{marginTop: '15px', width: '100%'}}>
        <Autocomplete
          disableClearable
          openOnFocus
          isOptionEqualToValue={(option, value) => option.id === get(value, 'id')}
          value={parent}
          id='owner'
          options={parents}
          getOptionLabel={option => get(option, 'id', '')}
          fullWidth
          required
          renderInput={
            params => <TextField
                        {...params}
                        required={requiredParent}
                        label='Parent'
                        variant="outlined"
                        fullWidth
                      />
          }
          onChange={(event, item) => onParentChange(item)}
          disabled={disabled}
        />
      </div>

    </React.Fragment>
  )
}

export default OwnerParentSelection;
