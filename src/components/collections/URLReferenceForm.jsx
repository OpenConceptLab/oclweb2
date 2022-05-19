import React from 'react';
import {
  TextField, IconButton, Button, Tooltip, Autocomplete, Select, MenuItem,
  FormControl, InputLabel, FormControlLabel, Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  UnfoldMore as ExpandIcon,
  UnfoldLess as CollapseIcon,
  Clear as RemoveIcon
} from '@mui/icons-material';
import { map, cloneDeep, merge, last, get, find, compact, omit, forEach } from 'lodash';

const OPERATORS = ['=', 'in']
const REFERENCE_TYPES = ['concepts', 'mappings']
const PROPERTIES = [
  {id: 'concept_class', name: 'conceptClass'},
  {id: 'datatype', name: 'datatype'},
  {id: 'locale', name: 'locale'},
  {id: 'external_id', name: 'external_id'},
  {id: 'q', name: 'q'},
  {id: 'exact_match', name: 'exactMatch'},
]

const ValuesetForm = ({ valueset, onUpdate, onRemove }) => {
  const [value, setValue] = React.useState('')
  const onChange = val => {
    setValue(val || '')
    onUpdate({id: valueset.id, valueset: val || ''})
  }

  return (
    <div className='col-xs-12 no-side-padding flex-vertical-center'>
      <div className='col-xs-11 no-side-padding flex-vertical-center'>
        <TextField
          fullWidth
          id='value'
          value={value}
          onChange={event => onChange(event.target.value)}
          label='Valueset'
          size='small'
          variant='outlined'
        />
      </div>
      <div className='col-xs-1'>
        <IconButton size='small' color='error' onClick={() => onRemove(valueset.id)}>
          <RemoveIcon fontSize='small' />
        </IconButton>
      </div>
    </div>
  )
}

const FilterForm = ({ filter, onUpdate, onRemove, isRequired }) => {
  const [property, setProperty] = React.useState('')
  const [operator, setOperator] = React.useState('=')
  const [value, setValue] = React.useState('')
  const index = filter.id
  const toFilter = extras => (merge({property: property, op: operator, value: value, id: filter.id}, extras || {}))

  const onChange = (func, attr, val, defaultValue='') => {
    func(() => {
      const newUpdate = {}
      newUpdate[attr] = val || defaultValue
      onUpdate(toFilter(newUpdate))
      return val || defaultValue
    })
  }

  return (
    <div className='col-xs-12 no-side-padding flex-vertical-center'>
      <div className='col-xs-5 no-left-padding'>
        <Autocomplete
          openOnFocus
          disablePortal
          value={find(PROPERTIES, {id: property})}
          id={'property-${index}'}
          options={PROPERTIES}
          getOptionLabel={option => option.name || ''}
          fullWidth
          required={isRequired}
          renderInput={params => <TextField {...params} required size='small' label="Property" variant="outlined" fullWidth />}
          onChange={(event, item) => onChange(setProperty, 'property', get(item, 'name', ''), '')}
          size='small'
        />
      </div>
      <div className='col-xs-1 no-left-padding'>
        <FormControl fullWidth>
          <InputLabel id={`op-${index}`}>Operator</InputLabel>
          <Select
            id={`op-${index}`}
            labelId={`op-${index}`}
            value={operator}
            label="Operator"
            onChange={event => onChange(setOperator, 'operator', event.target.value, '')}
            fullWidth
            size='small'
          >
            {
              map(OPERATORS, op => (
                <MenuItem key={op} value={op}>{op}</MenuItem>
              ))
            }
          </Select>
        </FormControl>
      </div>
      <div className='col-xs-5 no-side-padding'>
        <TextField
          fullWidth
          id={`value-${index}`}
          value={value}
          onChange={event => onChange(setValue, 'value', event.target.value, '')}
          label='Value'
          required={isRequired}
          size='small'
          variant='outlined'
        />
      </div>
      <div className='col-xs-1'>
        <IconButton size='small' color='error' onClick={() => onRemove(index)}>
          <RemoveIcon fontSize='small' />
        </IconButton>
      </div>
    </div>
  )
}

