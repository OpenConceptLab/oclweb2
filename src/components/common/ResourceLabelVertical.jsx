import React from 'react';
import { includes } from 'lodash';
import ExistsInOCLIcon from '../common/ExistsInOCLIcon';
import DoesnotExistsInOCLIcon from '../common/DoesnotExistsInOCLIcon';

const SEPARATOR = '/'
const ResourceLabelVertical = props => {
  const { resource, existsInOCL } = props;
  const isSourceChild = includes(['concept', 'mapping'], resource);
  const parentTextStyles = {
    width: '100%',
    fontSize: '10px',
    background: '#eee',
    padding: '0 5px',
    textAlign: 'center',
    borderRadius: '2px',
    overflowX: 'scroll',
  }
  const separatorStyles = {
    padding: '0 4px',
    fontSize: '18px',
    fontWeight: 'lighter',
  }

  const nameTextStyles = {
    color: 'white',
    padding: '0 5px',
    borderRadius: '2px',
  }

  return (
    <div className='no-side-padding col-md-12 flex-vertical-center'>
      <div className='no-side-padding flex-vertical-center' style={{width: '5%'}}>
        {props.icon}
      </div>
      <div style={isSourceChild ? {width: '90%', padding: '0 5px'} : {width: '95%', padding: '0 5px'}}>
        <div className='col-md-12 flex-vertical-center' style={parentTextStyles}>
          {
            props.owner &&
            <span className=''>{props.owner}</span>
          }
          {
            props.owner && props.parent &&
            <span style={separatorStyles}>{SEPARATOR}</span>
          }
          {
            props.parent &&
            <span className=''>{props.parent}</span>
          }
          {
            (!props.owner && !props.parent && props.parentURL) &&
            <span className=''>{props.parentURL}</span>
          }
          <span style={separatorStyles}>{SEPARATOR}</span>
          <span style={{maxWidth: '100%', fontWeight: 'bold'}}>{props.id || props.name}</span>
        </div>
        <div style={nameTextStyles} className={'col-md-12 ' + resource + '-bg'}>
          <span className=''>{props.name || 'None'}</span>
        </div>
      </div>
      <div className='no-left-padding flex-vertical-center' style={{width: '5%', justifyContent: 'flex-end'}}>
        {
          isSourceChild && (
            existsInOCL ?
            <ExistsInOCLIcon containerStyles={{marginLeft: '5px'}} /> :
            <DoesnotExistsInOCLIcon containerStyles={{marginLeft: '5px'}} />
          )
        }
      </div>
    </div>
  )
}

export default ResourceLabelVertical;
