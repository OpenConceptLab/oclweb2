import React from 'react';
import { Link } from 'react-router-dom'
import { Person as PersonIcon } from '@material-ui/icons'
import { merge, get } from 'lodash'
import { DARKGRAY } from '../../common/constants';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import LocationLabel from '../common/LocationLabel';

const User = props => {
  return (
    <div className='col-sm-12' style={merge({paddingTop: '10px', paddingLeft: 0, paddingRight: 0}, get(props, 'style', {}))}>
      <Link to={props.url} style={{display: 'inline-block'}} target="_blank">
        <div className='col-sm-12 no-side-padding'>
          <span className='resource-label ellipsis-text' style={{maxWidth: '100%'}}>
            <span style={{paddingTop: '5px'}}>
              <PersonIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>
            </span>
            <span className='resource-name ellipsis-text-3' style={{maxWidth: '100%'}}>
              {props.username}
            </span>
          </span>
          <span className='resource-label resource-id user-bg' style={{maxWidth: '100%'}}>
            <span className='ellipsis-text'>{props.name}</span>
          </span>
        </div>
      </Link>
      <div className='col-sm-12 no-side-padding resource-attributes'>
        {
          props.company &&
          <React.Fragment>
            <span className='resource-attr'>Company:</span>
            <span className='resource-value'>{props.company}</span>
          </React.Fragment>
        }
      </div>
      <div className='col-sm-12 no-side-padding'>
        {
          props.location &&
          <span style={{marginRight: '10px'}}>
            <LocationLabel location={props.location} noContainerClass iconSize="small" />
          </span>
        }
        <LastUpdatedOnLabel
          label='Created'
          date={props.created_on}
          by={props.created_by}
          iconSize='small'
          noContainerClass
        />
      </div>
    </div>
  )
}

export default User;
