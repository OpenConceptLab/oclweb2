import React from 'react';
import {
  Home as HomeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

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
      <span className='resource-label resource-id green'>
        <span>{props.name}</span>
      </span>
    </div>
  )
}

export default OwnerLabel;
