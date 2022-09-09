import React from 'react';
import moment from 'moment';
import {
  TextField, FormControlLabel, Checkbox
} from '@mui/material';
import { isObject, isEmpty, some } from 'lodash'
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
  const [meta, setMeta] = React.useState('')
  const [revisionDate, setRevisionDate] = React.useState('')
  const [lockedDate, setLockedDate] = React.useState('')
  const [experimental, setExperimental] = React.useState(false)
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [compositional, setCompositional] = React.useState(false)
  const [versionNeeded, setVersionNeeded] = React.useState(false)
  const [immutable, setImmutable] = React.useState(false)
  const onChange = (id, value, setter) => {
    setter(value)
    props.onChange({[id]: value})
  }
  const toFormValue = value => {
    if(isObject(value))
      return isEmpty(value) ? '' : JSON.stringify(value)
    return value
  }
  const setFieldsForEdit = () => {
    setPublisher(props.repo.publisher || '')
    setJurisdiction(toFormValue(props.repo.jurisdiction) || '')
    setPurpose(props.repo.purpose || '')
    setCopyright(props.repo.copyright || '')
    setIdentifier(toFormValue(props.repo.identifier) || '')
    setContact(toFormValue(props.repo.contact) || '')
    setMeta(toFormValue(props.repo.meta) || '')
    if(props.repo.content_type)
      setContentType(props.repo.content_type || '') //for source
    if(props.repo.revision_date)
      setRevisionDate(moment(props.repo.revision_date).format('YYYY-MM-DD'))
    if(props.repo.locked_date)
      setLockedDate(moment(props.repo.locked_date).format('YYYY-MM-DD'))
    setExperimental(props.repo.experimental || false)
    setCaseSensitive(props.repo.case_sensitive || false)
    setCompositional(props.repo.compositional || false)
    setVersionNeeded(props.repo.version_needed || false)
    setImmutable(props.repo.immutable || false)
  }

  React.useEffect(() => props.edit && setFieldsForEdit(), [])
  const defaultExpanded = props.edit && some([props.repo.publisher, toFormValue(props.repo.jurisdiction), props.repo.purpose, props.repo.copyright, toFormValue(props.repo.identifier), toFormValue(props.repo.contact), props.repo.contentType, toFormValue(props.repo.meta), props.repo.revision_date, props.repo.locked_date, props.repo.experimental, props.repo.caseSensitive, props.repo.compositional, props.repo.version_needed, props.repo.immutable])

  const TextFieldTemplate = (id, config, value, setter, textType, InputLabelProps) => {
    return (
      <React.Fragment>
        {
          config &&
            <div className='col-xs-12 no-side-padding' style={{display: 'inline-flex', alignItems: 'center', marginTop: '20px'}}>
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
        }
      </React.Fragment>
    )
  }

  const CheckboxFieldTemplate = (id, config, value, setter) => {
    return (
      <React.Fragment>
        {
          config &&
            <div className='col-xs-12 no-side-padding' style={{display: 'inline-flex', alignItems: 'center', marginTop: '10px'}}>
              <FormControlLabel
                size='small'
                control={<Checkbox size='small' name={id} checked={value} onChange={event => onChange(id, event.target.checked, setter)} />}
                label={config.label}
              />
              <FormTooltip title={config.tooltip} style={{marginLeft: '10px'}} />
            </div>
        }
      </React.Fragment>
    )
  }

  return (
    <CommonAccordion square defaultStyle title={configs.title} subTitle={configs.subTitle} defaultExpanded={defaultExpanded}>
      <React.Fragment>
        {TextFieldTemplate('publisher', configs.publisher, publisher, setPublisher)}
        {TextFieldTemplate('jurisdiction', configs.jurisdiction, jurisdiction, setJurisdiction)}
        {TextFieldTemplate('purpose', configs.purpose, purpose, setPurpose)}
        {TextFieldTemplate('copyright', configs.copyright, copyright, setCopyright)}
        {TextFieldTemplate('identifier', configs.identifier, identifier, setIdentifier)}
        {TextFieldTemplate('contact', configs.contact, contact, setContact)}
        {TextFieldTemplate('content_type', configs.contentType, contentType, setContentType)}
        {TextFieldTemplate('meta', configs.meta, meta, setMeta)}
        {TextFieldTemplate('revision_date', configs.revisionDate, revisionDate, setRevisionDate, 'date', { shrink: true })}
        {TextFieldTemplate('locked_date', configs.lockedDate, lockedDate, setLockedDate, 'date', { shrink: true })}
        {CheckboxFieldTemplate('experimental', configs.experimental, experimental, setExperimental)}
        {CheckboxFieldTemplate('case_sensitive', configs.caseSensitive, caseSensitive, setCaseSensitive)}
        {CheckboxFieldTemplate('compositional', configs.compositional, compositional, setCompositional)}
        {CheckboxFieldTemplate('version_needed', configs.versionNeeded, versionNeeded, setVersionNeeded)}
        {CheckboxFieldTemplate('immutable', configs.immutable, immutable, setImmutable)}
      </React.Fragment>
    </CommonAccordion>
  )
}

export default FHIRSettings;
