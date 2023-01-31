import React from 'react';
import { CASCADE_OPTIONS, DEFAULT_CASCADE_PARAMS } from '../../common/constants';
import {
  TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox
} from '@mui/material';
import { map } from 'lodash'

const CascadeParametersForm = ({onChange, defaultParams, hiddenFields, fieldClasses}) => {
  const [params, setParams] = React.useState(defaultParams || {...DEFAULT_CASCADE_PARAMS})

  const _onChange = (param, value) => {
    let newParams = {...params, [param]: value}
    setParams(newParams)
    onChange(newParams)
  }

  const hidden = hiddenFields || []
  const gridClass = fieldClasses || 'col-xs-12 no-side-padding'

  return (
    <div className='col-xs-12 no-side-padding'>
      {
        !hidden.includes('method') &&
          <div className={gridClass} style={{marginBottom: '10px'}}>
            <FormControl fullWidth>
              <InputLabel>Method</InputLabel>
              <Select
                value={params.method}
                label="Method"
                onChange={event => _onChange('method', event.target.value)}
                size='small'
              >
                {
                  map(CASCADE_OPTIONS.method, method => (
                    <MenuItem size='small' value={method.id} key={method.id}>
                      {`${method.name} (${method.id})`}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </div>
      }
      {
        !hidden.includes('cascadeHierarchy') &&
          <div className={gridClass} style={{marginBottom: '10px'}}>
            <FormControlLabel
              size='small'
              onChange={event => _onChange('cascadeHierarchy', event.target.checked)}
              value={params.cascadeHierarchy}
              control={<Checkbox size='small' checked={params.cascadeHierarchy} />}
              label="Cascade Hierarchy"
              labelPlacement="end"
            />
            <FormControlLabel
              size='small'
              onChange={event => _onChange('cascadeMappings', event.target.checked)}
              value={params.cascadeMappings}
              control={<Checkbox size='small' checked={params.cascadeMappings} />}
              label="Cascade Mappings"
              labelPlacement="end"
            />
            <FormControlLabel
              size='small'
              onChange={event => _onChange('includeRetired', event.target.checked)}
              value={params.includeRetired}
              control={<Checkbox size='small' checked={params.includeRetired} />}
              label="Include Retired"
              labelPlacement="end"
            />
            <FormControlLabel
              size='small'
              onChange={event => _onChange('reverse', event.target.checked)}
              value={params.reverse}
              control={<Checkbox size='small' checked={params.reverse} />}
              label="Cascade Direction Backwards"
              labelPlacement="end"
            />
            <FormControlLabel
              size='small'
              onChange={event => _onChange('view', event.target.checked ? 'hierarchy' : 'flat')}
              value={params.view === 'hierarchy'}
              control={<Checkbox size='small' checked={params.view === 'hierarchy'} />}
              label="Hierarchical Response"
              labelPlacement="end"
            />
          </div>
      }
      <div className={gridClass} style={{marginBottom: '10px'}}>
        <TextField
          fullWidth
          value={params.cascadeLevels}
          label='Cascade Levels'
          onChange={event => _onChange('cascadeLevels', event.target.value)}
          size='small'
          placeholder='e.g. 1, 2, 3...*'
        />
      </div>
      <div className={gridClass} style={{marginBottom: '10px'}}>
        <TextField
          fullWidth
          value={params.mapTypes}
          label='MapTypes'
          onChange={event => _onChange('mapTypes', event.target.value)}
          size='small'
          placeholder='e.g. Q-AND-A,CONCEPT-SET'
        />
      </div>
      <div className={gridClass} style={{marginBottom: '10px'}}>
        <TextField
          fullWidth
          value={params.excludeMapTypes}
          label='ExcludeMapTypes'
          onChange={event => _onChange('excludeMapTypes', event.target.value)}
          size='small'
          placeholder='e.g. Q-AND-A,CONCEPT-SET'
        />
      </div>
      <div className={gridClass} style={{marginBottom: '10px'}}>
        <TextField
          fullWidth
          value={params.returnMapTypes}
          label='ReturnMapTypes'
          onChange={event => _onChange('returnMapTypes', event.target.value)}
          size='small'
        />
      </div>
      {
        !hidden.includes('omitIfExistsIn') &&
          <div className={gridClass} style={{marginBottom: '10px'}}>
            <TextField
              fullWidth
              value={params.omitIfExistsIn}
              label='OmitIfExistsIn'
              onChange={event => _onChange('omitIfExistsIn', event.target.value)}
              size='small'
            />
          </div>
      }
      <div className={gridClass} style={{marginBottom: '10px'}}>
        <TextField
          fullWidth
          value={params.equivalencyMapType}
          label='EquivalencyMapType'
          onChange={event => _onChange('equivalencyMapType', event.target.value)}
          size='small'
          placeholder='e.g. SAME-AS,CONCEPT-SET'
          disabled={!params.omitIfExistsIn}
        />
      </div>
    </div>
  )
}

export default CascadeParametersForm;
