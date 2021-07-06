import React from 'react';
import { Divider, Checkbox } from '@material-ui/core';
import ResourceLabel from '../common/ResourceLabel';

const MinimalRowComponent = ({resource, item, onSelect}) => {
  return (
    <div className='col-sm-12 no-side-padding' key={item.uuid || item.id} style={{width: '100%'}}>
      <div className='col-md-12 no-side-padding flex-vertical-center'>
        <div className='col-sm-1 no-left-padding' style={{textAlign: 'right', maxWidth: '2%'}}>
          <Checkbox size='small' onChange={event => onSelect(event, item.url)} />
        </div>
        <div className='col-sm-11 no-right-padding' style={{maxWidth: '97%', overflow: 'auto'}}>
          {
            resource === 'concepts' &&
            <ResourceLabel noSeparator id={item.display_name} name={item.id} />
          }
          {
            resource === 'mappings' &&
            <ResourceLabel noSeparator id={item.id} name={item.map_type} />
          }
        </div>
      </div>
      <Divider style={{width: '100%', display: 'inline-block'}} />
    </div>
  )
}
export default MinimalRowComponent;
