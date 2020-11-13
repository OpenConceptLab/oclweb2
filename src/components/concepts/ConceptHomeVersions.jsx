import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider, Tooltip,
  IconButton
} from '@material-ui/core';
import { map, isEmpty, } from 'lodash';
import {
  ExpandMore as ExpandMoreIcon, Search as SearchIcon
} from '@material-ui/icons';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'scroll', display: 'inline-block', width: '100%'
}

const None = () => {
  return <div style={{margin: '5px', fontWeight: '300'}}>None</div>
}

const ConceptHomeVersions = ({ versions }) => {
  return (
    <div className='col-md-12'>
      <div className='col-md-8'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Conept Version History</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isEmpty(versions) ?
              None() :
              map(versions, (version, index) => (
                <div className='col-md-12' key={index}>
                  <div className='col-md-12 no-side-padding flex-vertical-center' style={{margin: '10px 0'}}>
                    <div className='col-md-11 no-left-padding'>
                      <div className='col-md-12 no-side-padding'>
                        {
                          version.update_comment ?
                          <span>{version.update_comment}</span> :
                          <span className='gray-italics-small'>No update comment</span>
                        }
                      </div>
                      <div className='col-md-12 no-side-padding'>
                        <LastUpdatedOnLabel
                          by={version.version_created_by}
                          date={version.version_created_on}
                        />
                      </div>
                    </div>
                    <div className='col-md-1 no-right-padding'>
                      <Tooltip title='Version Link'>
                        <IconButton href={`#${version.version_url}`} color='primary' size='small'>
                          <SearchIcon fontSize='inherit' />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                  {
                    (index + 1) < versions.length &&
                    <Divider style={{width: '100%'}} />
                  }
                </div>
              ))
            }
          </AccordionDetails>
        </Accordion>
      </div>
      <div className='col-md-4'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Tip</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            <p className="small">All changes to a concept are automatically saved to its
						  <strong>Concept Version History</strong>.
            </p>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
}

export default ConceptHomeVersions;
