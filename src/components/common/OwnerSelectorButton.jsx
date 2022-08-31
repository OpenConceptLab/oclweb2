import React from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { ArrowDropDown as DownIcon } from '@mui/icons-material';
import { map } from 'lodash';
import APIService from '../../services/APIService';
import { getCurrentUser } from '../../common/utils';
import { ORANGE, WHITE } from '../../common/constants';
import DynamicConfigResourceIcon from './DynamicConfigResourceIcon';

const OwnerSelectorButton = props => {
  const getDefaultOwner = () => {
    let _owner = {type: props.owner.type, url: props.owner.url}
    if(_owner.type === 'User')
      _owner.username = props.owner.username
    else
      _owner.id = props.owner.id
    return _owner
  }
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selected, setSelected] = React.useState(getDefaultOwner)
  const [owners, setOwners] = React.useState([])
  const user = getCurrentUser()
  const getOwners = () => APIService
        .user()
        .orgs()
        .get()
        .then(response => setOwners(
          [...map(response.data, org => ({id: org.id, type: org.type, url: org.url})), {username: user.username, type: 'User', url: user.url}]
        ))

  React.useEffect(() => !props.disabled && getOwners(), [])

  const onToggle = event => setAnchorEl(anchorEl ? null : event.currentTarget)

  const onSelect = owner => {
    setSelected(owner)
    setAnchorEl(null)

    props.onChange(owner)
  }

  return (
    <React.Fragment>
    <Button
      startIcon={<DynamicConfigResourceIcon resource={selected.type.toLowerCase()} />}
      endIcon={<DownIcon />}
      variant='contained'
      style={{backgroundColor: ORANGE, color: WHITE, ...(props.style || {})}}
      onClick={props.disabled ? () => {} : onToggle}
    >
      {selected.username || selected.id}
    </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onToggle}>
        {
          map(owners, (owner, index) => (
            <MenuItem key={index} onClick={() => onSelect(owner)}>
              <ListItemIcon>
                <DynamicConfigResourceIcon resource={owner.type.toLowerCase()} />
              </ListItemIcon>
              <ListItemText>{owner.username || owner.id}</ListItemText>
            </MenuItem>
          ))
        }
        </Menu>
    </React.Fragment>
  )
}

export default OwnerSelectorButton;
