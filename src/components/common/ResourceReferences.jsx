import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, List, ListItem, Tooltip, Chip
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
} from '@mui/icons-material'
import { get, map } from 'lodash';
import { toFullAPIURL } from '../../common/utils';
import TabCountLabel from './TabCountLabel'

const ResourceReferences = ({headingStyles, detailStyles, references, resource}) => {
  const count = get(references, 'length', 0)
  return (
    <Accordion expanded style={{borderRadius: 'unset'}}>
      <AccordionSummary
        className='light-gray-bg less-paded-accordian-header'
        expandIcon={<span />}
        aria-controls="panel1a-content"
        style={{cursor: 'inherit'}}
      >
        <span className='flex-vertical-center' style={{width: '100%', justifyContent: 'space-between'}}>
          <TabCountLabel label='References' count={count} style={headingStyles} />
          <span className='flex-vertical-center'>
            <span className='flex-vertical-center' style={{marginLeft: '10px'}}>
              <Tooltip arrow title={`This ${resource} appears in this collection expansion as a result of these references.`}>
                <InfoIcon fontSize='small' color='action' />
              </Tooltip>
            </span>
          </span>
        </span>
      </AccordionSummary>
      <AccordionDetails style={detailStyles}>
        <List>
          {
            map(references, reference => (
              <ListItem key={reference.id}>
                {reference.expression}
                <Chip style={{marginLeft: '5px'}} variant='outlined' color='primary' size='small' label='view' onClick={() => window.open(toFullAPIURL(reference.uri))} />
              </ListItem>
            ))
          }
        </List>
      </AccordionDetails>
    </Accordion>
  )
}

export default ResourceReferences;
