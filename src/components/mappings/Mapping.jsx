import React from 'react';
import {
  Link as LinkIcon,
  LocalOffer as LocalOfferIcon
} from '@material-ui/icons'
import { DARKGRAY } from '../../common/constants';
import ResourceLabel from '../common/ResourceLabel';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';

const LABEL_STYLES = {
  textAlign: 'center', marginTop: '4px', fontSize: '12px', color: DARKGRAY
};

const Mapping = props => {
  return (
    <div className='col-sm-12 no-side-padding' style={{paddingTop: '10px'}}>
      <ResourceLabel
        owner={props.owner} parent={props.source} id={props.id} name={props.map_type}
        icon={<LinkIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
      />
      <div className='col-sm-12 no-left-padding' style={{margin: '5px'}}>
        <div className='col-sm-1 no-side-padding' style={LABEL_STYLES}>
          From:
        </div>
        <div className='col-sm-11 no-side-padding'>
          <ResourceLabel
            owner={props.from_source_owner} parent={props.from_source_name}
            id={props.from_concept_code} name={props.from_concept_name}
            icon={<LocalOfferIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
          />
        </div>
      </div>
      <div className='col-sm-12 no-left-padding' style={{margin: '0px 5px 5px 5px'}}>
        <div className='col-sm-1 no-side-padding' style={LABEL_STYLES}>
          To:
        </div>
        <div className='col-sm-11 no-side-padding'>
          <ResourceLabel
            owner={props.to_source_owner} parent={props.to_source_name}
            id={props.to_concept_code} name={props.to_concept_name}
            icon={<LocalOfferIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
          />
        </div>
      </div>
      <LastUpdatedOnLabel date={props.version_created_on} />
    </div>
  )
}

export default Mapping;
