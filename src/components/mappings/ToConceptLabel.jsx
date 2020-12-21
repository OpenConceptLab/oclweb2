import React from 'react';
import { Link } from 'react-router-dom';
import {LocalOffer as LocalOfferIcon} from '@material-ui/icons'
import ResourceLabel from '../common/ResourceLabel';
import { DARKGRAY } from '../../common/constants';

const ToConceptLabel = props => {
  const labelComponent = <ResourceLabel
                           owner={props.to_source_owner}
                           parent={props.to_source_name}
                           id={props.to_concept_code}
                           name={props.to_concept_name}
                           icon={
                             <LocalOfferIcon
                               fontSize='small'
                                         style={{width: '10pt', color: DARKGRAY}}
                             />
                           } />;
  return (
    <React.Fragment>
      {
        !props.noRedirect && props.to_concept_url ?
        <Link to={props.to_concept_url}  style={{display: 'inline-block'}}>{labelComponent}</Link>:
        <span>{labelComponent}</span>
      }
    </React.Fragment>
  )
}
export default ToConceptLabel;
