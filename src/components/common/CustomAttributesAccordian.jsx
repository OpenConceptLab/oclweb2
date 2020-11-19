import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { map, isEmpty } from 'lodash';

const None = () => {
  return <div style={{margin: '5px', fontWeight: '300'}}>None</div>
}

const CustomAttributesAccordian = ({
  headingStyles, detailStyles, attributes
}) => {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        className='light-gray-bg'
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
      >
        <Typography style={headingStyles}>Custom Attributes</Typography>
      </AccordionSummary>
      <AccordionDetails style={detailStyles}>
        {
          isEmpty(attributes) ?
          None() :
          map(attributes, (value, name) => (
            <div className='col-md-12' style={{marginBottom: '5px'}} key={name}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                {name}
              </div>
              <div className='col-md-8 no-right-padding ellipsis-text' style={{maxWidth: '100%'}}>
                {value}
              </div>
            </div>
          ))
        }
      </AccordionDetails>
    </Accordion>
  )
}

export default CustomAttributesAccordian;
