import React from 'react';
import moment from 'moment';
import {Event as EventIcon} from '@material-ui/icons'

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

const LastUpdatedOnLabel = props => {
  const byLabel = props.by ? `by ${props.by}` : '';
  const mainLabel = props.label || 'Last updated';
  const containerClass = props.noContainerClass ? '' : 'col-sm-12 no-side-padding';
  const styles = STYLES[props.iconSize || 'small']

  return (
    <div className={`${containerClass} resource-metadata`} style={{fontSize: styles.fontSize}}>
      <span>
        <EventIcon style={styles.icon} />
      </span>
      <span>
        {mainLabel} on {moment(props.date).format('MM/DD/YYYY')} {byLabel}
      </span>
    </div>
  )
}

export default LastUpdatedOnLabel;
