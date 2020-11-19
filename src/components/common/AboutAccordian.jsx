import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  display: 'inline-block', width: '100%', textAlign: 'left',
}

const AboutAccordian = ({id, about}) => {
  return (
    <div className='col-md-12'>
      <Accordion defaultExpanded>
        <AccordionSummary
          className='light-gray-bg'
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
        >
          <Typography style={ACCORDIAN_HEADING_STYLES}>{`About ${id}`}</Typography>
        </AccordionSummary>
        <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
          {
            about ?
            <div
              className='col-md-12 no-side-padding'
              dangerouslySetInnerHTML={{__html: about}}
            /> :
            <h3><small>No about entry</small></h3>
          }
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default AboutAccordian;
