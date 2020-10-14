import React from 'react';
import {LocalOffer as LocalOfferIcon} from '@material-ui/icons'
import ResourceLabel from '../common/ResourceLabel';
import { DARKGRAY } from '../../common/constants';

const ToConceptLabel = props => {
  return (
    <ResourceLabel
      owner={props.to_source_owner} parent={props.to_source_name}
      id={props.to_concept_code} name={props.to_concept_name}
      icon={<LocalOfferIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
    />
  )
}
export default ToConceptLabel;
