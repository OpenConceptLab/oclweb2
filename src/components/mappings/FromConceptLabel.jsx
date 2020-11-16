import React from 'react';
import { Link } from 'react-router-dom';
import {LocalOffer as LocalOfferIcon} from '@material-ui/icons'
import ResourceLabel from '../common/ResourceLabel';
import { DARKGRAY } from '../../common/constants';

const FromConceptLabel = props => {
  const labelComponent = <ResourceLabel
                           owner={props.from_source_owner}
                           parent={props.from_source_name}
                           id={props.from_concept_code}
                           name={props.from_concept_name}
                           icon={
                             <LocalOfferIcon
                               fontSize='small'
                                         style={{width: '10pt', color: DARKGRAY}}
                             />
                           } />;
  return (
    <React.Fragment>
      {
        props.from_concept_url ?
        <Link to={props.from_concept_url} style={{display: 'inline-block'}}>{labelComponent}</Link>:
        <span>{labelComponent}</span>
      }
    </React.Fragment>
  )
}
export default FromConceptLabel;
