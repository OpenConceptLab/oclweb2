import React from 'react';
import {
  DialogActions, DialogContent, DialogContentText,
  Collapse, Button
} from '@mui/material'
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
} from '@mui/icons-material'
import CascadeParametersForm from './CascadeParametersForm';
import ConceptTable from '../concepts/ConceptTable';
import APIPreview from './APIPreview'

const CloneToSourceDialogContent = ({onClose, onAdd, advancedSettings, toggleSettings, defaultParams, onParamsChange, sourceName, concepts, isAdding, result, onPreviewClick, payload, requestURL, toSource }) => {
  return (
    <React.Fragment>
      <DialogContent>
        <DialogContentText>
          This operation will clone the selected concept(s), plus any answers or set members recursively following specified mappings. This will skip any concepts already (SAME-AS) in the destination.
        </DialogContentText>
        <div className='col-xs-12 no-side-padding' style={{marginTop: '10px'}}>
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
          <Collapse in={advancedSettings} timeout="auto" unmountOnExit>
            {
              advancedSettings &&
                <div className='col-xs-12 no-side-padding' style={{margin: '15px 0'}}>
                  <div className='col-xs-12 no-side-padding'>
                    <DialogContentText style={{fontSize: '14px', marginBottom: '20px', marginTop: '-10px'}}>
                      Caution: changing these settings could yield an incomplete clone (e.g., missing answers or set members).
                    </DialogContentText>
                  </div>
                  <CascadeParametersForm
                    concepts={concepts}
                    fieldClasses='col-xs-6'
                    hiddenFields={['method', 'cascadeHierarchy', 'omitIfExistsIn']}
                    defaultParams={defaultParams}
                    onChange={onParamsChange}
                    toSource={toSource}
                  />
                </div>
            }
          </Collapse>
        </div>
        <div className='col-xs-12 no-side-padding' style={{marginTop: '10px'}}>
          <DialogContentText>
            {`${concepts.length} selected Concept(s) will be cloned into: `} <b>{sourceName}</b>
          </DialogContentText>
        </div>
        <div className='col-xs-12 no-side-padding' style={{marginTop: '10px'}}>
          <ConceptTable toSource={toSource} concepts={concepts} showProgress={isAdding} showStatus={isAdding || result} visualFilters={defaultParams} onPreviewClick={onPreviewClick} />
        </div>

        <div className='col-xs-12 no-side-padding' style={{marginTop: '10px'}}>
          <APIPreview url={requestURL} payload={payload} verb='POST' />
        </div>
      </DialogContent>
      <DialogActions>
        <React.Fragment>
          <Button onClick={onClose} color="secondary" disabled={isAdding}>
            Close
          </Button>
          {
            !result &&
              <Button onClick={onAdd} color="primary" disabled={isAdding}>
                Add
              </Button>
          }
        </React.Fragment>
      </DialogActions>
    </React.Fragment>
  )
}

export default CloneToSourceDialogContent;
