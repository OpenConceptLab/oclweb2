import React from 'react';
import MuiAlert from '@mui/material/Alert';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FmdBad as NoneIcon } from '@mui/icons-material'
import { filter, map, get, isEmpty, values, keys, find } from 'lodash';
import { toFullAPIURL, dropVersion } from '../../common/utils'

const ReferencesResult = ({references, severity, title, success, defaultExpanded}) => (
  <div className='col-md-12 no-side-padding'>
    <Accordion sx={{boxShadow: 'none'}} defaultExpanded={defaultExpanded}>
      <AccordionSummary sx={{padding: 0, '.Mui-expanded': {margin: 0}}}>
        <MuiAlert variant="filled" severity={severity} sx={{marginTop: '5px', width: '100%'}} action={<ExpandMoreIcon />}>
          {title}
        </MuiAlert>
      </AccordionSummary>
      <AccordionDetails sx={{p: 0, maxHeight: '500px', overflow: 'auto'}}>
        {
          map(references, (reference, index) => {
            let message;
            let conflictingConceptName, conflictingConceptURL, conflictingConceptID, conflictingName, conflictingNameURL, conflictingReference;
            if(success)
              message = reference?.message
            else {
              const errors = values(reference.message)
              let error;
              if(errors?.length == 1)
                error = get(errors, '0.errors.0')
              else {
                const errorKey = find(keys(reference.message), expression => dropVersion(expression) == dropVersion(reference.expression))
                if(errorKey)
                  error = get(reference.message, `${errorKey}.errors.0`)
              }
              message = error?.description
              conflictingReference = get(error, `conflicting_references.0`)
              conflictingConceptName = error?.conflicting_concept_name
              conflictingConceptID = error?.conflicting_concept_id
              conflictingConceptURL = error?.conflicting_concept_url
              conflictingName = error?.conflicting_name
              conflictingNameURL = error?.conflicting_name_url
            }
            return (
              <React.Fragment key={index}>
                <div style={{padding: '5px', background: 'rgba(0, 0, 0, 0.05)'}}>
                  <span style={{marginRight: '5px'}}><b>{reference.expression}:</b></span>
                  {
                    message &&
                      <span>{message}</span>
                  }
                  {
                    conflictingConceptName && conflictingConceptURL &&
                      <span style={{marginLeft: '5px'}}>
                        Conflicting with Concept <a href={`#${conflictingConceptURL}`} rel='noreferrer noopener' target='_blank'>{conflictingConceptID}:{conflictingConceptName}</a>
                        {
                          conflictingNameURL && conflictingName &&
                            <span style={{marginLeft: '5px'}}>
                              name <a href={toFullAPIURL(conflictingNameURL)} rel='noreferrer noopener' target='_blank'>{conflictingName}</a>
                            </span>
                        }
                        {
                          conflictingReference &&
                            <span style={{marginLeft: '5px'}}>
                              from existing <a href={toFullAPIURL(conflictingReference)} rel='noreferrer noopener' target='_blank'>reference</a>
                            </span>
                        }
                        .
                      </span>
                  }
                  {
                    !conflictingNameURL && conflictingReference &&
                      <span style={{marginLeft: '5px'}}>
                        Conflicting with the existing <a href={toFullAPIURL(conflictingReference)} rel='noreferrer noopener' target='_blank'>reference</a>
                      </span>
                  }
                </div>
                <Divider />
              </React.Fragment>
            )
          })
        }
      </AccordionDetails>
    </Accordion>
  </div>
);

const AddReferencesResult = ({ result, open, onClose, title }) => {
  const added = filter(result, {added: true});
  const notAdded = filter(result, {added: false});
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        <div className='col-md-12 no-side-padding'>
          {
            !isEmpty(notAdded) &&
              <ReferencesResult
                defaultExpanded={isEmpty(added)}
                references={notAdded}
                severity='warning'
                title={`${notAdded.length} Reference(s) listed below could not be added.`}
              />
          }
          {
            !isEmpty(added) &&
              <ReferencesResult
                defaultExpanded={isEmpty(notAdded)}
                references={added}
                severity='success'
                title={`${added.length} Reference(s) successfully added.`}
                success
              />
          }
          {
            isEmpty(added) && isEmpty(notAdded) &&
              <div className='flex-vertical-center'>
                <NoneIcon color='warning' style={{marginRight: '5px'}} />
                <span>0 references added</span>
              </div>
          }
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant='outlined'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddReferencesResult;