const ExpressionForm = ({ expressionObj, onUpdate, onRemove }) => {
  const [expression, setExpression] = React.useState('')
  const [namespace, setNamespace] = React.useState('')
  const [system, setSystem] = React.useState('')
  const [version, setVersion] = React.useState('')
  const [code, setCode] = React.useState('')
  const [resourceVersion, setResourceVersion] = React.useState('')
  const [valueset, setValueset] = React.useState([])
  const [filter, setFilter] = React.useState([])
  const [include, setInclude] = React.useState('')
  const [referenceType, setReferenceType] = React.useState('concepts')
  const [expand, setExpand] = React.useState(false)

  const toExpression = extras => (
    merge(
      {
        id: expressionObj.id,
        expand: expand,
        expression: expression,
        system: system,
        version: version,
        code: code,
        resourceVersion: resourceVersion,
        valueset: valueset,
        filter: filter,
        include: include,
        referenceType: referenceType
      },
      extras || {}
    )
  )

  const onChange = (func, attr, val, defaultValue='') => {
    func(() => {
      const newUpdate = {}
      newUpdate[attr] = val || defaultValue
      onUpdate(toExpression(newUpdate))
      return val || defaultValue
    })
  }

  const onFilterUpdate = newFilter => {
    const listIndex = filter.findIndex(f => f.id === newFilter.id)
    const newFilters = cloneDeep(filter)
    newFilters[listIndex] = newFilter
    setFilter(newFilters)
    onUpdate(toExpression({filter: newFilters}))
  }

  const onRemoveFilter = id => {
    const listIndex = filter.findIndex(f => f.id === id)
    const newFilters = cloneDeep(filter)
    newFilters.splice(listIndex, 1)
    setFilter(newFilters)
    const data = toExpression()
    data.filter = newFilters
    onUpdate(data)
  }


  const onAddFilter = () => {
    const newFilters = [...filter, {id: get(last(filter), 'id', 0) + 1}]
    setFilter(newFilters)
    onUpdate(toExpression({filter: newFilters}))
  }

  const onValuesetUpdate = newValueset => {
    const listIndex = valueset.findIndex(v => v.id === newValueset.id)
    const newValuesets = cloneDeep(valueset)
    newValuesets[listIndex] = newValueset
    setValueset(newValuesets)
    onUpdate(toExpression({valueset: newValuesets}))
  }

  const onRemoveValueset = id => {
    const listIndex = valueset.findIndex(v => v.id === id)
    const newValuesets = cloneDeep(valueset)
    newValuesets.splice(listIndex, 1)
    setValueset(newValuesets)
    const data = toExpression()
    data.valueset = newValuesets
    onUpdate(data)
  }

  const onAddValueset = () => {
    const newValuesets = [...valueset, {id: get(last(valueset), 'id', 0) + 1}]
    setValueset(newValuesets)
    onUpdate(toExpression({valueset: newValuesets}))
  }

  const onCodeChange = value => {
    setCode(value)
    const data = toExpression()
    data.code = value
    if(value) {
      data.filter = []
      setFilter([])
    }
    onUpdate(data)
  }

  return (
    <div className='col-xs-12 no-side-padding'>
      <div className='col-xs-12 no-side-padding'>
        <fieldset id={`expression-container-`} style={{border: `1px solid rgba(0, 0, 0, 0.3)`, width: '100%', borderRadius: '4px'}}>
          <legend style={{color: 'rgba(0, 0, 0, 0.6)'}}>
            <Tooltip arrow title={expand ? 'Collapse' : 'Expand'}>
              <IconButton
                size='small'
                variant={expand ? 'contained' : 'outlined'}
                color='primary'
                onClick={() => setExpand(!expand)}>
                {
                  expand ? <CollapseIcon size='small' /> : <ExpandIcon size='small' />
                }
              </IconButton>
            </Tooltip>
            {
              onRemove &&
                <Tooltip arrow title='Remove'>
                  <IconButton
                    size='small'
                    label='remove'
                    color='error'
                    variant='outlined'
                    onClick={() => onRemove(expressionObj.id)}>
                    <RemoveIcon size='small' />
                  </IconButton>
                </Tooltip>
            }
          </legend>
          <div className='col-xs-12 no-side-padding' style={{margin: '10px 0'}}>
            {
              !expand &&
                <TextField
                  id={`expression-${expressionObj.id}`}
                  label="Expression"
                  placeholder="e.g. /orgs/WHO/sources/ICD-10/concepts/A15.0/"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={event => onChange(setExpression, 'expression', event.target.value, '')}
                  value={expression}
                  size='small'
                  disabled={expand}
                />
            }
            {
              expand &&
                <React.Fragment>
                  <div className='col-xs-12 no-side-padding'>
                    <TextField
                      id={`namespace-${expressionObj.id}`}
                      label="Namespace"
                      placeholder="e.g. /orgs/WHO/"
                      variant="outlined"
                      fullWidth
                      onChange={event => onChange(setNamespace, 'namespace', event.target.value, '')}
                      value={namespace}
                      size='small'
                    />
                  </div>
                  <div className='col-xs-9 no-left-padding' style={{marginTop: '10px'}}>
                    <TextField
                      id={`system-${expressionObj.id}`}
                      label="System"
                      placeholder="e.g. /orgs/WHO/sources/ICD-10/"
                      variant="outlined"
                      fullWidth
                      required={compact(map(valueset, 'valueset')).length === 0}
                      onChange={event => onChange(setSystem, 'system', event.target.value, '')}
                      value={system}
                      size='small'
                    />
                  </div>
                  <div className='col-xs-3 no-side-padding' style={{marginTop: '10px'}}>
                    <TextField
                      id={`version-${expressionObj.id}`}
                      label="Version"
                      placeholder="e.g. v2019"
                      variant="outlined"
                      fullWidth
                      onChange={event => onChange(setVersion, 'version', event.target.value, '')}
                      value={version}
                      size='small'
                      disabled={!system}
                    />
                  </div>
                  <div className='col-xs-9 no-left-padding' style={{marginTop: '10px'}}>
                    <TextField
                      id={`code-${expressionObj.id}`}
                      label="Code"
                      placeholder="e.g. A15.0"
                      variant="outlined"
                      fullWidth
                      onChange={event => onCodeChange(event.target.value || '')}
                      value={code}
                      size='small'
                    />
                  </div>
                  <div className='col-xs-3 no-side-padding' style={{marginTop: '10px'}}>
                    <TextField
                      id={`resourceVersion-${expressionObj.id}`}
                      label="Resource Version"
                      placeholder="e.g. 19485"
                      variant="outlined"
                      fullWidth
                      onChange={event => onChange(setResourceVersion, 'resourceVersion', event.target.value, '')}
                      value={resourceVersion}
                      size='small'
                      disabled={!code}
                    />
                  </div>
                  <div className='col-xs-12 no-side-padding' style={{marginTop: '10px'}}>
                    <div className='col-xs-3 no-left-padding'>
                      <FormControl fullWidth>
                        <InputLabel id={`referenceType-${expressionObj.id}`}>ReferenceType</InputLabel>
                        <Select
                          id={`referenceType-${expressionObj.id}`}
                          labelId={`referenceType-${expressionObj.id}`}
                          value={referenceType}
                          label="ReferenceType"
                          onChange={event => onChange(setReferenceType, 'referenceType', event.target.value, 'concepts')}
                          fullWidth
                          size='small'
                        >
                          {
                            map(REFERENCE_TYPES, op => (
                              <MenuItem key={op} value={op}>{op}</MenuItem>
                            ))
                          }
                        </Select>
                      </FormControl>
                    </div>
                    <div className='col-xs-3 no-left-padding'>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size='small'
                            defaultChecked
                            onChange={
                              event => onChange(setInclude, 'include', event.target.checked, event.target.checked)} />
                        }
                        label="Include"
                      />
                    </div>
                  </div>
                  <div className='col-xs-12' style={{marginTop: '10px'}}>
                    <label>
                      <span><b>Filter</b></span>
                      <IconButton disabled={Boolean(code)} size='small' onClick={onAddFilter} color='primary'>
                        <AddIcon fontSize='small'/>
                      </IconButton>
                    </label>
                    {
                      map(filter, _filter => (
                        <div className='col-xs-12' style={{marginTop: '10px'}} key={_filter.id}>
                          <FilterForm isRequired={!code} filter={_filter} onUpdate={onFilterUpdate} onRemove={onRemoveFilter} />
                        </div>
                      ))
                    }
                  </div>
                  <div className='col-xs-12' style={{marginTop: '10px'}}>
                    <label>
                      <span><b>Valueset</b></span>
                      <IconButton size='small' onClick={onAddValueset} color='primary'>
                        <AddIcon fontSize='small'/>
                      </IconButton>
                    </label>
                    {
                      map(valueset, _valueset => (
                        <div className='col-xs-12' style={{marginTop: '10px'}} key={_valueset.id}>
                          <ValuesetForm valueset={_valueset} onUpdate={onValuesetUpdate} onRemove={onRemoveValueset} />
                        </div>
                      ))
                    }
                  </div>

                </React.Fragment>
            }
          </div>
        </fieldset>
      </div>
    </div>
  )
}


