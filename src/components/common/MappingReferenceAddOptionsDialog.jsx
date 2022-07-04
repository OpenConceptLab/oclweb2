import React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText,
  FormControlLabel, Tooltip, CircularProgress, Checkbox, FormGroup
} from '@mui/material'
import {
  Help as HelpIcon,
} from '@mui/icons-material'
import { merge } from 'lodash';

const MappingReferenceAddOptionsDialog = ({ references, collectionName, onChange, open, onClose, title, onAdd, isAdding }) => {
  const [addToConcepts, setAddToConcepts] = React.useState(false)
  const [addFromConcepts, setAddFromConcepts] = React.useState(false)
  const [addMappings, setAddMappings] = React.useState(true)

  const onStateChange = (event, setState, id) => {
    const newValue = event.target.checked
    setState(newValue)
    onChange(merge({addMappings: addMappings, addToConcepts: addToConcepts, addFromConcepts: addFromConcepts}, {[id]: newValue}))
  }

  const getContent = () => (
    <DialogContent>
      {
        isAdding ?
        <div className='col-md-12' style={{textAlign: 'center'}}>
          <CircularProgress />
        </div> :
        <React.Fragment>
          <DialogContentText style={{color: 'black', marginBottom: '20px'}}>
            {`${references.length} selected reference(s) will be added to collection ${collectionName}`}
          </DialogContentText>
          <FormGroup>
            <FormControlLabel
              onChange={event => onStateChange(event, setAddMappings, 'addMappings')}
                control={<Checkbox checked={addMappings} />}
                label={
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px', fontSize: '14px'}}>Add Selected Mappings (default)</span>
                    <Tooltip arrow title="Add reference(s) to the selected mappings(s) ONLY">
                      <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                    </Tooltip>
                  </span>
                }
              />
              <FormControlLabel
                onChange={event => onStateChange(event, setAddToConcepts, 'addToConcepts')}
                control={<Checkbox checked={addToConcepts} />}
                label={
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px', fontSize: '14px'}}>
                      Add Target Concepts
                    </span>
                    <Tooltip arrow title="Add reference(s) to the selected mapping's Target Concepts">
                      <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                    </Tooltip>
                  </span>
                }
              />
              <FormControlLabel
                onChange={event => onStateChange(event, setAddFromConcepts, 'addFromConcepts')}
                control={<Checkbox checked={addFromConcepts} />}
                label={
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px', fontSize: '14px'}}>
                      Add From Concepts
                    </span>
                    <Tooltip arrow title="Add reference(s) to the selected mapping's From Concepts">
                      <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                    </Tooltip>
                  </span>
                }
              />
          </FormGroup>
        </React.Fragment>
      }
    </DialogContent>
  );
  return (
    <React.Fragment>
      {
        open ?
        (
          <Dialog open={open} onClose={onClose}>
            {
              title &&
              <DialogTitle>
                {title}
              </DialogTitle>
            }
            { getContent() }
            <DialogActions>
              <React.Fragment>
                <Button onClick={onClose} color="primary" disabled={isAdding}>
                  Cancel
                </Button>
                <Button onClick={onAdd} color="primary" disabled={isAdding}>
                  Add
                </Button>
              </React.Fragment>
            </DialogActions>
          </Dialog>
        ) :
        (getContent())
      }
    </React.Fragment>
  )
}

export default MappingReferenceAddOptionsDialog;
