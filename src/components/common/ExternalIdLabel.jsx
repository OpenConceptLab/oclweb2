import React from 'react';
import { ArrowForward as ForwardIcon } from '@material-ui/icons';

const STYLES = {
  medium: {
    icon: {width: '9pt', marginTop: '2px', marginRight: '4px', height: '9pt'},
    fontSize: '9pt',
  },
  small: {
    icon: {width: '8pt', marginTop: '2px', marginRight: '4px', height: '8pt'},
    fontSize: '8pt',
  }
}

const ExternalIdLabel = props => {
  const styles = STYLES[props.iconSize || 'small']
  return (
    <div className='resource-metadata' style={{fontSize: styles.fontSize}}>
      <span>
        <ForwardIcon style={{
          ...styles.icon,
          background: 'gray',
          color: 'white',
          border: '1px solid',
          borderRadius: '10px',
        }}
        />
      </span>
      <span>External ID: {props.externalId}</span>
    </div>
  )
}

export default ExternalIdLabel;
