import React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material'
import {LocalOffer as LocalOfferIcon} from '@mui/icons-material'
import { get } from 'lodash';
import ResourceLabel from '../common/ResourceLabel';
import { getSiteTitle } from '../../common/utils';

const SITE_TITLE = getSiteTitle()

const ToConceptLabel = props => {
  const conceptName = props.to_concept_name || props.to_concept_name_resolved || get(props, 'to_concept.display_name')
  const hasLink = props.to_concept_url && !props.noRedirect;
  const existsInOCL = Boolean(props.to_concept_url)
  const labelComponent = <ResourceLabel
                           resource='concept'
                           owner={props.to_source_owner}
                           parent={props.to_source_name}
                           id={props.to_concept_code}
                           parentURL={props.to_source_url}
                           name={conceptName}
                           icon={
                             <Tooltip title={existsInOCL ? `Defined in ${SITE_TITLE}` : `Not defined in ${SITE_TITLE}`}>
                             <LocalOfferIcon
                               color={existsInOCL ? 'primary': 'warning'}
                               fontSize='small'
                                         style={{width: '12pt'}}
                             />
                             </Tooltip>
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
