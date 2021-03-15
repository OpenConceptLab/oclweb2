import React from 'react';
import { includes } from 'lodash';
import ExistsInOCLIcon from '../common/ExistsInOCLIcon';
import DoesnotExistsInOCLIcon from '../common/DoesnotExistsInOCLIcon';

const SEPARATOR = '/'
const ResourceLabel = props => {
  const { resource, existsInOCL } = props;
  const isSourceChild = includes(['concept', 'mapping'], resource);


  return (
    <div className='col-sm-12 no-side-padding flex-vertical-center'>
      <span className='resource-label ellipsis-text' style={{maxWidth: '100%'}}>
        <span style={{paddingTop: '5px'}}>{props.icon}</span>
        {
          props.owner &&
          <span className='ellipsis-text-3'>{props.owner}</span>
        }
        {
          props.owner && props.parent &&
          <span>{SEPARATOR}</span>
        }
        {
          props.parent &&
          <span className='ellipsis-text-3'>{props.parent}</span>
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
      {
        isSourceChild && (
          existsInOCL ?
          <ExistsInOCLIcon containerStyles={{marginLeft: '5px'}} /> :
          <DoesnotExistsInOCLIcon containerStyles={{marginLeft: '5px'}} />
        )
      }
    </div>
  )
}

export default ResourceLabel;
