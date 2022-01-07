import React from 'react';
import { Link } from 'react-router-dom'
import {
  LocalOffer as LocalOfferIcon,
  Link as LinkIcon,
  AccountTreeRounded as TreeIcon,
} from '@mui/icons-material'
import { Tooltip } from '@mui/material';
import { isNumber } from 'lodash';

const TAG_ICON_STYLES = {width: '12px', marginRight: '4px', marginTop: '2px'}

const ConceptContainerSummaryHorizontal = props => {
  return (
    <div className="col-sm-3" style={{textAlign: 'right'}}>
      <Link to={props.concepts_url}>
        <Tooltip arrow title='Concepts'>
          <span className='flex-vertical-center' style={{paddingRight: '20px', fontSize: '14px',}}>
            <LocalOfferIcon fontSize='small' style={TAG_ICON_STYLES} />
            {isNumber(props.summary.active_concepts) ? props.summary.active_concepts : '-'}
          </span>
        </Tooltip>
      </Link>
      <Link to={props.mappings_url}>
        <Tooltip arrow title='Mappings'>
          <span className='flex-vertical-center' style={{paddingRight: '20px', fontSize: '14px'}}>
            <LinkIcon fontSize='small' style={TAG_ICON_STYLES} />
            {isNumber(props.summary.active_mappings) ? props.summary.active_mappings : '-'}
          </span>
        </Tooltip>
      </Link>
      <Link to={props.versions_url}>
        <Tooltip arrow title='Versions'>
          <span className='flex-vertical-center' style={{fontSize: '14px'}}>
            <TreeIcon fontSize='small' style={TAG_ICON_STYLES} />
            {props.summary.versions}
          </span>
        </Tooltip>
      </Link>
    </div>
  )
}

export default ConceptContainerSummaryHorizontal;
