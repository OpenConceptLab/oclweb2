import React from 'react';
import { Divider, Checkbox } from '@mui/material';
import { includes } from 'lodash';
import Concept from '../concepts/Concept';
import Mapping from '../mappings/Mapping';
import Source from '../sources/Source';
import Collection from '../collections/Collection';
import Organization from '../orgs/Organization';
import User from '../users/User';

const RowComponent = ({resource, item, onSelect, viewFields, history, currentLayoutURL}) => {
  const isSourceChild = includes(['concepts', 'mappings'], resource);

  const getComponent = () => {
    if(resource === 'concepts')
      return <Concept {...item} viewFields={viewFields} history={history} currentLayoutURL={currentLayoutURL} style={{paddingLeft: '10px'}} />;
    if(resource === 'mappings')
      return <Mapping {...item} viewFields={viewFields} history={history} currentLayoutURL={currentLayoutURL} style={{paddingLeft: '10px'}} />;
    if(resource === 'sources')
      return <Source {...item} viewFields={viewFields} history={history} currentLayoutURL={currentLayoutURL} style={{paddingLeft: '10px'}} />;
    if(resource === 'collections')
      return <Collection {...item} viewFields={viewFields} history={history} currentLayoutURL={currentLayoutURL} style={{paddingLeft: '10px'}} />;
    if(resource === 'organizations')
      return <Organization {...item} viewFields={viewFields} history={history} currentLayoutURL={currentLayoutURL} style={{paddingLeft: '10px'}} />;
    if(resource === 'users')
      return <User {...item} viewFields={viewFields} history={history} currentLayoutURL={currentLayoutURL} style={{paddingLeft: '10px'}} />;
  }

  return (
    <div className='col-xs-12 no-side-padding' key={item.uuid || item.id} style={{width: '100%'}}>
      {
        isSourceChild &&
        <div className='col-xs-1 no-left-padding' style={{textAlign: 'right', maxWidth: '2%'}}>
          <Checkbox size='small' onChange={event => onSelect(event, item.url)} />
        </div>
      }
      <div className='col-xs-11 no-right-padding' style={{maxWidth: '97%', overflow: 'auto'}}>
        {getComponent()}
      </div>
      <Divider style={{width: '100%', display: 'inline-block'}} />
    </div>
  )
}
export default RowComponent;
