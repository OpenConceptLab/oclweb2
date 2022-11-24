import React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText,
  FormControlLabel, Tooltip, CircularProgress, FormControl, RadioGroup, Radio, FormHelperText,
  Accordion, AccordionSummary, AccordionDetails, Typography
} from '@mui/material'
import {
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'


const ReferenceCascadeDialog = ({ references, collectionName, onCascadeChange, open, onClose, title, onAdd, isAdding }) => {
  const [cascadeMethod, setCascadeMethod] = React.useState('none')
  const onChange = event => {
    const newValue = event.target.value
    setCascadeMethod(newValue)
    onCascadeChange({cascadeMappings: newValue === 'cascadeMappings', cascadeToConcepts: newValue === 'cascadeToConcepts', cascadeMethod: newValue})
  }

  const helperTextStyle = {
    marginLeft: '30px',
    marginTop: '-8px',
    fontStyle: 'italic',
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
            {`${references.length} selected Reference(s) will be added to Collection: ${collectionName}`}
          </DialogContentText>
          <h4 style={{marginBottom: '5px'}}>
            Would you like to also include associated Concepts and Mappings?
          </h4>
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
                    <span style={{marginRight: '5px', fontSize: '14px'}}>
                      No, only include the selected resources
                    </span>
                  </span>
                }
              />
              <FormControlLabel
                value="cascadeMappings"
                control={<Radio />}
                label={
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px', fontSize: '14px'}}>
                      Yes, include associated Mappings from the same source
                    </span>
                  </span>
                }
              />
              {
                cascadeMethod === 'cascadeMappings' &&
                  <FormHelperText id="cascadeMappings" style={helperTextStyle}>
                    ?cascadeLevels=1&method=sourcemappings
                  </FormHelperText>
              }
              <FormControlLabel
                value="cascadeToConcepts"
                control={<Radio />}
                label={
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px', fontSize: '14px'}}>
                      Yes, include associated Mappings and target Concepts from the same source
                    </span>
                  </span>
                }
              />
              {
                cascadeMethod === 'cascadeToConcepts' &&
                  <FormHelperText id="cascadeToConcepts" style={helperTextStyle}>
                    ?cascadeLevels=1&method=sourcetoconcepts
                  </FormHelperText>
              }
              <FormControlLabel
                value="OpenMRSCascade"
                control={<Radio />}
                label={
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px', fontSize: '14px'}}>
                      Yes, apply OpenMRS-compatible cascade
                    </span>
                    <Tooltip arrow title='Yes, include associated Mappings and target Concepts from the same source, and recursively add any of their associated answer and set member concepts and mappings (e.g. Q-AND-A and CONCEPT-SET mappings)'>
                      <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                    </Tooltip>
                  </span>
                }
              />
              {
                cascadeMethod === 'OpenMRSCascade' &&
                  <FormHelperText id="OpenMRSCascade" style={helperTextStyle}>
                    ?cascadeLevels=*&method=sourcetoconcepts&mapTypes=Q-AND-A,CONCEPT-SET&returnMapTypes=*&transformReferences=resourceVersions
                  </FormHelperText>
              }
            </RadioGroup>
          </FormControl>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{background: 'rgba(0, 0, 0, 0.1)'}}>
              <Typography>API details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              POST /something
            </AccordionDetails>
          </Accordion>
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
