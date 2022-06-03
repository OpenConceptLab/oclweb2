import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { last } from 'lodash';
import { RED } from '../../common/constants';

const ConceptContainerDelete = ({open, resource, onClose, onDelete, associatedResources}) => {
  const resourceEntity = resource.type
  const resourceType = resourceEntity.toLowerCase()
  const resourceId = resource.short_code || resource.id
  const [input, setInput] = React.useState('');
  const canDelete = input === resourceId
  const opacity = canDelete ? 1 : 0.5;
  const onSubmit = () => {
    onClose();
    onDelete();
  }
  const associations = (associatedResources || ['versions', 'concepts', 'mappings'])
  let associationsLabel = associations.slice(0, -1).join(', ') + ' and ' + last(associations)
  return (
    <React.Fragment>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>
          {`Delete ${resourceEntity}: ${resourceId}`}
        </DialogTitle>
        <DialogContent>
          <MuiAlert variant="filled" severity="warning" style={{marginBottom: '10px'}}>
            Unexpected bad things will happen if you don’t read this!
          </MuiAlert>
          <p>
            {`Are you sure you want to permanently delete this ${resourceType} `}
            <b>{resourceId}</b>?
          </p>
          <p>
            This action <b>cannot</b> be undone!
            {
              ` This will delete the entire ${resourceType} and all of its associated ${associationsLabel}.`
            }
          </p>
          <p>
            Please type <b>{resourceId}</b> to confirm.
          </p>
          <div className='col-md-12 no-side-padding'>
            <TextField
              fullWidth
              variant='outlined' size="small" onChange={event => setInput(event.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions style={{textAlign: 'center', justifyContent: 'center', margin: '15px 0'}}>
          <Button
            disabled={!canDelete}
            style={{color: RED, fontWeight: 'bold', opacity: opacity}}
            variant='outlined'
            onClick={onSubmit}>
            {`I understand the consequences, delete this ${resourceType}`}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}

export default ConceptContainerDelete;
