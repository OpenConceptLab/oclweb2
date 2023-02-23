import React from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { find, uniqBy, filter, map, compact, reject, isString, isObject, isArray } from 'lodash'
import APIService from '../../services/APIService'
import { ALL } from '../../common/constants'

const SourceMapTypeDropdown = ({value, size, placeholder, sources, label, onChange, includeAll, includeSameAs, ...rest}) => {
  const [open, setOpen] = React.useState(false);
  const [isFetched, setIsFetched] = React.useState([])
  const [mapTypes, setMapTypes] = React.useState([])
  const isALLSelected = value === ALL
  const loading = open && isFetched.length !== sources.length && !isALLSelected;
  const ALL_OPTION = {id: ALL, name: 'ALL'}
  const SAME_AS_OPTION = {id: 'SAME-AS', name: 'SAME-AS'}

  React.useEffect(() => {
    let active = true;

    if (!loading)
      return undefined;

    (async () => {
      if (active && !isALLSelected) {
        fetchMapTypes();
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  const fetchMapTypes = () => {
    sources.forEach(async source => {
      if(!open)
        return
      APIService
        .new()
        .overrideURL(source.url)
        .appendToUrl('summary/')
        .get(null, null, {verbose: true, distribution: 'map_type'})
        .then(response => {
          setIsFetched([...isFetched, source.url])
          setMapTypes(
            uniqBy(addDefaultOptions([
              ...mapTypes,
              ...map(
                response.data.distribution.map_type,
                map_type => ({id: map_type.map_type, name: map_type.map_type})
              )
            ]), 'id')
          )
        })
    })
  }

  const addDefaultOptions = _mapTypes => {
    _mapTypes = reject(_mapTypes, {id: ALL})
    if(includeSameAs)
      _mapTypes = [..._mapTypes, SAME_AS_OPTION]
    if(includeAll || isALLSelected)
      _mapTypes = [..._mapTypes, ALL_OPTION]

    return uniqBy(_mapTypes, 'id')
  }

  React.useEffect(() => {
    if(value) {
      const selectedMapTypes = isALLSelected ? [] : value.split(',')
      let _mapTypes = uniqBy(
        [
          ...mapTypes,
          ...compact(selectedMapTypes).map(map_type => ({id: map_type, name: map_type})),
        ],
        'id'
      )
      setMapTypes(addDefaultOptions(_mapTypes))
    }

  }, [value])

  const getSelected = () => {
    return rest.multiple ? filter(mapTypes, mapType => compact(value.split(',')).includes(mapType.id)) : find(mapTypes, {id: value})
  }

  const getValueInString = val => {
    if(isArray(val)) {
      if(find(val, {id: ALL}) && val.length > 1)
        val = reject(val, {id: ALL})
      return map(val, _val => isString(_val) ? _val : _val.id).join(',')
    } else if (isObject(val)) {
      return val?.id
    }
    return val
  }

  const _onChange = (event, val) => onChange(getValueInString(val))

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      loading={loading}
      options={mapTypes}
      value={getSelected()}
      getOptionLabel={option => option.name || ''}
      size={size || 'medium'}
      renderInput={
        params => <TextField
                    {...params}
                    placeholder={placeholder}
                    size={size || 'medium'}
                    label={label}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
      }
      onChange={_onChange}
      {...rest}
    />
  )
}

export default SourceMapTypeDropdown;
