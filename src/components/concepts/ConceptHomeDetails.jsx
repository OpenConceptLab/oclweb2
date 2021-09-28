import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography
} from '@material-ui/core';
import { map, get, isEmpty } from 'lodash';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ConceptDetailsLocale from './ConceptDetailsLocale';
import HomeMappings from './HomeMappings';
import ConceptCollections from './ConceptCollections';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'auto', display: 'inline-block', width: '100%', padding: '0'
}

const None = () => {
  return <div style={{padding: '20px', fontWeight: '300'}}>None</div>
}

const ConceptHomeDetails = ({ concept, currentURL, isLoadingMappings, isLoadingCollections }) => {
  const names = get(concept, 'names', [])
  const descriptions = get(concept, 'descriptions', [])
  const namesCount = names.length;
  const descCount = descriptions.length;
  return (
    <React.Fragment>
      <div className='col-md-6 no-left-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordian-header'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>{`Names & Synonyms (${namesCount})`}</Typography>
          </AccordionSummary>
          <AccordionDetails style={{...ACCORDIAN_DETAILS_STYLES, padding: '10px 0'}}>
            {
              isEmpty(names) ?
              None() :
              map(names, name => (
                <ConceptDetailsLocale locale={name} key={name.uuid} url={`${encodeURI(currentURL)}names/${name.uuid}/`} />
              ))
            }
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordian-header'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>{`Descriptions (${descCount})`}</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isEmpty(descriptions) ?
              None() :
              map(descriptions, description => (
                <ConceptDetailsLocale locale={description} isDescription key={description.uuid} url={`${encodeURI(currentURL)}descriptions/${description.uuid}/`} />
              ))
            }
          </AccordionDetails>
        </Accordion>
      </div>
      <div className='col-md-6 no-right-padding'>
        <HomeMappings concept={concept} isLoadingMappings={isLoadingMappings} />
        <ConceptCollections concept={concept} isLoadingCollections={isLoadingCollections} />
      </div>
    </React.Fragment>
  );
}

export default ConceptHomeDetails;
