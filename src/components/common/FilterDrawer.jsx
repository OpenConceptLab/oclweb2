import React from 'react';
import {
  Drawer, Divider, List, ListItem, ListItemText, ListItemIcon,
  Checkbox, Typography, Button,
} from '@material-ui/core';
import {
  set, get, map, startCase, omitBy, omit, isEmpty, cloneDeep, forEach, filter
} from 'lodash';

const FilterDrawer = props => {
  const { open, filters, onClose, onApply, defaultIncludeRetired } = props;
  const uiFilters = omit(omitBy(filters, isEmpty), ['is_active', 'is_latest_version'])

  const existingFilters = () => {
    let result = {}
    forEach(filters, (values, field) => {
      const applied = filter(values, v => v[2])
      if(applied)
        forEach(applied, facet => set(result, `${field}.${facet[0]}`, true))
    })

    return result
  }

  const [appliedFilters, setFilters] = React.useState(existingFilters());
  const [includeRetired, setIncludeRetired] = React.useState(defaultIncludeRetired);

  const onApplyClick = () => {
    const filters = cloneDeep(appliedFilters);
    if(includeRetired)
      filters['includeRetired'] = {'true': true}

    onApply(filters)
    onClose()
  }

  const onClear = () => {
    setFilters({})
    setIncludeRetired(false)
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

  const isChecked = (field, facet) => {
    return get(appliedFilters, `${field}.${facet}`, false);
  }

  return (
    <Drawer anchor='left' open={open} onClose={onClose}>
      <div className='col-md-12 no-side-padding' style={{width: '500px', height: 'calc(100% - 60px)', overflow: 'scroll'}}>
        <List>
          <Typography style={{padding: '5px 10px 0px 10px', fontWeight: 'bold'}}>
            General
          </Typography>
          <ListItem style={{padding: '0px 16px 0px 6px'}}>
            <ListItemIcon>
              <Checkbox checked={includeRetired} onChange={event => setIncludeRetired(event.target.checked)}/>
            </ListItemIcon>
            <ListItemText primary='Include Retired' />
          </ListItem>
          <Divider />
          {
            map(uiFilters, (facets, field) => (
              <div key={field}>
                <Typography style={{padding: '10px 10px 0px 10px', fontWeight: 'bold'}}>
                  {startCase(field)}
                </Typography>
                {
                  map(facets, facet => (
                    <ListItem style={{padding: '0px 16px 0px 6px'}} key={facet[0]}>
                      <ListItemIcon>
                        <Checkbox checked={isChecked(field, facet[0])} size='small' onChange={event => onCheckboxChange(event, field, facet)}/>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <span className='col-md-12 no-side-padding'>
                            <span className='col-md-9 no-left-padding' style={{textAlign: 'left'}}>{facet[0] || 'None'}</span>
                            <span className='col-md-3 no-right-padding' style={{textAlign: 'right'}}>{facet[1]}</span>
                          </span>
                        }
                      />
                    </ListItem>
                  ))
                }
                <Divider />
              </div>
            ))
          }
        </List>
      </div>
      <div className='col-md-12 no-side-padding bottom-fixed-center' style={{height: '60px', width: '500px'}}>
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
