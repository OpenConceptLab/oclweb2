import React from 'react';
import {
  Select, ListItemText, MenuItem, FormControl, TextField, FormHelperText, Alert, Collapse, IconButton,
  InputLabel
} from '@mui/material';
import { Close as CloseIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';
import { merge, includes, some, compact, isNaN } from 'lodash'
import FormTooltip from '../FormTooltip';
import CommonAccordion from '../CommonAccordion';
import TabCountLabel from '../TabCountLabel';


const ResourceIDAssignmentSettings = props => {
  const configs = props.advanceSettings.assigningIds
  const [alert, setAlert] = React.useState(true)
  const [autoIDConceptID, setAutoIDConceptID] = React.useState('None')
  const [autoIDMappingID, setAutoIDMappingID] = React.useState('sequential')
  const [autoIDConceptExternalID, setAutoIDConceptExternalID] = React.useState('None')
  const [autoIDMappingExternalID, setAutoIDMappingExternalID] = React.useState('None')
  const [autoIDConceptIDStartFrom, setAutoIDConceptIDStartFrom] = React.useState(1)
  const [autoIDMappingIDStartFrom, setAutoIDMappingIDStartFrom] = React.useState(1)
  const [autoIDConceptExternalIDStartFrom, setAutoIDConceptExternalIDStartFrom] = React.useState(1)
  const [autoIDMappingExternalIDStartFrom, setAutoIDMappingExternalIDStartFrom] = React.useState(1)
  const [autoIDConceptNameExternalID, setAutoIDConceptNameExternalID] = React.useState('None')
  const [autoIDConceptDescriptionExternalID, setAutoIDConceptDescriptionExternalID] = React.useState('None')
  const onChange = (id, value, setter, isNum) => {
    setter(value)
    let _val = value
    if(isNum) {
      _val = parseInt(value)
      if(isNaN(_val))
        _val = null
    } else
      _val = toValue(value)

    props.onChange(toState({[id]: _val}))
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
    autoid_concept_name_external_id: toValue(autoIDConceptNameExternalID),
    autoid_concept_description_external_id: toValue(autoIDConceptDescriptionExternalID),
  }, newValue)
  const setFieldsForEdit = () => {
    setAutoIDConceptID(props.repo.autoid_concept_mnemonic || 'None')
    setAutoIDConceptIDStartFrom(props.repo.autoid_concept_mnemonic_start_from || 1)
    setAutoIDConceptExternalID(props.repo.autoid_concept_external_id || 'None')
    setAutoIDConceptExternalIDStartFrom(props.repo.autoid_concept_external_id_start_from || 1)
    setAutoIDMappingID(props.repo.autoid_mapping_mnemonic || 'None')
    setAutoIDMappingIDStartFrom(props.repo.autoid_mapping_mnemonic_start_from || 1)
    setAutoIDMappingExternalID(props.repo.autoid_concept_external_id || 'None')
    setAutoIDMappingExternalIDStartFrom(props.repo.autoid_mapping_external_id_start_from || 1)
    setAutoIDConceptNameExternalID(props.repo.autoid_concept_name_external_id || 'None')
    setAutoIDConceptDescriptionExternalID(props.repo.autoid_concept_description_external_id || 'None')
  }
  const count = compact([
    toValue(autoIDConceptID), toValue(autoIDConceptExternalID),
    toValue(autoIDConceptNameExternalID), toValue(autoIDConceptDescriptionExternalID),
    toValue(autoIDMappingID), toValue(autoIDMappingExternalID),
  ]).length

  React.useEffect(() => props.edit && setFieldsForEdit(), [])

  const Template = (id, config, value, setter, defaultValue, startFromValue, startFromSetter, startFromConfig, helperText) => {
    const isExternalID = id.includes('external')
    const isConceptID = id.includes('concept')
    const autoIdStartFromFieldID = isConceptID ? 'autoid_concept_mnemonic_start_from' : 'autoid_mapping_mnemonic_start_from'
    const autoIdExternalIDStartFromFieldID = isConceptID ? 'autoid_concept_external_id_start_from' : 'autoid_mapping_external_id_start_from'
    const startFromID = isExternalID ? autoIdExternalIDStartFromFieldID : autoIdStartFromFieldID
    const STYLE = {
      fontSize: '12px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'block',
    }
    return (
      <div className='col-xs-12 no-side-padding' style={{marginBottom: '18px'}}>
        <div className='col-xs-12 no-side-padding'>
          <div className='col-xs-12 no-side-padding form-text-gray flex-vertical-center'>
            <FormControl variant="outlined" fullWidth  size="small">
              <InputLabel>{config.label}</InputLabel>
              <Select
                required
                label={config.label}
                defaultValue={defaultValue}
                value={value}
                onChange={event => onChange(id, event.target.value || '', setter)}
              >
                <MenuItem value='None'>
                  <ListItemText primary="Enter Manually" secondary={<span style={STYLE}>The ID must be entered manually each time you create a new concept.</span>} />
                </MenuItem>
                <MenuItem value='uuid'>
                  <ListItemText primary="UUID" secondary={<span style={STYLE}>The ID is is auto-assigned in the UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</span>} />
                </MenuItem>
                {
                  !config.uuidOnly &&
                    <MenuItem value='sequential'>
                      <ListItemText primary="Sequential" secondary={<span style={STYLE}>The ID is auto-assigned in a numeric format, increasing by 1 for each new resource. You can pick what number to start with.</span>} />
                    </MenuItem>
                }
              </Select>
              <FormHelperText>
                {helperText}
              </FormHelperText>
            </FormControl>
            <FormTooltip title={config.tooltip} style={{marginLeft: '10px'}} />
          </div>
        </div>
        {
          value === 'sequential' &&
            <div className='col-xs-12 flex-vertical-center' style={{marginTop: '15px'}}>
              <TextField
                style={{width: '50%'}}
                size='small'
                value={startFromValue}
                onChange={event => onChange(startFromID, event.target.value || '', startFromSetter, true)}
                type='number'
                label={startFromConfig.label}
                inputProps={{min: 1, step: 1}}
              />
              <FormTooltip title={startFromConfig.tooltip} style={{marginLeft: '10px'}} />
            </div>
        }
      </div>
    )
  }

  const defaultExpanded = props.edit && some([props.repo.autoid_concept_mnemonic, props.repo.autoid_concept_external_id, props.repo.autoid_mapping_mnemonic !== 'sequential', props.repo.autoid_mapping_external_id])

  return (
    <CommonAccordion
      square
      defaultStyle
      title={
        <span className='flex-vertical-center'>
          <TabCountLabel label={configs.title} count={count || false} />
        </span>
      }
      subTitle={configs.subTitle}
      defaultExpanded={defaultExpanded}>
      <React.Fragment>
        <div className='col-xs-12 no-side-padding'>
          <Collapse in={alert}>
            <Alert
              severity="info"
              icon={<InfoIcon fontSize='inherit' />}
              action={
                <IconButton color="inherit" size="small" onClick={() => setAlert(false)}>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              {"OpenMRS recommends selecting 'Sequential' for IDs and selecting 'UUID' for External IDs"}
            </Alert>
          </Collapse>
        </div>
        <div className='col-xs-12 no-side-padding' style={{marginBottom: '10px'}}>
          <div className='col-xs-12 no-side-padding form-text-gray' style={{marginBottom: '15px'}}>
            IDs
          </div>

          {
            Template('autoid_concept_mnemonic', configs.conceptID, autoIDConceptID, setAutoIDConceptID, 'None', autoIDConceptIDStartFrom, setAutoIDConceptIDStartFrom, configs.conceptIDStartFrom)
          }
          {
            Template('autoid_mapping_mnemonic', configs.mappingID, autoIDMappingID, setAutoIDMappingID, 'sequential', autoIDMappingIDStartFrom, setAutoIDMappingIDStartFrom, configs.mappingIDStartFrom)
          }
        </div>
        <div className='col-xs-12 no-side-padding'>
          <div className='col-xs-12 no-side-padding form-text-gray' style={{marginBottom: '15px'}}>
            External IDs
          </div>
          {
            Template('autoid_concept_external_id', configs.conceptExternalID, autoIDConceptExternalID, setAutoIDConceptExternalID, 'None', autoIDConceptExternalIDStartFrom, setAutoIDConceptExternalIDStartFrom, configs.conceptExternalIDStartFrom)
          }
          {
            Template('autoid_concept_name_external_id', configs.conceptNameExternalID, autoIDConceptNameExternalID, setAutoIDConceptNameExternalID, 'None')
          }
          {
            Template('autoid_concept_description_external_id', configs.conceptDescriptionExternalID, autoIDConceptDescriptionExternalID, setAutoIDConceptDescriptionExternalID, 'None')
          }
          {
            Template('autoid_mapping_external_id', configs.mappingExternalID, autoIDMappingExternalID, setAutoIDMappingExternalID, 'None', autoIDMappingExternalIDStartFrom, setAutoIDMappingExternalIDStartFrom, configs.mappingExternalIDStartFrom)
          }
        </div>
      </React.Fragment>
    </CommonAccordion>
  )
}

export default ResourceIDAssignmentSettings;
