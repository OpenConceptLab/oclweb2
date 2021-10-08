import React from 'react';
import {LocationOn as LocationIcon} from '@mui/icons-material'
import { merge } from 'lodash';

const STYLES = {
  medium: {
    icon: {width: '9pt', marginTop: '-4px', marginRight: '4px'},
    fontSize: '9pt',
  },
  small: {
    icon: {width: '8pt', marginTop: '-4px', marginRight: '4px'},
    fontSize: '8pt',
  }
}

const LocationLabel = props => {
  const containerClass = props.noContainerClass ? '' : 'col-sm-12 no-side-padding';
  const styles = STYLES[props.iconSize || 'small']
  const containerStyles = props.containerStyle || {}

  return (
    <div className={`${containerClass} resource-metadata`} style={merge({fontSize: styles.fontSize}, containerStyles)}>
      <span>
        <LocationIcon style={styles.icon} />
      </span>
      <span>
        {props.location}
      </span>
    </div>
  )
}

export default LocationLabel;
