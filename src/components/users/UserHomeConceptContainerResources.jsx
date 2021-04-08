import React from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, CircularProgress,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { map, isEmpty } from 'lodash';
import ConceptContainerLabel from '../common/ConceptContainerLabel';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '525px', overflow: 'auto', display: 'inline-block', width: '100%', textAlign: 'left',
}

const UserHomeConceptContainerResources = ({
  sources, collections, isLoadingSources, isLoadingCollections
}) => {
  return (
    <div className='col-md-12'>
      <div className='col-md-6 no-left-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordian-header'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>User Sources</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isLoadingSources ?
              <CircularProgress color='primary' />:
              <div>
                {
                  isEmpty(sources) ?
                  <span>No User Sources</span> :
                  map(sources, source => (
                    <Link to={source.url} key={source.id}>
                      <ConceptContainerLabel resource='source' {...source} />
                    </Link>
                  ))
                }
              </div>
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
            <Typography style={ACCORDIAN_HEADING_STYLES}>User Collections</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isLoadingCollections ?
              <CircularProgress color='primary' />:
              <div>
                {
                  isEmpty(collections) ?
                  <span>No User Collections</span> :
                  map(collections, coll => (
                    <Link to={coll.url} key={coll.id}>
                      <ConceptContainerLabel resource='collection' {...coll} />
                    </Link>
                  ))
                }
              </div>
            }
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
}

export default UserHomeConceptContainerResources;
