import React from 'react';
import { Link } from 'react-router-dom';
import {LocalOffer as LocalOfferIcon} from '@mui/icons-material'
import { get } from 'lodash';
import ResourceLabel from '../common/ResourceLabel';
import { DARKGRAY } from '../../common/constants';

const ToConceptLabel = props => {
  const conceptName = props.to_concept_name || props.to_concept_name_resolved || get(props, 'to_concept.display_name')
  const hasLink = props.to_concept_url && !props.noRedirect;
  const labelComponent = <ResourceLabel
                           resource='concept'
                           existsInOCL={Boolean(props.to_concept_url)}
                           owner={props.to_source_owner}
                           parent={props.to_source_name}
                           id={props.to_concept_code}
                           parentURL={props.from_source_url}
                           name={conceptName}
                           icon={
                             <LocalOfferIcon
                               fontSize='small'
                                         style={{width: '10pt', color: DARKGRAY}}
                             />
                           } />;
  return (
    <React.Fragment>
      {
        hasLink ?
        <Link to={props.to_concept_url}  style={{display: 'inline-block'}}>{labelComponent}</Link>:
        <span>{labelComponent}</span>
      }
    </React.Fragment>
  )
}
export default ToConceptLabel;
