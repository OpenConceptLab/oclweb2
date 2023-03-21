import React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText,
  FormControlLabel, Tooltip, CircularProgress, FormControl, RadioGroup, Radio, Checkbox
} from '@mui/material'
import {
  Help as HelpIcon,
} from '@mui/icons-material'
import DialogTitleWithCloseButton from './DialogTitleWithCloseButton';
import APIPreview from './APIPreview'
import HtmlToolTipRaw from './HtmlToolTipRaw';


const ReferenceCascadeDialog = ({ references, collectionName, onCascadeChange, open, onClose, title, onAdd, isAdding, collection, noCascadePayloadFunc, cascadeMappingsFunc, cascadeToConceptsFunc, cascadeOpenMRSFunc, onTransformReferencesChange }) => {
  const [cascadeMethod, setCascadeMethod] = React.useState('none')
  const [transformReferences, setTransformReferences] = React.useState(false)
  const onChange = event => {
    const newValue = event.target.value
    setCascadeMethod(newValue)
    if(newValue === 'OpenMRSCascade')
      _onTransformReferencesChange(true)

    onCascadeChange({cascadeMappings: newValue === 'cascadeMappings', cascadeToConcepts: newValue === 'cascadeToConcepts', cascadeMethod: newValue})
  }

  const _onTransformReferencesChange = transform => {
    setTransformReferences(transform)
    onTransformReferencesChange(transform)
  }

  const getPayload = () => {
    if(cascadeMethod === 'none' && noCascadePayloadFunc)
      return noCascadePayloadFunc()
    if(cascadeMethod === 'cascadeMappings' && cascadeMappingsFunc)
      return cascadeMappingsFunc()
    if(cascadeMethod === 'cascadeToConcepts' && cascadeToConceptsFunc)
      return cascadeToConceptsFunc()
    if(cascadeMethod === 'OpenMRSCascade' && cascadeOpenMRSFunc)
      return cascadeOpenMRSFunc()
  }

  const cascadePayload = getPayload()
  const queryString = new URLSearchParams(cascadePayload?.queryParams).toString()
  const requestURL = collection ? collection.url + 'references/' + (queryString ? `?${queryString}` : '') : null

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
              <FormControlLabel
                value="OpenMRSCascade"
                control={<Radio />}
                label={
                  <span className='flex-vertical-center'>
                    <span style={{marginRight: '5px', fontSize: '14px'}}>
                      Yes, apply OpenMRS-compatible cascade
                    </span>
                    <Tooltip arrow title='Includes associated Mappings and target Concepts from the same source, and recursively adds any of their associated answer and set member concepts and mappings (e.g. Q-AND-A and CONCEPT-SET mappings)'>
                      <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                    </Tooltip>
                  </span>
                }
              />
            </RadioGroup>
            {
              Boolean(onTransformReferencesChange) &&
                <FormControlLabel
                  control={<Checkbox checked={transformReferences} onChange={() => _onTransformReferencesChange(!transformReferences)}/>}
                  label={
                    <span className='flex-vertical-center'>
                      <span style={{marginRight: '5px', fontSize: '14px'}}>
                        Transform to static references
                      </span>
                      <HtmlToolTipRaw
                        placement='right'
                        title={
                          <span>
                          <span>
                            Transforming to static references means that after concepts and mappings are added to your collection, they will not change even if they are updated at the source.
                          </span>
                            <br />
                            <br />
                            <span>
                              Uncheck this box to allow dynamic references, which may help you to keep your collection up to date in the future. See this <a href="https://www.youtube.com/watch?v=bl2IilO0Fec&list=PLbjKElEpop-Ubhm5Xz4sQ7u7ugune_CXF&index=2" target="_blank" rel="noopener noreferrer">YouTube video</a> for details.
                            </span>
                          </span>
                        }
                        arrow
                      >
                        <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                      </HtmlToolTipRaw>
                    </span>
                  }
                />
            }
          </FormControl>
          {
            cascadePayload &&
              <APIPreview verb='PUT' payload={cascadePayload.payload} url={requestURL}/>
          }
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
                  <DialogTitleWithCloseButton onClose={onClose}>
                    {title}
                  </DialogTitleWithCloseButton>
              }
              { getContent() }
              <DialogActions>
                <React.Fragment>
                  <Button onClick={onClose} color="secondary" disabled={isAdding}>
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
