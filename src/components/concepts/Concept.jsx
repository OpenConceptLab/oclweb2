import React from 'react';
import { LocalOffer as LocalOfferIcon } from '@material-ui/icons'
import { DARKGRAY } from '../../common/constants';
import ResourceLabel from '../common/ResourceLabel';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';

const Concept = props => {

  return (
    <div className='col-sm-12 no-side-padding' style={{paddingTop: '10px'}}>
      <ResourceLabel
        owner={props.owner} parent={props.source} id={props.display_name} name={props.id}
        icon={<LocalOfferIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
      />
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
