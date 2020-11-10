import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography
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
  maxHeight: '300px', overflow: 'scroll', display: 'inline-block'
}

const None = () => {
  return <div style={{margin: '5px', fontWeight: '300'}}>None</div>
}

const ConceptHomeDetails = ({ concept }) => {
  const directMappings = getDirectMappings(concept.mappings, concept.id);
  const indirectMappings = getIndirectMappings(concept.mappings, concept.id);
  const names = get(concept, 'names', [])
  const descriptions = get(concept, 'descriptions', [])
  const extras = get(concept, 'extras', {});
  return (
    <div className='col-md-12'>
      <div className='col-md-6'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Names & Synonyms</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isEmpty(names) ?
              None() :
              map(names, name => (
                <ConceptDetailsLocale locale={name} key={name.uuid} />
              ))
            }
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Descriptions</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isEmpty(descriptions) ?
              None() :
              map(descriptions, description => (
                <ConceptDetailsLocale locale={description} isDescription={true} key={description.uuid} />
              ))
            }
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Custom Attributes</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isEmpty(extras) ?
              None() :
              map(extras, (value, name) => (
                <div className='col-md-12' style={{marginBottom: '5px'}} key={name}>
                  <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                    {name}
                  </div>
                  <div className='col-md-4 no-right-padding'>
                    {value}
                  </div>
                </div>
              ))
            }
          </AccordionDetails>
        </Accordion>
      </div>
      <div className='col-md-6'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Mappings</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isEmpty(indirectMappings) ?
              None() :
              <NestedMappingsTable mappings={directMappings} />
            }
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Inverse Mappings</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isEmpty(indirectMappings) ?
              None() :
              <NestedMappingsTable mappings={indirectMappings} />
            }
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
}

export default ConceptHomeDetails;
