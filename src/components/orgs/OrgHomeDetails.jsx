import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { get, map, isEmpty } from 'lodash';
import CustomAttributesAccordian from '../common/CustomAttributesAccordian';
import UserButton from '../common/UserButton';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  display: 'inline-block', width: '100%', textAlign: 'left',
}

const OrgHomeDetails = ({ org, members }) => {
  return (
    <div className='col-md-12'>
      <div className='col-md-8 no-left-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Organization Details</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            <div className='col-md-12' style={{marginBottom: '5px', marginTop: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Company
              </div>
              <div className='col-md-8 no-right-padding'>
                {org.company}
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '5px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Website
              </div>
              <div className='col-md-8 no-right-padding'>
                {
                  org.website &&
                  <a href={org.website} target="_blank" rel="noopener noreferrer">
                    {org.website}
                  </a>
                }
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Public Access
              </div>
              <div className='col-md-8 no-right-padding'>
                {org.public_access}
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
        <CustomAttributesAccordian
          attributes={get(org, 'extras', {})}
          headingStyles={ACCORDIAN_HEADING_STYLES}
          detailStyles={ACCORDIAN_DETAILS_STYLES}
        />
      </div>
      <div className='col-md-4 no-right-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Members</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isEmpty(members) ?
              <div> No Members </div> :
              map(members, member => {
                let label = member.name;
                if(label === '- -')
                  label = member.username
                return <UserButton key={member.username} label={label} href={`#${member.url}`} />;
              })

            }
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
}

export default OrgHomeDetails;
