import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, FormHelperText } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const CommonAccordion = ({title, subTitle, children, defaultStyle, ...accordionProps}) => {
  return (
    <div className='col-xs-12 no-side-padding'>
      <Accordion style={defaultStyle ? {} : {borderTop: "1px solid rgba(0, 0, 0, 0.12)"}} {...(accordionProps || {})}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <div>
            <Typography>{title}</Typography>
            {
              subTitle &&
                <FormHelperText>{subTitle}</FormHelperText>
            }
          </div>
        </AccordionSummary>
        <AccordionDetails style={{background: '#fafafa', display: 'inline-block', width: '100%'}}>
          {children}
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

export default CommonAccordion;
