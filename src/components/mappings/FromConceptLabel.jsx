import React from 'react';
import {LocalOffer as LocalOfferIcon} from '@material-ui/icons'
import ResourceLabel from '../common/ResourceLabel';
import { DARKGRAY } from '../../common/constants';

const FromConceptLabel = props => {
  return (
    <ResourceLabel
      owner={props.from_source_owner} parent={props.from_source_name}
      id={props.from_concept_code} name={props.from_concept_name}
      icon={<LocalOfferIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
    />
  )
}
export default FromConceptLabel;
