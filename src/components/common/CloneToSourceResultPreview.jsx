import React from 'react'
import {
  CircularProgress, DialogContent,
  Divider
} from '@mui/material'
import Concept from '../concepts/Concept'
import Mapping from '../mappings/Mapping'
import { filter, map, isEmpty } from 'lodash'

const CloneToSourceResultPreview = ({ concept, isLoading}) => {
  const concepts = filter(concept.previewBundle?.entry, {type: 'Concept'})
  const mappings = filter(concept.previewBundle?.entry, {type: 'Mapping'})
  return (
    <DialogContent>
      <div className='col-xs-12 no-side-padding' style={{display: 'flex'}}>
        {
          isLoading ?
            <div className='col-xs-12 flex-vertical-center' style={{justifyContent: 'center'}}>
              <CircularProgress />
            </div> :
          <React.Fragment>
            <div className='col-xs-6' style={{width: 'calc(50%-1px)'}}>
              <h4 style={{margin: '10px 0'}}>{`Concepts (${concepts.length})`}</h4>
              {
                isEmpty(concepts) ?
                  <p>0 concepts</p> :
                  map(concepts, (_concept, index) => (
                    <React.Fragment key={index}>
                      <Concept {..._concept} />
                      <Divider style={{display: 'inline-block', width: '100%'}}/>
                    </React.Fragment>
                  ))
              }
            </div>
            <div className='col-xs-1 no-side-padding' style={{width: '2px'}}>
              <Divider orientation='vertical' style={{}} />
            </div>
            <div className='col-xs-6' style={{width: 'calc(50%-1px)'}}>
              <h4 style={{margin: '10px 0'}}>{`Mappings (${mappings.length})`}</h4>
              {
                isEmpty(mappings) ?
                  <p>0 mappings</p> :
                  map(mappings, (_mapping, index) => (
                    <React.Fragment key={index}>
                      <Mapping {..._mapping} />
                      <Divider style={{display: 'inline-block', width: '100%'}}/>
                    </React.Fragment>
                  ))
              }
            </div>
          </React.Fragment>
        }
      </div>
    </DialogContent>
  )
}

export default CloneToSourceResultPreview;
