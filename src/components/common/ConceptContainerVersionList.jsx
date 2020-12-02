import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider, Tooltip,
  IconButton
} from '@material-ui/core';
import { map, isEmpty, startCase } from 'lodash';
import {
  ExpandMore as ExpandMoreIcon, Search as SearchIcon
} from '@material-ui/icons';
import { headFirst } from '../../common/utils';
import LastUpdatedOnLabel from './LastUpdatedOnLabel';
import ResourceVersionLabel from './ResourceVersionLabel';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'scroll', display: 'inline-block', width: '100%'
}

const None = () => {
  return <div style={{margin: '5px', fontWeight: '300'}}>None</div>
}

const ConceptContainerVersionList = ({ versions, resource }) => {
  let sortedVersions = headFirst(versions);
  return (
    <div className='col-md-12'>
      <div className='col-md-8 no-left-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordian-header'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>{`${startCase(resource)} Version History`}</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isEmpty(sortedVersions) ?
              None() :
              map(sortedVersions, (version, index) => (
                <div className='col-md-12 no-side-padding' key={index}>
                  <div className='col-md-12 no-side-padding flex-vertical-center' style={{margin: '10px 0'}}>
                    <div className='col-md-11 no-left-padding'>
                      <div className='col-md-12 no-side-padding' style={{marginBottom: '5px'}}>
                        <ResourceVersionLabel {...version} />
                      </div>
                      <div className='col-md-12'>
                        <span>{version.description}</span>
                      </div>
                      <div className='col-md-12'>
                        <LastUpdatedOnLabel
                          by={version.created_by}
                          date={version.created_on}
                          label='Created on'
                        />
                      </div>
                    </div>
                    <div className='col-md-1 no-right-padding'>
                      <Tooltip title='Version Link'>
                        <IconButton href={`#${version.concepts_url}`} color='primary' size='small'>
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
            <p className="small">
              Create a new
              <strong>{` ${startCase(resource)} Version `}</strong>
              {
                `to save the state of a ${resource}'s concepts and mappings at a specific point in time.`
              }
            </p>
				    <p className="small">
              A
              <strong> Released </strong>
              {
                ` ${resource} version indicates to your users that a particular source version is prepared for public consumption, while a`
              }
              <strong> Retired </strong>
              {`${resource} version indicates that it should no longer be used.`}
            </p>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
}

export default ConceptContainerVersionList;
