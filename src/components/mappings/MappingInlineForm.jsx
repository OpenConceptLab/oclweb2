import React from 'react';
import { TextField, Button, Autocomplete } from '@mui/material';
import { fetchMapTypes, sortValuesBySourceSummary } from '../../common/utils';
import SourceSearchAutocomplete from '../common/SourceSearchAutocomplete';
import ConceptSearchAutocomplete from '../common/ConceptSearchAutocomplete';
import FormTooltip from '../common/FormTooltip';
import GroupHeader from '../common/GroupHeader';
import GroupItems from '../common/GroupItems';

const MappingInlineForm = ({defaultMapType, concept, onClose, onSubmit, isDirect, suggested, sourceVersionSummary}) => {
  const [mapTypes, setMapTypes] = React.useState([])
  const [mapType, setMapType] = React.useState(defaultMapType ? {id: defaultMapType, name: defaultMapType} : '')
  const [source, setSource] = React.useState('')
  const [targetConcept, setTargetConcept] = React.useState('')
  const [targetConceptCode, setTargetConceptCode] = React.useState('')
  const [targetConceptName, setTargetConceptName] = React.useState('')

  React.useEffect(() => !defaultMapType && fetchMapTypes(data => setMapTypes(sortValuesBySourceSummary(data, sourceVersionSummary, 'mappings.map_type'))), [])
  React.useEffect(() => setMapTypes(sortValuesBySourceSummary(mapTypes, sourceVersionSummary, 'mappings.map_type')), [sourceVersionSummary])

  const onSourceChange = (id, item) => {
    setSource(item || '')
    setTargetConcept('')
  }

  const onConceptChange = (id, item) => setTargetConcept(item || '')
  const onConceptCodeChange = (id, val) => setTargetConceptCode(val || '')
  const shouldShowTargetConceptName = () => Boolean(targetConcept?.url ? targetConcept.id !== targetConceptCode : targetConceptCode)

  const getPayload = () => {
    let payload = {}
    const unknownConcept = shouldShowTargetConceptName()
    if(isDirect) {
      payload = {from_concept_url: concept.url, map_type: mapType.id}
      if(unknownConcept) {
        payload['to_source_url'] = source.url
        payload['to_concept_code'] = targetConceptCode
        payload['to_concept_name'] = targetConceptName
      } else {
        payload['to_concept_url'] = targetConcept?.url
      }
    } else {
      payload = {to_concept_url: concept.url, map_type: mapType.id}
      if(unknownConcept) {
        payload['from_source_url'] = source.url
        payload['from_concept_code'] = targetConceptCode
        payload['from_concept_name'] = targetConceptName
      } else {
        payload['from_concept_url'] = targetConcept?.url
      }
    }

    return payload
  }

  const _onSubmit = () => {
    const form = document.getElementById('mapping-inline-form')
    const isValid = form.reportValidity()
    if(isValid) {
      onSubmit(getPayload(), targetConcept, isDirect)
    }
  }

  return (
    <form id='mapping-inline-form' style={{display: 'inline-block'}}>
      <div className='col-xs-12' style={{marginBottom: '15px', padding: defaultMapType ? '0 8px 0 0' : '0 8px'}}>
        <h3 style={{margin: '15px 0 0 0', display: 'flex'}}>
          Add a mapping
          <FormTooltip
            size='small'
            title={`Create a new mapping that will be saved to ${concept.source}`}
            style={{marginLeft: '10px'}}
          />
        </h3>
      {
        !defaultMapType &&
          <div className='col-xs-12 no-side-padding flex-vertical-center' style={{marginTop: '15px'}}>
            <Autocomplete
              openOnFocus
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              value={mapType}
              id="mapType"
              size='small'
              options={mapTypes}
              groupBy={option => option.resultType}
              renderGroup={params => (
                <li style={{listStyle: 'none'}} key={params.group || 'none'}>
                  <GroupHeader>{params.group}</GroupHeader>
                  <GroupItems>{params.children}</GroupItems>
                </li>
              )}
              getOptionLabel={option => option.name || ''}
              fullWidth
              required={!defaultMapType}
              renderInput={
                params => <TextField
                            {...params}
                            required
                            label="Relationship Type"
                            variant="outlined"
                            fullWidth
                          />
              }
              onChange={(event, item) => setMapType(item)}
            />
            <FormTooltip
              title="Defines the relationship between the two concepts. For example, “Concept A is the SAME-AS Concept B”, where Concept A is the “from concept” and Concept B is the “target concept”."
              style={{marginLeft: '10px'}}
            />
          </div>
      }
      <div className='col-xs-12 no-side-padding' style={{marginTop: '15px'}}>
        <SourceSearchAutocomplete
          onChange={onSourceChange}
          required
          size='small'
          suggested={suggested}
        />
      </div>
      <div className='col-xs-12 no-side-padding' style={{marginTop: '15px'}}>
        <ConceptSearchAutocomplete
          onChange={onConceptChange}
          onInputChange={onConceptCodeChange}
          parentURI={source.url}
          required
          size='small'
          disabled={!source}
          value={targetConcept}
          freeSolo
        />
      </div>
        {
          shouldShowTargetConceptName() &&
            <div className='col-xs-12 no-side-padding' style={{marginTop: '15px'}}>
              <TextField
                onChange={event => setTargetConceptName(event.target.value || '')}
                size='small'
                fullWidth
                label='Name'
              />
            </div>

        }
      <div className='col-xs-12 no-side-padding' style={{marginTop: '15px'}}>
        <Button color='primary' size='small' variant='contained' style={{marginRight: '16px'}} onClick={_onSubmit}>
          Save
        </Button>
        <Button variant='text' size='small' color='secondary' onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
      </form>
  )
}

export default MappingInlineForm;
