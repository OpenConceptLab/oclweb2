import React from 'react';
import { Link } from 'react-router-dom';
import {LocalOffer as LocalOfferIcon} from '@mui/icons-material'
import { get } from 'lodash';
import ResourceLabel from '../common/ResourceLabel';
import { DARKGRAY } from '../../common/constants';

const FromConceptLabel = props => {
  const conceptName = props.from_concept_name || props.from_concept_name_resolved || get(props, 'from_concept.display_name')
  const labelComponent = <ResourceLabel
                           resource='concept'
                           existsInOCL={Boolean(props.from_concept_url)}
                           owner={props.from_source_owner}
                           parent={props.from_source_name}
                           id={props.from_concept_code}
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
        !props.noRedirect && props.from_concept_url ?
        <Link to={props.from_concept_url} style={{display: 'inline-block'}}>{labelComponent}</Link>:
        <span>{labelComponent}</span>
      }
    </React.Fragment>
  )
}
export default FromConceptLabel;
