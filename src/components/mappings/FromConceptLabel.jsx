import React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material'
import {LocalOffer as LocalOfferIcon} from '@mui/icons-material'
import { get } from 'lodash';
import ResourceLabel from '../common/ResourceLabel';
import { getSiteTitle } from '../../common/utils';

const SITE_TITLE = getSiteTitle()

const FromConceptLabel = props => {
  const conceptName = props.from_concept_name || props.from_concept_name_resolved || get(props, 'from_concept.display_name')
  const existsInOCL = Boolean(props.from_concept_url)
  const labelComponent = <ResourceLabel
                           searchable
                           resource='concept'
                           owner={props.from_source_owner}
                           parent={props.from_source_name}
                           id={props.from_concept_code}
                           parentURL={props.from_source_url}
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
        !props.noRedirect && props.from_concept_url ?
        <Link to={props.from_concept_url} style={{display: 'inline-block'}}>{labelComponent}</Link>:
        <span>{labelComponent}</span>
      }
    </React.Fragment>
  )
}
export default FromConceptLabel;
