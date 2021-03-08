import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, CircularProgress
} from '@material-ui/core';
import { map, get, isEmpty } from 'lodash';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ConceptDetailsLocale from './ConceptDetailsLocale';
import NestedMappingsTable from '../mappings/NestedMappingsTable';
import { getIndirectMappings, getDirectMappings } from '../../common/utils';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'scroll', display: 'inline-block', width: '100%', padding: '0px'
}

const None = () => {
  return <div style={{padding: '20px', fontWeight: '300'}}>None</div>
}

const ConceptHomeDetails = ({ concept, currentURL, isLoadingMappings }) => {
  const directMappings = getDirectMappings(concept.mappings, concept.id);
  const indirectMappings = getIndirectMappings(concept.mappings, concept.id);
  const names = get(concept, 'names', [])
  const descriptions = get(concept, 'descriptions', [])
  const directMappingsCountLabel = isLoadingMappings ? '' : `(${get(directMappings, 'length', 0)})`;
  const indirectMappingsCountLabel = isLoadingMappings ? '' : `(${get(indirectMappings, 'length', 0)})`;
  return (
    <React.Fragment>
      <div className='col-md-6 no-left-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordian-header'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Names & Synonyms</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isEmpty(names) ?
              None() :
              map(names, name => (
                <ConceptDetailsLocale locale={name} key={name.uuid} url={`${currentURL}names/${name.uuid}/`} />
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
            <Typography style={ACCORDIAN_HEADING_STYLES}>Descriptions</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isEmpty(descriptions) ?
              None() :
              map(descriptions, description => (
                <ConceptDetailsLocale locale={description} isDescription key={description.uuid} url={`${currentURL}descriptions/${description.uuid}/`} />
              ))
            }
          </AccordionDetails>
        </Accordion>
      </div>
      <div className='col-md-6 no-right-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordian-header'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>{`Mappings ${directMappingsCountLabel}`}</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isLoadingMappings ?
              <div className='col-md-12' style={{textAlign: 'center', padding: '10px'}}>
                <CircularProgress />
              </div> :
              (
                isEmpty(directMappings) ?
                None() :
                <NestedMappingsTable mappings={directMappings} />
              )
            }
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordian-header'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>{`Inverse Mappings ${indirectMappingsCountLabel}`}</Typography>
          </AccordionSummary>
          <AccordionDetails style={{...ACCORDIAN_DETAILS_STYLES, padding: 0}}>
            {
              isLoadingMappings ?
              <div className='col-md-12' style={{textAlign: 'center', padding: '10px'}}>
                <CircularProgress />
              </div> :
              (
                isEmpty(indirectMappings) ?
                None() :
                <NestedMappingsTable mappings={indirectMappings} isIndirect />
              )
            }
          </AccordionDetails>
        </Accordion>
      </div>
    </React.Fragment>
  );
}

export default ConceptHomeDetails;
