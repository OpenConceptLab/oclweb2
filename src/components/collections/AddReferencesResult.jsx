import React from 'react';
import MuiAlert from '@mui/material/Alert';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider
} from '@mui/material'
import { filter, map, get, isEmpty } from 'lodash';

const ReferencesResult = ({references, severity, title, messageKey}) => (
  <div className='col-md-12 no-side-padding'>
    <MuiAlert variant="filled" severity={severity} style={{marginTop: '5px'}}>
      {title}
    </MuiAlert>
    {
      map(references, (reference, index) => {
        const message = get(reference, messageKey);
        return (
          <React.Fragment key={index}>
            <div style={{padding: '5px', background: 'rgba(0, 0, 0, 0.05)'}}>
              <span style={{marginRight: '5px'}}><b>{reference.expression}:</b></span>
              {message && <span>{message}</span>}
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
              messageKey='message'
            />
          }
          {
            !isEmpty(notAdded) &&
            <ReferencesResult
              references={notAdded}
              severity='warning'
              title={`${notAdded.length} Reference(s) listed below could not be added.`}
              messageKey='message.0'
            />
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
