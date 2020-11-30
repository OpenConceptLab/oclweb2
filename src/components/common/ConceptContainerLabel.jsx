import React from 'react';
import {
  List as ListIcon,
  Loyalty as LoyaltyIcon
} from '@material-ui/icons';

const ConceptContainerLabel = props => {
  let icon = <LoyaltyIcon fontSize='small' />;
  if(props.resource === 'source')
    icon = <ListIcon fontSize='small' /> ;

  return (
    <div className='col-sm-12 no-side-padding' style={{margin: '5px 0'}}>
      <span className='resource-label'>
        <span style={{paddingTop: '5px'}}>{icon}</span>
        <span className='resource-name'>{props.id}</span>
      </span>
      <span className='resource-label resource-id orange'>
        <span>{props.name || 'None'}</span>
      </span>
    </div>
  )
}

export default ConceptContainerLabel;
