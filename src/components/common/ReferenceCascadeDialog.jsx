import React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText,
  FormControlLabel, Tooltip, CircularProgress, FormControl, RadioGroup, Radio
} from '@mui/material'
import {
  Help as HelpIcon,
} from '@mui/icons-material'

const ReferenceCascadeDialog = ({ references, collectionName, onCascadeChange, open, onClose, title, onAdd, isAdding }) => {
  const [cascadeMethod, setCascadeMethod] = React.useState('none')
  const onChange = event => {
    const newValue = event.target.value
    setCascadeMethod(newValue)
    onCascadeChange({cascadeMappings: newValue === 'cascadeMappings', cascadeToConcepts: newValue === 'cascadeToConcepts', cascadeMethod: newValue})
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
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={cascadeMethod}
              onChange={onChange}
            >
              <FormControlLabel
                value="none"
                control={<Radio />}
                label={
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px', fontSize: '14px'}}>Do not cascade (default)</span>
                    <Tooltip arrow title="Add reference(s) to the selected resource(s) ONLY">
                      <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                    </Tooltip>
                  </span>
                }
              />
              <FormControlLabel
                value="cascadeMappings"
                control={<Radio />}
                label={
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px', fontSize: '14px'}}>
                      Cascade to associated mappings in the same source
                    </span>
                    <Tooltip arrow title="Add reference(s) to the selected resource(s) AND any of those concepts’ mappings (only if the mapping is in the same source as the concept)">
                      <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                    </Tooltip>
                  </span>
                }
              />
              <FormControlLabel
                value="cascadeToConcepts"
                control={<Radio />}
                label={
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px', fontSize: '14px'}}>
                      Cascade to associated mappings and target concepts in the same source
                    </span>
                    <Tooltip arrow title="Add reference(s) to the selected resource(s) AND any of those concepts’ mappings AND the target concepts of those mappings (only for resources in the same source as the selected resource)">
                      <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                    </Tooltip>
                  </span>
                }
              />
              <FormControlLabel
                value="OpenMRSCascade"
                control={<Radio />}
                label={
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px', fontSize: '14px'}}>
                      OpenMRS-compatible Cascade
                    </span>
                    <Tooltip arrow title='A specialized cascade option that adds a concept and all of its mappings, and then recursively adds any of its associated answer or set member concepts (i.e. concepts that are associated by a "Q-AND-A" or "CONCEPT-SET" map type) with all of their mappings, and so on. Resources are only added if they are defined in the same source as the selected concept(s).'>
                      <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                    </Tooltip>
                  </span>
                }
              />
            </RadioGroup>
          </FormControl>
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
