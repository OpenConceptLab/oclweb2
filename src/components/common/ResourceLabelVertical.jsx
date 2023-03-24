import React from 'react';
import { includes } from 'lodash';
import {
  ChevronRight as SeparatorIcon,
} from '@mui/icons-material';

const SEPARATOR = (<SeparatorIcon />)
const ResourceLabelVertical = props => {
  const { resource } = props;
  const isSourceChild = includes(['concept', 'mapping'], resource);
  const parentTextStyles = {
    width: '100%',
    fontSize: '10px',
    background: '#eee',
    padding: '2px 5px',
    textAlign: 'center',
    borderRadius: '2px',
    overflowX: 'auto',
  }
  const nameTextStyles = {
    color: 'white',
    padding: '0 5px',
    borderRadius: '2px',
    minHeight: '18px',
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
            <span>{props.owner}</span>
          }
          {
            props.owner && props.parent &&
            <span className='separator-small'>{SEPARATOR}</span>
          }
          {
            props.parent &&
            <span>{props.parent}</span>
          }
          {
            (!props.owner && !props.parent && props.parentURL) &&
            <span className=''>{props.parentURL}</span>
          }
          <span className='separator-small'>{SEPARATOR}</span>
          <span style={{maxWidth: '100%', fontWeight: 'bold'}}>{props.id || props.name}</span>
        </div>
        <div style={nameTextStyles} className={'col-md-12 ' + resource + '-bg'}>
          <span>{props.name}</span>
        </div>
      </div>
    </div>
  )
}

export default ResourceLabelVertical;
