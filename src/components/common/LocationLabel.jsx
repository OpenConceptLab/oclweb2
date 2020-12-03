import React from 'react';
import {LocationOn as LocationIcon} from '@material-ui/icons'

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

  return (
    <div className={`${containerClass} resource-metadata`} style={{fontSize: styles.fontSize}}>
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
