import React from 'react';
import { TextField, Button, Autocomplete } from '@mui/material';
import { styled } from '@mui/system';
import { map, find, orderBy } from 'lodash'
import { fetchMapTypes } from '../../common/utils';
import SourceSearchAutocomplete from '../common/SourceSearchAutocomplete';
import ConceptSearchAutocomplete from '../common/ConceptSearchAutocomplete';
import FormTooltip from '../common/FormTooltip';

const GroupHeader = styled('div')({
  position: 'sticky',
  top: '-8px',
  padding: '4px 16px',
  zIndex: 1000,
  backgroundColor: '#f5f5f5',
  fontSize: '12px',
  color: 'rgba(0, 0, 0, 0.6)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
});

const GroupItems = styled('ul')({
  padding: 0,
});

const MappingInlineForm = ({defaultMapType, concept, onClose, onSubmit, isDirect, suggested, sourceVersionSummary}) => {
  const [mapTypes, setMapTypes] = React.useState([])
  const [mapType, setMapType] = React.useState(defaultMapType ? {id: defaultMapType, name: defaultMapType} : '')
  const [source, setSource] = React.useState('')
  const [targetConcept, setTargetConcept] = React.useState('')

  React.useEffect(() => !defaultMapType && fetchMapTypes(data => setMapTypes(formatMapTypes(data))), [])

  const onSourceChange = (id, item) => {
    setSource(item || '')
    setTargetConcept('')
  }

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

  const formatMapTypes = data => {
    let _mapTypes = data.map(d => {
      d.resultType = 'Ordered'
      return d
    })
    if(sourceVersionSummary?.mappings) {
      const usedMapTypes = map(sourceVersionSummary.mappings.map_type, mapType => mapType[0])
      usedMapTypes.forEach(usedMapType => {
        const _mapType = find(_mapTypes, _mapType => {
          const mapId = _mapType.id.toLowerCase().replace('-', '').replace('_', '').replace(' ', '')
          const _usedMapType = usedMapType.toLowerCase().replace('-', '').replace('_', '').replace(' ', '')
          return _usedMapType === mapId
        })
        if(_mapType)
          _mapType.resultType = 'Suggested'
      })
      return orderBy(_mapTypes, ['resultType', 'name'], ['desc', 'asc'])
    }
    return orderBy(_mapTypes, 'name')
  }

  return (
    <form id='mapping-inline-form'>
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
                <li style={{listStyle: 'none'}} key={params.group}>
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
          parentURI={source.url}
          required
          size='small'
          disabled={!source}
          value={targetConcept}
        />
      </div>
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
