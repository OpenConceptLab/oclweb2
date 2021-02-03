import React from 'react';
import { Link } from 'react-router-dom'
import { LocalOffer as LocalOfferIcon } from '@material-ui/icons'
import { merge, get } from 'lodash'
import { DARKGRAY } from '../../common/constants';
import ResourceLabel from '../common/ResourceLabel';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';

const Concept = props => {
  return (
    <div className='col-sm-12' style={merge({paddingTop: '10px', paddingLeft: 0, paddingRight: 0}, get(props, 'style', {}))}>
      <Link to={props.url} style={{display: 'inline-block'}} target="_blank">
        <ResourceLabel
          owner={props.owner} parent={props.source} id={props.display_name} name={props.id}
          icon={<LocalOfferIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
        />
      </Link>
      <div className='col-sm-12 no-side-padding resource-attributes'>
        <span className='resource-attr'>Class:</span>
        <span className='resource-value'>{props.concept_class},</span>
        <span className='resource-attr'>Datatype:</span>
        <span className='resource-value'>{props.datatype}</span>
      </div>
      <LastUpdatedOnLabel date={props.version_created_on} />
    </div>
  )
}

export default Concept;
