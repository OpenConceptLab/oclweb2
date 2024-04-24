import React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, Collapse, Badge,
  FormControlLabel, Tooltip, CircularProgress, FormControl, RadioGroup, Radio, Checkbox
} from '@mui/material'
import {
  Help as HelpIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
} from '@mui/icons-material'
import DialogTitleWithCloseButton from './DialogTitleWithCloseButton';
import APIPreview from './APIPreview'
import { HtmlToolTipClone as HtmlToolTipRaw } from './HtmlToolTipRaw';


const ReferenceCascadeDialog = ({ references, collectionName, onCascadeChange, open, onClose, title, onAdd, isAdding, collection, noCascadePayloadFunc, cascadeMappingsFunc, cascadeToConceptsFunc, cascadeOpenMRSFunc, onTransformReferencesChange }) => {
  const [cascadeMethod, setCascadeMethod] = React.useState('none')
  const [transformReferences, setTransformReferences] = React.useState(false)
  const [advancedSettings, setAdvancedSettings] = React.useState(false)
  const toggleSettings = () => setAdvancedSettings(!advancedSettings)
  const showAdvancedSettings = Boolean(onTransformReferencesChange)
  const onChange = event => {
    const newValue = event.target.value
    setCascadeMethod(newValue)
    _onTransformReferencesChange(newValue === 'OpenMRSCascade')
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
          <FormControl style={{marginBottom: '5px'}}>
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
              showAdvancedSettings &&
                <div className='col-xs-12 no-side-padding' style={{marginTop: '10px'}}>
                <Badge badgeContent={transformReferences && !advancedSettings ? 1 : 0} color='primary'>
                  <Button
                    size='small'
                    variant='text'
                    endIcon={
                      advancedSettings ?
                        <ArrowDropUpIcon fontSize='inherit' /> :
                        <ArrowDropDownIcon fontSize='inherit' />
                    }
                    style={{textTransform: 'none', marginLeft: '-4px'}}
                    onClick={toggleSettings}>
                    Advanced Settings
                  </Button>
                </Badge>
                  <Collapse in={advancedSettings} timeout="auto" unmountOnExit style={{marginTop: '-15px'}}>
                    {
                      advancedSettings &&
                        <div className='col-xs-12 no-side-padding' style={{margin: '15px 0'}}>
                        <FormControlLabel
                          control={<Checkbox checked={transformReferences} onChange={() => _onTransformReferencesChange(!transformReferences)}/>}
                          label={
                            <span className='flex-vertical-center'>
                              <span style={{marginRight: '5px', fontSize: '14px'}}>
                                Transform to extensional references
                              </span>
                              <HtmlToolTipRaw
                                placement='right'
                                title={
                                  <span>
                                    <span>
                                      Using this checkbox will instruct OCL to create separate references for each individual concept or mapping (i.e. "extensional" or "one-to-one" references).
                                  </span>
                                    <br />
                                    <br />
                                    <span>
                                      Uncheck this box to instruct OCL to create fewer references that can represent multiple concepts and mappings (i.e. "intentional" or "one-to-many" references).
                                      See this <a href="https://www.youtube.com/watch?v=bl2IilO0Fec&list=PLbjKElEpop-Ubhm5Xz4sQ7u7ugune_CXF&index=2" target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'underline', fontWeight: 'bold'}}>YouTube video</a> for details.
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
                        </div>
                    }
                  </Collapse>
        </div>
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
