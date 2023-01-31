import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'

const APIPreview = ({payload, verb, url, }) => {
  return (
    <Accordion style={{marginTop: '10px'}}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>API details</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div style={{fontWeight: 'bold'}}>
          {
            `${verb} ${url}`
          }
        </div>
        <div>
          <pre style={{color: '#FFF', backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '10px'}}>
            {
              JSON.stringify(payload, undefined, 2)
            }
          </pre>
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default APIPreview;
