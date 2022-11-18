import React from 'react';
import { TextField, Button, Autocomplete } from '@mui/material';
import { fetchMapTypes } from '../../common/utils';
import SourceSearchAutocomplete from '../common/SourceSearchAutocomplete';
import ConceptSearchAutocomplete from '../common/ConceptSearchAutocomplete';

const MappingInlineForm = ({defaultMapType, concept, onClose, onSubmit, isDirect}) => {
  const [mapTypes, setMapTypes] = React.useState([])
  const [mapType, setMapType] = React.useState(defaultMapType ? {id: defaultMapType, name: defaultMapType} : '')
  const [source, setSource] = React.useState('')
  const [targetConcept, setTargetConcept] = React.useState('')

  React.useEffect(() => !defaultMapType && fetchMapTypes(data => setMapTypes(data)), [])

  const onSourceChange = (id, item) => setSource(item || '')

  const onConceptChange = (id, item) => setTargetConcept(item || '')

  const getPayload = () => {
    if(isDirect)
      return {from_concept_url: concept.url, map_type: mapType.id, to_concept_url: targetConcept.url}
    return {to_concept_url: concept.url, map_type: mapType.id, from_concept_url: targetConcept.url}
  }

  const _onSubmit = () => {
    const form = document.getElementById('mapping-inline-form')
    const isValid = form.reportValidity()
    if(isValid) {
      onSubmit(getPayload(), targetConcept, isDirect)
    }
  }

  return (
    <form id='mapping-inline-form'>
      <div className='col-xs-12' style={{marginBottom: '15px', padding: defaultMapType ? '0 8px 0 0' : '0 8px'}}>
        <h3 style={{margin: '15px 0 0 0'}}>Add a mapping</h3>
      {
        !defaultMapType &&
          <div className='col-xs-12 no-side-padding' style={{marginTop: '15px'}}>
            <Autocomplete
              openOnFocus
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              value={mapType}
              id="mapType"
              size='small'
              options={mapTypes}
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
          </div>
      }
      <div className='col-xs-12 no-side-padding' style={{marginTop: '15px'}}>
        <SourceSearchAutocomplete
          onChange={onSourceChange}
          required
          size='small'
        />
      </div>
      <div className='col-xs-12 no-side-padding' style={{marginTop: '15px'}}>
        <ConceptSearchAutocomplete
          onChange={onConceptChange}
          parentURI={source.url}
          required
          size='small'
          disabled={!source}
        />
      </div>
      <div className='col-xs-12 no-side-padding' style={{marginTop: '15px'}}>
        <Button color='primary' size='small' variant='contained' style={{marginRight: '16px'}} onClick={_onSubmit}>
          Save
        </Button>
        <Button variant='text' size='small' color='secondary' onClick={onClose}>
          Remove
        </Button>
      </div>
    </div>
      </form>
  )
}

export default MappingInlineForm;
