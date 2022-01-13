import React from 'react';
import {
  Tooltip, Chip, Menu, MenuItem, TextField,
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material'
import {
  FilterAlt as FilterIcon,
  Cancel as CancelIcon,
  Link as MappingIcon,
  ArrowDropDown as DownIcon
} from '@mui/icons-material'
import { map } from 'lodash';

const LEVEL_OPTIONS = [
  {id: '1', name: '1'},
  {id: '2', name: '2'},
  {id: '3', name: '3'},
  {id: '4', name: '4'},
  {id: '5', name: '5'},
  {id: '*', name: 'All'},
]

const HierarchyTreeFilters = ({filters, onChange, onMapTypesFilterChange}) => {
  const [mapTypes, setMapTypes] = React.useState(filters.mapTypes || '')
  const [excludeMapTypes, setExcludeMapTypes] = React.useState(filters.excludeMapTypes || '')
  const [levelAnchorEl, setLevelAnchorEl] = React.useState(null);
  const [mapTypeAnchorEl, setMapTypeAnchorEl] = React.useState(null);
  const cascadeLevelText = filters.cascadeLevels === '*' ? 'Levels: All' : `Levels: ${filters.cascadeLevels}`
  const toggleLevelAnchor = event => setLevelAnchorEl(levelAnchorEl ? null : event.currentTarget)
  const toggleMapTypeAnchor = event => setMapTypeAnchorEl(mapTypeAnchorEl ? null : event.currentTarget)
  const onLevelChange = newLevel => {
    toggleLevelAnchor()
    onChange('cascadeLevels', newLevel)
  }
  const onMapTypesChange = () => {
    toggleMapTypeAnchor()
    onMapTypesFilterChange({...filters, mapTypes: mapTypes, excludeMapTypes: excludeMapTypes})
  }

  return (
    <span className="flex-vertical-center">
      <Tooltip title={cascadeLevelText} arrow placement='top'>
        <Chip
          color="primary"
          variant="outlined"
          label={cascadeLevelText}
          size="small"
          clickable
          onClick={toggleLevelAnchor}
          onDelete={toggleLevelAnchor}
          deleteIcon={<DownIcon fontSize="inherit" />}
        />
      </Tooltip>
      <Tooltip title={filters.cascadeHierarchy ? 'Remove Hierarchy' : 'Cascade Hierarchy'} arrow placement='top'>
        <Chip
          color={filters.cascadeHierarchy ? "primary" : "default"}
          variant="outlined"
          label="Hierarchy"
          size="small"
          style={filters.cascadeHierarchy ? {marginLeft: '2px'} : { marginLeft: '2px', color: 'rgba(0, 0, 0, 0.5)' }}
          icon={filters.cascadeHierarchy ? <CancelIcon fontSize="inherit" /> : null}
          clickable
          onClick={() => onChange('cascadeHierarchy', !filters.cascadeHierarchy) }
        />
      </Tooltip>
      <Tooltip title={filters.cascadeMappings ? 'Remove Mappings' : 'Cascade Mappings'} arrow placement='top'>
        <Chip
          color={filters.cascadeMappings ? "primary" : "default"}
          variant="outlined"
          label="Mappings"
          size="small"
          style={filters.cascadeMappings ? {marginLeft: '2px'} : { color: 'rgba(0, 0, 0, 0.5)', marginLeft: '2px' }}
          icon={filters.cascadeMappings ? <CancelIcon fontSize="inherit" /> : null}
          clickable
          onClick={() => onChange('cascadeMappings', !filters.cascadeMappings) }
        />
      </Tooltip>
      {
        filters.cascadeMappings &&
        <Tooltip title="Include/Exclude MapTypes" arrow placement='top'>
          <Chip
            color={(filters.mapTypes || filters.excludeMapTypes) ? "primary" : "default"}
            variant="outlined"
            label="MapTypes"
            size="small"
            clickable
            deleteIcon={<FilterIcon />}
            icon={<MappingIcon />}
            onDelete={toggleMapTypeAnchor}
            onClick={toggleMapTypeAnchor}
            style={{marginLeft: '2px'}}
          />
        </Tooltip>
      }
      <Tooltip title={filters.reverse ? 'Cascade Forward/Down' : 'Cascade Backward/Up'} arrow placement='top'>
        <Chip
          color="primary"
          variant="outlined"
          label={filters.reverse ? 'Forward' : 'Backward'}
          size="small"
          style={{marginLeft: '2px'}}
          clickable
          onClick={() => onChange('reverse', !filters.reverse) }
        />
      </Tooltip>
      <Menu
        id="hierarchy-tree-filter-level-menu"
        anchorEl={levelAnchorEl}
        keepMounted
        open={Boolean(levelAnchorEl)}
        onClose={toggleLevelAnchor}
      >
        {
          map(LEVEL_OPTIONS, ({id, name}) => (
            <MenuItem key={id} value={id} onClick={() => onLevelChange(id)} selected={filters.cascadeLevels === id}>
              {name}
            </MenuItem>
          ))
        }
      </Menu>
      <Dialog open={Boolean(mapTypeAnchorEl)} onClose={toggleMapTypeAnchor}>
        <DialogTitle>
          Include/Exclude Map Types from Results
        </DialogTitle>
        <DialogContent style={{minWidth: '400px'}}>
          <div className='col-xs-12 no-side-padding'>
            <div className='col-xs-12 no-side-padding' style={{fontWeight: 'bold', marginBottom: '5px'}}>
              Include MapTypes
            </div>
            <div className='col-xs-12 no-side-padding'>
              <TextField
                fullWidth
                value={mapTypes}
                onChange={event => setMapTypes(event.target.value)}
                placeholder='e.g. SAME-AS,NARROWER-THAN,CONCEPT-SET'
              />
            </div>
          </div>
          <div className='col-xs-12 no-side-padding' style={{marginTop: '15px'}}>
            <div className='col-xs-12 no-side-padding' style={{fontWeight: 'bold', marginBottom: '5px'}}>
              Exclude MapTypes
            </div>
            <div className='col-xs-12 no-side-padding'>
              <TextField
                fullWidth
                value={excludeMapTypes}
                onChange={event => setExcludeMapTypes(event.target.value)}
                placeholder='e.g. SAME-AS,NARROWER-THAN,CONCEPT-SET'
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleMapTypeAnchor} variant='outlined' color='secondary'>
            Close
          </Button>
          <Button onClick={onMapTypesChange} color="primary" variant='outlined'>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </span>
  );
}

export default HierarchyTreeFilters;