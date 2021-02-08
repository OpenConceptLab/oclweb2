import React from 'react';

const SEPARATOR = '/'
const ResourceLabel = props => {
  return (
    <div className='col-sm-12 no-side-padding'>
      <span className='resource-label ellipsis-text' style={{maxWidth: '100%'}}>
        <span style={{paddingTop: '5px'}}>{props.icon}</span>
        {
          props.owner &&
          <span className='ellipsis-text-3'>{props.owner}</span>
        }
        {
          props.parent &&
          <React.Fragment>
            <span>{SEPARATOR}</span>
            <span className='ellipsis-text-3'>{props.parent}</span>
          </React.Fragment>
        }
        {
          (!props.owner && !props.parent && props.parentURL) &&
          <span className='ellipsis-text-3'>{props.parentURL}</span>
        }
        <span>{SEPARATOR}</span>
        <span className='resource-name ellipsis-text-3' style={{maxWidth: '100%'}}>{props.id || props.name}</span>
      </span>
      <span className={'resource-label resource-id ' + (props.colorClass || '')} style={{maxWidth: '100%'}}>
        <span className='ellipsis-text'>{props.name || 'None'}</span>
      </span>
    </div>
  )
}

export default ResourceLabel;
