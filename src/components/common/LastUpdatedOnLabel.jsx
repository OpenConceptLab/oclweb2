import React from 'react';
import moment from 'moment';
import {Event as EventIcon} from '@mui/icons-material'
import { merge } from 'lodash';
import { DATE_FORMAT } from '../../common/constants'

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
  const containerClass = props.noContainerClass ? '' : 'col-xs-12 no-side-padding';
  const styles = STYLES[props.iconSize || 'small']

  return (
    <div className={`${containerClass} resource-metadata`} style={merge({fontSize: styles.fontSize}, (props.containerStyle || {}))}>
      <span>
        <EventIcon style={styles.icon} />
      </span>
      <span>
        {mainLabel} on {moment(props.date).format(DATE_FORMAT)} {byLabel}
      </span>
    </div>
  )
}

export default LastUpdatedOnLabel;
