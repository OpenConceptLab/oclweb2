import React from 'react';

const SEPARATOR = '/'
const ResourceLabel = props => {
  return (
    <div className='col-sm-12 no-side-padding'>
      <span className='resource-label'>
        <span style={{paddingTop: '5px'}}>{props.icon}</span>
        <span>{props.owner}</span>
        <span>{SEPARATOR}</span>
        <span>{props.parent}</span>
        <span>{SEPARATOR}</span>
        <span className='resource-name'>{props.id || props.name}</span>
      </span>
      <span className='resource-label resource-id'>
        <span>{props.name}</span>
      </span>
    </div>
  )
}

export default ResourceLabel;
