import React from 'react';
import {
  ChevronRight as SeparatorIcon,
} from '@mui/icons-material';

const SEPARATOR = (<SeparatorIcon />)
const ResourceLabel = props => {
  const { noSeparator, searchable } = props;

  return (
    <div className='col-xs-12 no-side-padding flex-vertical-center' style={{flexWrap: 'wrap'}}>
      <span className='resource-label ellipsis-text' style={{maxWidth: '100%'}}>
        <span style={{paddingTop: '5px'}}>{props.icon}</span>
        {
          props.owner &&
          <span className='ellipsis-text-3'>{props.owner}</span>
        }
        {
          props.owner && props.parent &&
          <span className='separator'>{SEPARATOR}</span>
        }
        {
          props.parent &&
          <span className='ellipsis-text-3'>{props.parent}</span>
        }
        {
          (!props.owner && !props.parent && props.parentURL) &&
          <span className='ellipsis-text-3'>{props.parentURL}</span>
        }
        {
          !noSeparator &&
          <span className='separator'>{SEPARATOR}</span>
        }
        <span className={'resource-name ellipsis-text-3' + searchable ? ' searchable' : ''} style={{maxWidth: '100%'}}>{props.id || props.name}</span>
      </span>
      <span className={'resource-label resource-id ' + (props.colorClass || '')} style={{maxWidth: '100%'}}>
        <span className={'ellipsis-text' + searchable ? ' searchable' : ''}>{props.name}</span>
      </span>
    </div>
  )
}

export default ResourceLabel;
