import React from 'react';
import {
  CircularProgress, Accordion, AccordionDetails, AccordionSummary, Divider
} from '@mui/material';
import { get, map, isEmpty, startCase, filter, has, isArray, flatten } from 'lodash';
import { formatWebsiteLink } from '../../common/utils';
import ConceptTable from './ConceptTable';

const CodeList = ({codes, isLoading, hapi}) => {
  const [open, setOpen] = React.useState(0);
  const { systems } = codes;
  const validSystems = () => {
    let _systems = filter(systems, system => has(system, 'concept') || !has(system, 'filter'));
    return flatten(map(_systems, sys => {
      const value = sys.system || sys.valueSet;
      if(isArray(value))
        return map(value, s => ({system: s}))
      return sys
    }))
  }

  return (
    <div className='col-md-12 no-side-padding'>
      {
        isLoading &&
        <div style={{textAlign: 'center'}}>
          <CircularProgress />
        </div>
      }
      {
        !isLoading && isEmpty(systems) &&
        <div style={{textAlign: 'center'}}>
          We found 0 results.
        </div>
      }
      {
        !isEmpty(systems) &&
        map(validSystems(), (system, index) => {
          const concepts = get(system, 'concept', [])
          const count = concepts.length
          const isOpen = Boolean(count && (open === index));
          return (
            <Accordion key={index} expanded={isOpen} onChange={() => setOpen(isOpen ? null : index)}>
              <AccordionSummary expandIcon={<span />}>
                <div className='col-md-12 flex-vertical-center'>
                  <span>
                    <span className='gray-italics'>
                      System:
                    </span>
                    <span>
                      {formatWebsiteLink(system.system)}
                    </span>
                  </span>
                  <Divider orientation='vertical' style={{margin: '0 10px'}} />
                  <span>
                    <span className='gray-italics'>
                      Codes:
                    </span>
                    <span>
                      {count}
                    </span>
                  </span>
                  {
                    system.version &&
                    <React.Fragment>
                      <Divider orientation='vertical' style={{margin: '0 10px'}} />
                      <span>
                        <span className='gray-italics'>
                          Version:
                        </span>
                        <span>
                          {system.version}
                        </span>
                      </span>
                    </React.Fragment>
                  }
                  {
                    system.status &&
                    <React.Fragment>
                      <Divider orientation='vertical' style={{margin: '0 10px'}} />
                      <span>
                        <span className='gray-italics'>
                          Status:
                        </span>
                        <span>
                          {startCase(system.status)}
                        </span>
                      </span>
                    </React.Fragment>
                  }
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <ConceptTable noPaginate hapi={hapi} concepts={{results: concepts}} isLoading={isLoading} />
              </AccordionDetails>
            </Accordion>
          )
        })
      }
    </div>
  )
}

export default CodeList;
