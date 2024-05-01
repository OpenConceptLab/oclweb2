import React from 'react';
import MuiAlert from '@mui/material/Alert';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider
} from '@mui/material'
import { FmdBad as NoneIcon } from '@mui/icons-material'
import { filter, map, get, isEmpty } from 'lodash';
import { toFullAPIURL} from '../../common/utils'

const ReferencesResult = ({references, severity, title, success}) => (
  <div className='col-md-12 no-side-padding'>
    <MuiAlert variant="filled" severity={severity} style={{marginTop: '5px'}}>
      {title}
    </MuiAlert>
    {
      map(references, (reference, index) => {
        let message;
        let conflictingConceptName, conflictingConceptURL, conflictingConceptID, conflictingName, conflictingNameURL, conflictingReference;
        if(success)
          message = reference?.message
        else {
          const error = get(reference, `message.${reference.expression}.errors.0`)
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
            !isEmpty(added) &&
            <ReferencesResult
              references={added}
              severity='success'
              title={`${added.length} Reference(s) successfully added.`}
              success
            />
          }
          {
            !isEmpty(notAdded) &&
            <ReferencesResult
              references={notAdded}
              severity='warning'
              title={`${notAdded.length} Reference(s) listed below could not be added.`}
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
