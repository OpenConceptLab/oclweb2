import React from 'react';
import { Link } from 'react-router-dom'
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, CircularProgress
} from '@material-ui/core';
import { Loyalty as LoyaltyIcon } from '@material-ui/icons'
import { map, get, isEmpty } from 'lodash';
import ResourceLabel from '../common/ResourceLabel';
import { DARKGRAY } from '../../common/constants';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'auto', display: 'inline-block', width: '100%', padding: '0'
}

const None = () => (<div style={{padding: '20px', fontWeight: '300'}}>None</div>);


const ConceptCollections = ({ concept, isLoadingCollections }) => {
  const conceptCollections = get(concept, 'collections') || []
  const count = isLoadingCollections ? '' : `(${conceptCollections.length})`
  return (
    <React.Fragment>
      <Accordion defaultExpanded>
        <AccordionSummary
          className='light-gray-bg less-paded-accordian-header'
          expandIcon={<span />}
          aria-controls="panel1a-content"
        >
          <Typography style={ACCORDIAN_HEADING_STYLES}>{`Collection Membership ${count}`}</Typography>
        </AccordionSummary>
        <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
          {
            isLoadingCollections ?
            <div style={{textAlign: 'center', padding: '10px'}}>
              <CircularProgress />
            </div> : (
              isEmpty(conceptCollections) ?
              None() :
              map(conceptCollections, collection => (
                <Link style={{display: 'inline-block', width: '100%'}} key={collection.version_url} to={collection.version_url}>
                  <div style={{padding: '10px 15px'}}>
                    <ResourceLabel
                      owner={collection.owner}
                      id={collection.short_code}
                      name={collection.version === 'HEAD' ? collection.name : `${collection.name} / ${collection.version}`}
                      icon={<LoyaltyIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
                      colorClass="collection-bg"
                    />
                  </div>
                </Link>
              ))
            )
          }
        </AccordionDetails>
      </Accordion>
    </React.Fragment>
  )
}

export default ConceptCollections;
