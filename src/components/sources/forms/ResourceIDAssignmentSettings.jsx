import React from 'react';
import {
  Select, ListItemText, MenuItem, FormControl, TextField
} from '@mui/material';
import { merge, includes } from 'lodash'
import FormTooltip from '../../common/FormTooltip';
import CommonAccordion from '../../common/CommonAccordion';


const ResourceIDAssignmentSettings = props => {
  const configs = props.advanceSettings.assigningIds
  const [autoIDConceptID, setAutoIDConceptID] = React.useState('None')
  const [autoIDMappingID, setAutoIDMappingID] = React.useState('sequential')
  const [autoIDConceptExternalID, setAutoIDConceptExternalID] = React.useState('None')
  const [autoIDMappingExternalID, setAutoIDMappingExternalID] = React.useState('None')
  const [autoIDConceptIDStartFrom, setAutoIDConceptIDStartFrom] = React.useState(1)
  const [autoIDMappingIDStartFrom, setAutoIDMappingIDStartFrom] = React.useState(1)
  const [autoIDConceptExternalIDStartFrom, setAutoIDConceptExternalIDStartFrom] = React.useState(1)
  const [autoIDMappingExternalIDStartFrom, setAutoIDMappingExternalIDStartFrom] = React.useState(1)
  const onChange = (id, value, setter) => {
    setter(value)
    props.onChange(toState({[id]: toValue(value)}))
  }
  const toValue = value => includes(['uuid', 'sequential'], value) ? value : null
  const toState = newValue => merge({
    autoid_concept_mnemonic: toValue(autoIDConceptID),
    autoid_concept_mnemonic_start_from: parseInt(autoIDConceptIDStartFrom),
    autoid_concept_external_id: toValue(autoIDConceptExternalID),
    autoid_concept_external_id_start_from: parseInt(autoIDConceptExternalIDStartFrom),
    autoid_mapping_mnemonic: toValue(autoIDMappingID),
    autoid_mapping_mnemonic_start_from: parseInt(autoIDMappingIDStartFrom),
    autoid_mapping_external_id: toValue(autoIDMappingExternalID),
    autoid_mapping_external_id_start_from: parseInt(autoIDMappingExternalIDStartFrom),
  }, newValue)

  const Template = (id, config, value, setter, defaultValue, startFromValue, startFromSetter, startFromConfig) => {
    const isExternalID = id.includes('External')
    const isConceptID = id.includes('concept')
    const autoIdFieldID = isConceptID ? 'autoid_concept_mnemonic' : 'autoid_mapping_mnemonic'
    const autoExternalIDFieldID = isConceptID ? 'autoid_concept_external_id' : 'autoid_mapping_external_id'
    const autoIdStartFromFieldID = isConceptID ? 'autoid_concept_mnemonic_start_from' : 'autoid_mapping_mnemonic_start_from'
    const autoIdExternalIDStartFromFieldID = isConceptID ? 'autoid_concept_external_id_start_from' : 'autoid_mapping_external_id_start_from'
    const fieldID = isExternalID ? autoExternalIDFieldID : autoIdFieldID
    const startFromID = isExternalID ? autoIdExternalIDStartFromFieldID : autoIdStartFromFieldID
    return (
      <div className='col-xs-12 no-side-padding' style={{marginBottom: '18px'}}>
        <div className='col-xs-12 no-side-padding'>
          <div className='col-xs-12 no-side-padding form-text-gray' style={{marginBottom: '8px'}}>
            {config.label}
          </div>
          <div className='col-xs-12 no-side-padding form-text-gray flex-vertical-center'>
            <FormControl variant="outlined" fullWidth  size="small">
              <Select
                required
                defaultValue={defaultValue}
                value={value}
                onChange={event => onChange(fieldID, event.target.value || '', setter)}
              >
                <MenuItem value='None'>
                  <ListItemText primary="Enter Manually" secondary={<span style={{whiteSpace: 'pre-wrap'}}>The ID must be entered manually each time you create a new concept.</span>} />
                </MenuItem>
                <MenuItem value='uuid'>
                  <ListItemText primary="UUID" secondary={<span style={{whiteSpace: 'pre-wrap'}}>The ID is is auto-assigned in the UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</span>} />
                </MenuItem>
                <MenuItem value='sequential'>
                  <ListItemText primary="Sequential" secondary={<span style={{whiteSpace: 'pre-wrap'}}>The ID is auto-assigned in a numeric format, increasing by 1 for each new resource. You can pick what number to start with.</span>} />
                </MenuItem>
              </Select>
            </FormControl>
            <FormTooltip title={config.tooltip} style={{marginLeft: '10px'}} />
          </div>
        </div>
        {
          value === 'sequential' &&
            <div className='col-xs-12 no-side-padding flex-vertical-center' style={{marginTop: '15px'}}>
              <TextField
                style={{width: '50%'}}
                size='small'
                value={startFromValue}
                onChange={event => onChange(startFromID, event.target.value || '', startFromSetter)}
                type='number'
                label={startFromConfig.label}
                inputProps={{min: 1}}
              />
              <FormTooltip title={startFromConfig.tooltip} style={{marginLeft: '10px'}} />
            </div>
        }
      </div>
    )
  }

  return (
    <CommonAccordion square title={configs.title} subTitle={configs.subTitle}>
      <React.Fragment>
        {
          Template('conceptID', configs.conceptID, autoIDConceptID, setAutoIDConceptID, 'None', autoIDConceptIDStartFrom, setAutoIDConceptIDStartFrom, configs.conceptIDStartFrom)
        }
        {
          Template('conceptExternalID', configs.conceptExternalID, autoIDConceptExternalID, setAutoIDConceptExternalID, 'None', autoIDConceptExternalIDStartFrom, setAutoIDConceptExternalIDStartFrom, configs.conceptExternalIDStartFrom)
        }
        {
          Template('mappingID', configs.mappingID, autoIDMappingID, setAutoIDMappingID, 'sequential', autoIDMappingIDStartFrom, setAutoIDMappingIDStartFrom, configs.mappingIDStartFrom)
        }
        {
          Template('mappingExternalID', configs.mappingExternalID, autoIDMappingExternalID, setAutoIDMappingExternalID, 'None', autoIDMappingExternalIDStartFrom, setAutoIDMappingExternalIDStartFrom, configs.mappingExternalIDStartFrom)
        }
      </React.Fragment>
    </CommonAccordion>
  )
}

export default ResourceIDAssignmentSettings;
