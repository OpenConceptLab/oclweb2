import React from 'react';
import { Link } from 'react-router-dom'
import { Home as HomeIcon } from '@material-ui/icons'
import { merge, get } from 'lodash'
import { DARKGRAY } from '../../common/constants';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import LocationLabel from '../common/LocationLabel';

const Organization = props => {
  return (
    <div className='col-sm-12' style={merge({paddingTop: '10px', paddingLeft: 0, paddingRight: 0}, get(props, 'style', {}))}>
      <Link to={props.url} style={{display: 'inline-block'}} target="_blank">
        <div className='col-sm-12 no-side-padding'>
          <span className='resource-label ellipsis-text' style={{maxWidth: '100%'}}>
            <span style={{paddingTop: '5px'}}>
              <HomeIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>
            </span>
            <span className='resource-name ellipsis-text-3' style={{maxWidth: '100%'}}>
              {props.id}
            </span>
          </span>
          <span className='resource-label resource-id org-bg' style={{maxWidth: '100%'}}>
            <span className='ellipsis-text'>{props.name}</span>
          </span>
        </div>
      </Link>
      <div className='col-sm-12 no-side-padding resource-attributes'>
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

export default Organization;
