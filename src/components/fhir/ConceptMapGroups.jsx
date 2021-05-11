import React from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Divider
} from '@material-ui/core';
import { ExpandMore as ExpandIcon } from '@material-ui/icons';
import { get, map } from 'lodash';
import { formatWebsiteLink } from '../../common/utils';

const ConceptMapGroups = ({ groups, isHAPI }) => {
  const [open, setOpen] = React.useState(0);
  const getHeaderAttrs = () => {
    if(isHAPI)
      return [
        {type: 'url', attr: 'source', label: 'Source'},
        {type: 'url', attr: 'target', label: 'Target'},
      ]
    return [
      {type: 'url', attr: 'source', label: 'Source'},
      {type: 'url', attr: 'target', label: 'Target'},
    ]
  }

  const getValue = (value, type) => {
    if(!type)
      return value
    if(type === 'url')
      return formatWebsiteLink(value)

    return value
  }

  const getSummaryTemplate = (label, value, type, divider) => {
    return (
      <React.Fragment key={value}>
        <span>
          <span className='gray-italics'> {label}: </span>
          <span> { getValue(value, type) } </span>
        </span>
        { divider && <Divider orientation='vertical' style={{margin: '0 10px'}} /> }
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      {
        map(groups, (group, index) => {
          const count = get(group, 'element', []).length
          const isOpen = Boolean(count && (open === index))
          const headerAttrs = getHeaderAttrs()
          return (
            <Accordion key={index} expanded={isOpen} onChange={() => setOpen(isOpen ? null : index)}>
              <AccordionSummary expandIcon={<ExpandIcon />}>
                <div className='col-md-12 flex-vertical-center'>
                  {
                    map(
                      headerAttrs,
                      meta => getSummaryTemplate(
                        meta.label, get(group, meta.attr), meta.type, true
                      )
                    )
                  }
                  { getSummaryTemplate('Count', count, false, false) }
                </div>
              </AccordionSummary>
              <AccordionDetails>
              </AccordionDetails>
            </Accordion>
          )
        })
      }
    </React.Fragment>
  )
}

export default ConceptMapGroups;
