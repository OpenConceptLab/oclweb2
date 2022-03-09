import React from 'react';
import {
  Drawer, List, ListItem, ListItemText, ListItemIcon, InputBase, IconButton,
  Checkbox, Typography, Button, Tooltip, Divider
} from '@mui/material';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
  CancelOutlined as CancelIcon,
} from '@mui/icons-material';
import {
  set, get, map, startCase, omitBy, omit, isEmpty, cloneDeep, forEach, filter, has, includes,
  isObject, merge, isArray
} from 'lodash';

const FilterDrawer = props => {
  const [input, setInput] = React.useState('');
  const { kwargs, open, filters, onClose, onApply, facetOrder, resource, appliedFacets } = props;
  let blacklisted = ['is_active', 'is_latest_version'];
  const isSourceChild = includes(['concepts', 'mappings'], resource)
  const hasValidKwargs = !isEmpty(kwargs) && isObject(kwargs);
  if(hasValidKwargs) {
    if(kwargs.user || kwargs.org)
      blacklisted = [...blacklisted, 'owner', 'ownerType']
    if(kwargs.source)
      blacklisted = [...blacklisted, 'source']
    if(kwargs.collection)
      blacklisted = [...blacklisted, 'collection']
    if(isSourceChild)
      blacklisted = [...blacklisted, 'concept', 'conceptOwner', 'conceptOwnerType', 'conceptSource']
  }

  let uiFilters = omit(omitBy(filters, isEmpty), blacklisted)

  if(isObject(kwargs) && !kwargs.collection && isSourceChild && !isEmpty(uiFilters) && !isEmpty(uiFilters.collection)){
    uiFilters['collection_membership'] = uiFilters.collection
    delete uiFilters.collection
  }

  if(has(uiFilters, 'experimental'))
    uiFilters.experimental = [[(uiFilters.experimental[0][0] === 1).toString(), uiFilters.experimental[0][1], uiFilters.experimental[0][2]]]

  if(!isEmpty(facetOrder) && !isEmpty(uiFilters)) {
    const orderedUIFilters = {}
    forEach(facetOrder, attr => {
      if(has(uiFilters, attr))
        orderedUIFilters[attr] = uiFilters[attr]
    })
    uiFilters = orderedUIFilters
  }

  const existingFilters = () => {
    let result = {}
    forEach(filters, (values, field) => {
      const applied = filter(values, v => v[2])
      if(applied)
        forEach(applied, facet => set(result, `${field}.${facet[0]}`, true))
    })

    return result
  }

  const getAppliedFilters = () => merge(existingFilters, omit(appliedFacets || {}, 'includeRetired'))

  const [searchStr, setSearchStr] = React.useState(null);
  const [searchedFilters, setSearchedFilters] = React.useState({});
  const [appliedFilters, setFilters] = React.useState(getAppliedFilters());

  React.useEffect(
    () => setFilters(getAppliedFilters), [appliedFacets]
  )

  const onApplyClick = () => {
    const filters = cloneDeep(appliedFilters)
    if(filters.collection_membership) {
      filters['collection'] = filters.collection_membership
      delete filters.collection_membership
    }
    if(filters.retired && filters.retired.true && filters.retired.false) {
      filters.includeRetired = {'true': true}
    }
    onApply(filters)
    onClose()
  }

  const onClear = () => {
    setFilters({})
    onApply({})
    onClose()
  }

  const onCheckboxChange = (event, field, facet) => {
    const newFilters = cloneDeep(appliedFilters)
    if(event.target.checked) {
      set(newFilters, `${field}.${facet[0]}`, true)
      setFilters(newFilters)
    }
    else {
      setFilters(omitBy(omit(newFilters, `${field}.${facet[0]}`), isEmpty))
    }
  }

  const handleInputChange = event => {
    event.persist()
    setInput(event.target.value || '')
    setSearchStr(event.target.value || null)
  }

  const onSearch = event => {
    event.preventDefault()
    event.stopPropagation()

    setSearchStr(() => (input || null))
  }

  React.useEffect(() => setSearchedFilters(searchStr ? getSearchedFilters() : {}), [searchStr]);

  const getSearchedFilters = () => {
    let val = searchStr
    if(!val || isEmpty(uiFilters))
      return uiFilters;

    let result = {};


    const searchCr = new RegExp(val, 'i')

    forEach(uiFilters, (value, key) => {
      if(key.search(searchCr) > -1)
        result[key] = value
      else {
        let values = isArray(value) ? value : [value]
        forEach(values, _value => {
          if(_value[0].search(searchCr) > -1) {
            result[key] = result[key] || []
            result[key].push(_value)
          }
        })
      }
    })

    return result
  }

  const getFilters = () => (isEmpty(searchedFilters) && isEmpty(searchStr)) ? uiFilters : searchedFilters;

  const onSearchClear = () => {
    setInput('')
    setSearchStr(null)
  }

  const formattedName = (field, name) => {
    if(includes(['locale', 'version'], field))
      return name
    if(includes(['owner', 'source', 'collection', 'collection_membership'], field))
      return name.replaceAll('_', '-').toUpperCase()
    if(name) {
      name = name.trim()
      if(name === 'n/a')
        return name.toUpperCase()
      return startCase(name)
    }
    return 'None';
  }

  return (
    <Drawer variant="persistent" style={{zIndex: 1202}} anchor='left' open={open} onClose={onClose} classes={{paper: 'custom-drawer width-15'}}>
      <div id="filters-drawer" className='col-md-12 no-side-padding' style={{height: 'calc(100% - 60px)', overflow: 'auto'}}>
        <span style={{margin: '10px 10px 0 10px', display: 'block'}}>
          <h3 style={{margin: '0', width: '60%', display: 'inline-block'}}>Filters</h3>
          <IconButton size='small' color='secondary' onClick={onClose} style={{float: 'right'}}>
            <CancelIcon fontSize='inherit' />
          </IconButton>
        </span>
        <div className="col-md-12" style={{padding: '0 5px', margin: '5px 0', marginBottom: '0px'}}>
          <div className='col-sm-12 no-side-padding' style={{padding: '5px', display: 'flex', alignItems: 'center', border: '1px solid darkgray', borderRadius: '4px', height: '40px'}}>
            <InputBase
              style={{flex: 1, marginLeft: '10px'}}
              placeholder="Search Filters"
              inputProps={{ 'aria-label': 'search ocl' }}
              value={input}
              onChange={handleInputChange}
              size="small"
              fullWidth
            />
            {
              input &&
              <Tooltip arrow title='Clear'>
                <IconButton
                  type="submit"
                  style={{padding: '10px'}}
                  aria-label="clear"
                  onClick={onSearchClear}
                  size="large">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            }
            <Tooltip arrow title='Search'>
              <IconButton
                type="submit"
                style={{padding: '10px'}}
                aria-label="search"
                onClick={onSearch}
                size="large">
                <SearchIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <List className="col-md-12 no-side-padding">
          {
            map(getFilters(), (facets, field) => (
              <div key={field}>
                <Typography style={{padding: '0 10px 0', fontWeight: 'bold'}}>
                  {startCase(field)}
                </Typography>
                {
                  map(facets, facet => {
                    const isChecked = get(appliedFilters, `${field}.${facet[0]}`, false);
                    return (
                      <ListItem className="flex-vertical-start" style={{padding: '0px 4px 0px 4px'}} key={facet[0]}>
                        <ListItemIcon style={{minWidth: 'auto'}}>
                          <Checkbox checked={isChecked} size='small' onChange={event => onCheckboxChange(event, field, facet)} style={{padding: '0px 9px'}} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <span className='col-md-12 no-side-padding flex-vertical-center'>
                              <span
              onClick={() => onCheckboxChange({target: {checked: !isChecked}}, field, facet)} className='col-md-9 no-left-padding' style={{textAlign: 'left', cursor: 'pointer', fontSize: '12px'}}>
                                {formattedName(field, facet[0])}
                              </span>
                              <span className='col-md-3 no-right-padding' style={{textAlign: 'right', fontSize: '12px', color: 'rgb(0, 0, 0, 0.8)', fontWeight: '100'}}>
                                {facet[1].toLocaleString()}
                              </span>
                            </span>
                          }
                          style={{margin: 0}}
                        />
                      </ListItem>
                    )
                  })
                }
                <Divider style={{margin: '8px 5px 5px'}} />
              </div>
            ))
          }
        </List>
      </div>
      <div className='col-md-12 no-side-padding bottom-fixed-center flex-vertical-center' style={{height: '60px', width: '15%', borderRight: '1px solid lightgray', justifyContent: 'center'}}>
        <Button size="small" onClick={onClear} variant='outlined' color='secondary' style={{margin: 'auto 5px'}}>
          Clear
        </Button>
        <Button size="small" onClick={onApplyClick} variant='contained' color='primary' style={{margin: 'auto 5px'}}>
          Apply
        </Button>
      </div>
    </Drawer>
  );
}

export default FilterDrawer;
