import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider, CircularProgress
} from '@material-ui/core';
import { map, isEmpty, omitBy, get } from 'lodash';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { getMappingsDistributionByMapType } from '../../common/utils';
import Mapping from '../mappings/Mapping';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '400px', overflow: 'scroll', display: 'inline-block', width: '100%'
}

const None = () => {
  return <div style={{margin: '5px', fontWeight: '300'}}>None</div>
}

const ConceptHomeMappings = ({ concept, isLoadingMappings }) => {
  const mappingsDistribution = omitBy(getMappingsDistributionByMapType(concept.mappings, concept.id), isEmpty);
  const count = isLoadingMappings ? '' : `(${get(concept.mappings, 'length', 0)})`
  return (
    <div className='col-md-12'>
      <div className='col-md-8 no-left-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordian-header'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>{`Mappings ${count}`}</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isLoadingMappings ?
              <div className='col-md-12' style={{textAlign: 'center', padding: '10px'}}>
                <CircularProgress />
              </div> :
              (
                isEmpty(mappingsDistribution) ?
                None() :
                map(mappingsDistribution, (mappings, category) => (
                  <div className='col-md-12 no-side-padding' key={category}>
                    <div className='col-md-12'>
                      <div className='col-md-2 no-left-padding text-muted small' style={{paddingTop: '15px'}}>
                        {category}
                      </div>
                      <div className='col-md-10 no-right-padding'>
                        {
                          map(mappings, (mapping, index) => (
                            <div className='col-md-12 no-side-padding' key={index}>
                              <Mapping key={mapping.uuid} {...mapping} conceptContext={concept.id} />
                              {
                                (index + 1) < mappings.length &&
                                <Divider style={{width: '100%'}} />
                              }
                            </div>
                          ))
                        }
                      </div>
                    </div>
                    <Divider style={{width: '100%'}} />
                  </div>
                ))
              )
            }
          </AccordionDetails>
        </Accordion>
      </div>
      <div className='col-md-4 no-right-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordian-header'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Tip</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            <p className="small">The <strong>Concept Mappings</strong> tab displays all direct and inverse mappings stored in this source.</p>
					  <ul><li className="small"><em>Direct Mappings</em> originate from this concept and may point to concepts that are <em>internal</em> to OCL (e.g. CIEL) or <em>external</em> (e.g. SNOMED-CT).</li>
						  <li className="small"><em>Inverse Mappings</em> originate from another concept in OCL and point to this concept.</li>
					  </ul>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
}

export default ConceptHomeMappings;
