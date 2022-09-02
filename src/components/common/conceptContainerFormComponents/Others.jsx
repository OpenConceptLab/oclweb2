import React from 'react';
import moment from 'moment';
import {
  TextField
} from '@mui/material';
import { isObject, isEmpty, some } from 'lodash'
import FormTooltip from '../../common/FormTooltip';
import CommonAccordion from '../../common/CommonAccordion';


const Others = props => {
  const configs = props.advanceSettings.others
  const [website, setWebsite] = React.useState('')
  const [externalID, setExternalID] = React.useState('')
  const [meta, setMeta] = React.useState('')
  const [lockedDate, setLockedDate] = React.useState('')
  const [collectionReference, setCollectionReference] = React.useState('')
  const onChange = (id, value, setter) => {
    setter(value)
    props.onChange({[id]: value})
  }
  const toFormValue = value => {
    if(isObject(value))
      return isEmpty(value) ? '' : JSON.stringify(value)
    return value || ''
  }
  const setFieldsForEdit = () => {
    setWebsite(toFormValue(props.repo.website))
    setExternalID(toFormValue(props.repo.external_id))
    setMeta(toFormValue(props.repo.meta))
    if(props.repo.locked_date)
      setLockedDate(moment(props.repo.locked_date).format('YYYY-MM-DD'))
    setCollectionReference(toFormValue(props.repo.collectionReference))
  }

  React.useEffect(() => props.edit && setFieldsForEdit(), [])
  const defaultExpanded = Boolean(props.edit && some([props.repo.website, toFormValue(props.repo.meta), props.repo.external_id, props.repo.locked_date, props.repo.collection_reference]))

  const TextFieldTemplate = (id, config, value, setter, textType, InputLabelProps) => {
    return (
      <React.Fragment>
        {
          config &&
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
              {
                config.tooltip &&
                  <FormTooltip title={config.tooltip} style={{marginLeft: '10px'}} />
              }
            </div>
        }
      </React.Fragment>
    )
  }

  return (
    <CommonAccordion square title={configs.title} subTitle={configs.subTitle} defaultExpanded={defaultExpanded}>
      <React.Fragment>
        {TextFieldTemplate('website', configs.website, website, setWebsite)}
        {TextFieldTemplate('external_id', configs.externalID, externalID, setExternalID)}
        {TextFieldTemplate('meta', configs.meta, meta, setMeta)}
        {TextFieldTemplate('locked_date', configs.lockedDate, lockedDate, setLockedDate, 'date', { shrink: true })}
        {TextFieldTemplate('collection_reference', configs.collectionReference, collectionReference, setCollectionReference)}
      </React.Fragment>
    </CommonAccordion>
  )
}

export default Others;
