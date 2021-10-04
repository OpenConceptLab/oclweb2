import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody
} from '@material-ui/core';
import { get, isEmpty, forEach, map } from 'lodash';
import { BLUE, WHITE } from '../../common/constants'
import { generateRandomString } from '../../common/utils'
import ConceptHomeMappingsTableRows from '../mappings/ConceptHomeMappingsTableRows';
import TabCountLabel from '../common/TabCountLabel';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'auto', display: 'inline-block', width: '100%', padding: '0'
}

const None = () => {
  return <div style={{padding: '20px', fontWeight: '300'}}>None</div>
}

const groupMappings = (concept, mappings) => {
  const orderedMappings = {}
  forEach(mappings, mapping => {
    orderedMappings[mapping.map_type] = orderedMappings[mapping.map_type] || {order: null, direct: [], indirect: [], unknown: []}
    const isDirect = mapping.from_concept_url === concept.url;
    if(isDirect)
      orderedMappings[mapping.map_type].direct.push(mapping)
    else
      orderedMappings[mapping.map_type].indirect.push(mapping)
  })
  return orderedMappings;
}

const HomeMappings = ({ concept, isLoadingMappings }) => {
  const conceptMappings = get(concept, 'mappings') || [];
  const count = isLoadingMappings ? null : conceptMappings.length;
  const tbHeadCellStyles = {padding: '8px', color: WHITE}
  const orderedMappings = groupMappings(concept, conceptMappings)

  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        className='light-gray-bg less-paded-accordian-header'
        expandIcon={<span />}
        aria-controls="panel1a-content"
      >
        <TabCountLabel label='Associations' count={count} style={{ACCORDIAN_HEADING_STYLES}} />
      </AccordionSummary>
      <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
        {
        isLoadingMappings ?
        <div style={{textAlign: 'center', padding: '10px'}}>
          <CircularProgress />
        </div> : (
          isEmpty(conceptMappings) ?
          None() :
          <Table size="small" aria-label="concept-home-mappings" className='nested-mappings'>
            <TableHead>
              <TableRow style={{backgroundColor: BLUE, color: WHITE}}>
                <TableCell align='left' style={tbHeadCellStyles}><b>Relationship</b></TableCell>
                <TableCell align='left' style={tbHeadCellStyles}><b>Code</b></TableCell>
                <TableCell align='left' style={tbHeadCellStyles}><b>Name</b></TableCell>
                <TableCell align='left' style={tbHeadCellStyles}><b>Source</b></TableCell>
                <TableCell align='left' />
              </TableRow>
            </TableHead>
            <TableBody>
              {
                map(orderedMappings, (oMappings, mapType) => {
                  const key = generateRandomString()
                  const hasDirectMappings = !isEmpty(oMappings.direct)
                  return (
                    <React.Fragment key={key}>
                      {
                        hasDirectMappings &&
                        <ConceptHomeMappingsTableRows
                          mappings={oMappings.direct}
                          mapType={mapType}
                        />
                      }
                    </React.Fragment>
                  )
                })
              }
              {
                map(orderedMappings, (oMappings, mapType) => {
                  const key = generateRandomString()
                  const hasInDirectMappings = !isEmpty(oMappings.indirect)
                  return (
                    <React.Fragment key={key}>
                      {
                        hasInDirectMappings &&
                        <ConceptHomeMappingsTableRows
                          mappings={oMappings.indirect}
                          mapType={mapType}
                          isIndirect
                        />
                      }
                    </React.Fragment>
                  )
                })
              }
            </TableBody>
          </Table>
        )
        }
      </AccordionDetails>
    </Accordion>
  )
}

export default HomeMappings;
