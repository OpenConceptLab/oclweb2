import React from 'react';
import {
  AccountBalance as HomeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Button } from '@mui/material'
import DynamicConfigResourceIcon from './DynamicConfigResourceIcon';

const OwnerLabel = props => {
  let icon = <HomeIcon fontSize='small' />;
  if(props.resource === 'user')
    icon = <PersonIcon fontSize='small' /> ;

  return (
    <div className='col-sm-12 no-side-padding' style={{margin: '5px 0'}}>
      <span className='resource-label'>
        <span style={{paddingTop: '5px'}}>{icon}</span>
        <span className='resource-name'>{props.id}</span>
      </span>
      {
        name &&
        <span className='resource-label resource-id green'>
          <span>{props.name}</span>
        </span>
      }
    </div>
  )
}

export default OwnerLabel;


export const OwnerIdLabel = ({resource, id, bgColor}) => {
  let _bgColor = bgColor || 'orange'

  return (
      <span className={`resource-label ${_bgColor}`} style={{color: '#fff', borderRadius: '0.25em'}}>
        <span style={{paddingTop: '5px'}}>
          <DynamicConfigResourceIcon resource={resource} fontSize='small' />
        </span>
        <span>{id}</span>
      </span>
  )
}

export const ResourceTextButton = ({resource, id, color, href}) => {
  let _color = color || 'orange'

  return (
    <Button variant='text' style={{color: _color, textTransform: 'none', textAlign: 'left', lineHeight: '16px'}} size='medium' href={href}>
      <DynamicConfigResourceIcon resource={resource} style={{width: '18px', marginRight: '5px'}} />
      {id}
    </Button>
  )
}
