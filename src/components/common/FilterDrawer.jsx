import React from 'react';
import {
  Drawer, List, ListItem, ListItemText, ListItemIcon, InputBase, IconButton,
  Checkbox, Typography, Button, Tooltip, Divider
} from '@material-ui/core';
import {
  Clear as ClearIcon,
  Search as SearchIcon
} from '@material-ui/icons';
import {
  set, get, map, startCase, omitBy, omit, isEmpty, cloneDeep, forEach, filter, has, includes,
  isObject
} from 'lodash';

const FilterDrawer = props => {
  const [input, setInput] = React.useState('');
  const { kwargs, open, filters, onClose, onApply, facetOrder, resource } = props;
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

  const [searchStr, setSearchStr] = React.useState(null);
  const [searchedFilters, setSearchedFilters] = React.useState({});
  const [appliedFilters, setFilters] = React.useState(existingFilters);

  const onApplyClick = () => {
    const filters = cloneDeep(appliedFilters)
    if(filters.collection_membership) {
      filters['collection'] = filters.collection_membership
      delete filters.collection_membership
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

  const handleInputChange = event => setInput(event.target.value || '')

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
      else if (map(value, '0').some(v => v.search(searchCr) > -1))
        result[key] = value
    })

    return result
  }

  const getFilters = () => (isEmpty(searchedFilters) && isEmpty(searchStr)) ? uiFilters : searchedFilters;

  const onSearchClear = () => {
    setInput('')
    setSearchStr(null)
  }

  const handleKeyPress = event => {
    if (event.key === 'Enter')
      onSearch(event)
  }

  const formattedName = name => {
    if(name) {
      name = name.trim()
      if(name === 'n/a')
        return name.toUpperCase()
      return startCase(name)
    }
    return 'None';
  }

  return (
    <Drawer anchor='left' open={open} onClose={onClose}>
      <div className='col-md-12 no-side-padding' style={{width: '350px', height: 'calc(100% - 60px)', overflow: 'auto'}}>
        <div className="col-md-12" style={{padding: '0 5px', margin: '5px 0', marginBottom: '0px'}}>
          <div className='col-sm-12 no-side-padding' style={{padding: '5px', display: 'flex', alignItems: 'center', border: '1px solid darkgray', borderRadius: '4px', height: '40px'}}>
            <InputBase
              style={{flex: 1, marginLeft: '10px'}}
              placeholder="Search Filters"
              inputProps={{ 'aria-label': 'search ocl' }}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
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
                >
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
              >
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
                      <ListItem className="flex-vertical-start" style={{padding: '0px 16px 0px 6px'}} key={facet[0]}>
                        <ListItemIcon style={{minWidth: 'auto'}}>
                          <Checkbox checked={isChecked} size='small' onChange={event => onCheckboxChange(event, field, facet)} style={{padding: '0px 9px'}} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <span className='col-md-12 no-side-padding flex-vertical-center'>
                              <span
              onClick={() => onCheckboxChange({target: {checked: !isChecked}}, field, facet)} className='col-md-9 no-left-padding' style={{textAlign: 'left', cursor: 'pointer', fontSize: '14px'}}>
                                {includes(['locale', 'version'], field) ? facet[0] : formattedName(facet[0])}
                              </span>
                              <span className='col-md-3 no-right-padding' style={{textAlign: 'right', fontSize: '14px', color: 'rgb(0, 0, 0, 0.8)', fontWeight: '100'}}>
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
      <div className='col-md-12 no-side-padding bottom-fixed-center' style={{height: '60px', width: '350px'}}>
        <Button onClick={onApplyClick} variant='contained' color='primary' style={{margin: 'auto 5px'}}>
          Apply
        </Button>
        <Button onClick={onClear} variant='contained' color='secondary' style={{margin: 'auto 5px'}}>
          Clear
        </Button>
        <Button onClick={onClose} variant='contained' color='default' style={{margin: 'auto 5px'}}>
          Close
        </Button>
      </div>
    </Drawer>
  );
}

export default FilterDrawer;
