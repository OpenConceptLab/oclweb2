import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography
} from '@material-ui/core';
import CustomAttributes from './CustomAttributes'

const CustomAttributesAccordian = ({headingStyles, detailStyles, attributes}) => {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        className='light-gray-bg less-paded-accordian-header'
        expandIcon={<span />}
        aria-controls="panel1a-content"
      >
        <Typography style={headingStyles}>Custom Attributes</Typography>
      </AccordionSummary>
      <AccordionDetails style={detailStyles}>
        <CustomAttributes attributes={attributes} />
      </AccordionDetails>
    </Accordion>
  )
}

export default CustomAttributesAccordian;
