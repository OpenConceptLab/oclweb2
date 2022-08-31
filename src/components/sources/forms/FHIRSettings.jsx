import React from 'react';
import {
  TextField, FormControlLabel, Checkbox
} from '@mui/material';
import FormTooltip from '../../common/FormTooltip';
import CommonAccordion from '../../common/CommonAccordion';


const FHIRSettings = props => {
  const configs = props.advanceSettings.fhirSettings
  const [publisher, setPublisher] = React.useState('')
  const [jurisdiction, setJurisdiction] = React.useState('')
  const [purpose, setPurpose] = React.useState('')
  const [copyright, setCopyright] = React.useState('')
  const [identifier, setIdentifier] = React.useState('')
  const [contact, setContact] = React.useState('')
  const [contentType, setContentType] = React.useState('')
  const [revisionDate, setRevisionDate] = React.useState('')
  const [experimental, setExperimental] = React.useState(false)
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [compositional, setCompositional] = React.useState(false)
  const [versionNeeded, setVersionNeeded] = React.useState(false)
  const onChange = (id, value, setter) => {
    setter(value)
    props.onChange({[id]: value})
  }

  const TextFieldTemplate = (id, config, value, setter, textType, InputLabelProps) => {
    return (
      <div className='col-xs-12 no-side-padding' style={{display: 'inline-flex', alignItems: 'center', marginTop: '10px'}}>
        <TextField
          id={id}
          fullWidth
          size='small'
          label={config.label}
          value={value}
          onChange={event => onChange(id, event.target.value || '', setter)}
          type={textType || 'text'}
          InputLabelProps={InputLabelProps || {}}
        />
        <FormTooltip title={config.tooltip} style={{marginLeft: '10px'}} />
      </div>
    )
  }

  const CheckboxFieldTemplate = (id, config, value, setter) => (
    <div className='col-xs-12 no-side-padding' style={{display: 'inline-flex', alignItems: 'center', marginTop: '10px'}}>
      <FormControlLabel
        control={<Checkbox name={id} checked={value} onChange={event => onChange(id, event.target.checked, setter)} />}
        label={config.label}
      />
      <FormTooltip title={config.tooltip} style={{marginLeft: '10px'}} />
    </div>
  )

  return (
    <CommonAccordion square defaultStyle title={configs.title} subTitle={configs.subTitle}>
      <React.Fragment>
        {TextFieldTemplate('publisher', configs.publisher, publisher, setPublisher)}
        {TextFieldTemplate('jurisdiction', configs.jurisdiction, jurisdiction, setJurisdiction)}
        {TextFieldTemplate('purpose', configs.purpose, purpose, setPurpose)}
        {TextFieldTemplate('copyright', configs.copyright, copyright, setCopyright)}
        {TextFieldTemplate('identifier', configs.identifier, identifier, setIdentifier)}
        {TextFieldTemplate('contact', configs.contact, contact, setContact)}
        {TextFieldTemplate('content_type', configs.contentType, contentType, setContentType)}
        {TextFieldTemplate('revision_date', configs.revisionDate, revisionDate, setRevisionDate, 'datetime-local', { shrink: true })}
        {CheckboxFieldTemplate('experimental', configs.experimental, experimental, setExperimental)}
        {CheckboxFieldTemplate('case_sensitive', configs.caseSensitive, caseSensitive, setCaseSensitive)}
        {CheckboxFieldTemplate('compositional', configs.compositional, compositional, setCompositional)}
        {CheckboxFieldTemplate('version_needed', configs.versionNeeded, versionNeeded, setVersionNeeded)}
      </React.Fragment>
    </CommonAccordion>
  )
}

export default FHIRSettings;