const URLReferenceForm = ({ onChange }) => {
  const [expressions, setExpressions] = React.useState([{id: 0}])

  const onRemove = id => {
    const listIndex = expressions.findIndex(e => e.id === id)
    const _expressions = cloneDeep(expressions)
    _expressions.splice(listIndex, 1)
    setExpressions(_expressions)
    onChange(formatExpressions(_expressions))
  }

  const onUpdate = expression => {
    const listIndex = expressions.findIndex(e => e.id === expression.id)
    const _expressions = cloneDeep(expressions)
    _expressions[listIndex] = expression
    setExpressions(_expressions)
    onChange(formatExpressions(_expressions))
  }

  const onAdd = () => {
    setExpressions([...expressions, {id: last(expressions).id + 1}])
  }

  const formatExpressions = _expressions => {
    const formatted = []
    forEach(_expressions, expression => {
      if(expression.expand) {
        formatted.push({
          namespace: expression.namespace,
          system: expression.system,
          version: expression.version,
          code: expression.code,
          resource_version: expression.resourceVersion,
          valueset: compact(map(expression.valueset, 'valueset')),
          filter: compact(map(expression.filter, _filter => omit(_filter, 'id'))),
          include: expression.include,
          reference_type: expression.referenceType
        })
      } else {
        formatted.push({expression: expression.expression})
      }
    })
    return formatted
  }


  return (
    <div className='col-xs-12 no-side-padding'>
      <div className='col-md-12 no-side-padding' style={{marginTop: '15px'}}>
        <Button onClick={onAdd} startIcon={<AddIcon />} variant='text'>Expression</Button>
      </div>
      {
        map(expressions, expression => {
          return (
            <div className='col-xs-12 no-side-padding' key={expression.id} style={{marginTop: '15px'}}>
              <ExpressionForm
                expressionObj={expression}
                onUpdate={onUpdate}
                onRemove={expressions.length > 1 ? onRemove : false}
              />
            </div>
          );
        })
      }
    </div>
  );
}

export default URLReferenceForm;
