import React from 'react';

const SEPARATOR = '/'
const ResourceLabel = props => {
  return (
    <div className='col-sm-12 no-side-padding'>
      <span className='resource-label'>
        <span style={{paddingTop: '5px'}}>{props.icon}</span>
        {
          (props.owner && props.parent) ?
          <React.Fragment>
            <span>{props.owner}</span>
            <span>{SEPARATOR}</span>
            <span>{props.parent}</span>
          </React.Fragment> :
          (
            props.parentURL &&
            <span>{props.parentURL}</span>
          )
        }
        <span>{SEPARATOR}</span>
        <span className='resource-name'>{props.id || props.name}</span>
      </span>
      <span className='resource-label resource-id'>
        <span>{props.name || 'None'}</span>
      </span>
    </div>
  )
}

export default ResourceLabel;
