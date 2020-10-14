import React from 'react';
import moment from 'moment';
import {Event as EventIcon} from '@material-ui/icons'

const LastUpdatedOnLabel = props => {
  return (
    <div className='col-sm-12 no-side-padding resource-metadata'>
      <span><EventIcon style={{width: '8pt', marginTop: '-4px', marginRight: '4px'}} /></span>
      <span>Last updated on {moment(props.date).format('MM/DD/YYYY')}</span>
    </div>
  )
}

export default LastUpdatedOnLabel;
