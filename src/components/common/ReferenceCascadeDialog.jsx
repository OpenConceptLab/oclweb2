import React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText,
  FormControlLabel, Checkbox, Tooltip, CircularProgress
} from '@mui/material'
import {
  Help as HelpIcon,
} from '@mui/icons-material'

const ReferenceCascadeDialog = ({ references, collectionName, onCascadeChange, open, onClose, title, onAdd, isAdding }) => {
  const [cascadeMappings, setCascadeMappings] = React.useState(true)
  const [cascadeToConcepts, setCascadeToConcepts] = React.useState(false);
  const onCascadeMappingsChange = () => {
    const newState = !cascadeMappings
    setCascadeMappings(newState)
    onCascadeChange({cascadeMappings: newState, cascadeToConcepts: cascadeToConcepts})
  }
  const onCascadeToConceptsChange = () => {
    const newState = !cascadeToConcepts
    setCascadeToConcepts(newState)
    onCascadeChange({cascadeMappings: cascadeMappings, cascadeToConcepts: newState})
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
          <FormControlLabel
            control={
              <Checkbox
                checked={cascadeMappings}
                        onChange={onCascadeMappingsChange}
                        name="cascadeMappings"
                        size='small'
                        style={{paddingRight: '4px'}}
              />
            }
            label={
              <span className='flex-vertical-center'>
                <span style={{marginRight: '5px', fontSize: '14px'}}>Automatically add associated mappings</span>
                <Tooltip arrow title="A concept's associated mappings are mappings that originate from the specified concept (the 'from concept') and that are stored in the same source">
                  <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                </Tooltip>
              </span>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={cascadeToConcepts}
                        onChange={onCascadeToConceptsChange}
                        name="cascadeToConcepts"
                        size='small'
                        style={{paddingRight: '4px'}}
              />
            }
            label={
              <span className='flex-vertical-center'>
                <span style={{marginRight: '5px', fontSize: '14px'}}>Automatically add associated mappings to concepts</span>
                <Tooltip arrow title="A concept's associated mappings are mappings that originate from the specified concept (the 'from concept') and that are stored in the same source">
                  <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                </Tooltip>
              </span>
            }
          />
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

export default ReferenceCascadeDialog;
