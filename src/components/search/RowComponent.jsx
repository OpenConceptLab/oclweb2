import React from 'react';
import { Divider, Checkbox } from '@material-ui/core';
import Concept from '../concepts/Concept';
import Mapping from '../mappings/Mapping';
import Source from '../sources/Source';
import Collection from '../collections/Collection';
import Organization from '../orgs/Organization';
import User from '../users/User';

const RowComponent = ({resource, item, onSelect}) => {
  const getComponent = () => {
    if(resource === 'concepts')
      return <Concept {...item} style={{paddingLeft: '10px'}} />;
    if(resource === 'mappings')
      return <Mapping {...item} style={{paddingLeft: '10px'}} />;
    if(resource === 'sources')
      return <Source {...item} style={{paddingLeft: '10px'}} />;
    if(resource === 'collections')
      return <Collection {...item} style={{paddingLeft: '10px'}} />;
    if(resource === 'organizations')
      return <Organization {...item} style={{paddingLeft: '10px'}} />;
    if(resource === 'users')
      return <User {...item} style={{paddingLeft: '10px'}} />;
  }

  return (
    <div className='col-sm-12 no-side-padding' key={item.uuid || item.id} style={{width: '100%'}}>
      <div className='col-sm-1 no-left-padding' style={{textAlign: 'right', width: '2%'}}>
        <Checkbox onChange={event => onSelect(event, item.url)} />
      </div>
      <div className='col-sm-11 no-right-padding'>
        {getComponent()}
      </div>
      <Divider style={{width: '100%'}} />
    </div>
  )
}
export default RowComponent;
