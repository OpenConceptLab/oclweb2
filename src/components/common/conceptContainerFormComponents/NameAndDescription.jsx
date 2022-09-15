import React from 'react';
import { ChevronRight as RightIcon, List as ListIcon } from '@mui/icons-material';
import { TextField, Button } from '@mui/material';
import { upperFirst } from 'lodash';
import APIService from '../../../services/APIService';
import { GREEN, WHITE } from '../../../common/constants';
import OwnerSelectorButton from '../../common/OwnerSelectorButton';
import FormTooltip from '../../common/FormTooltip';


const NameAndDescription = props => {
  const [owner, setOwner] = React.useState(props.owner)
  const [id, setId] = React.useState('')
  const [idError, setIdError] = React.useState(false)
  const [shortName, setShortName] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const configs = props.nameAndDescription
  const getNewRepoURL = () => `${owner.url}${props.resource}s/`
  const getCode = () => {
    const hasError = !props.edit && id && (idError || !document.getElementById('short-code').checkValidity())
    const code = id ? `${id}` : '[short-code]'

    return (
      <span>
        <span style={hasError ? {color: 'red'} : {}}>
          <b>{code}</b>
        </span>
        <span>/</span>
      </span>
    )
  }
  const onChange = (id, value, setter) => {
    setter(value)
    props.onChange({[id]: value}, id === 'owner' ? 'owner' : false)
  }

  const onShortCodeBlur = event => {
    if(event.target.value) {
      const result = event.target.reportValidity()
      if(result && owner) {
        setIdError(false)
        const service = APIService.new().overrideURL(owner.url)
        props.resource === 'source' ? service.appendToUrl('sources/') : service.appendToUrl('collections/')
        service.appendToUrl(`${id}/`)
        service.head().then(response => {
          if(response?.status === 200) {
            setIdError(`A ${upperFirst(props.resource)} with this short code already exists`)
          }
        })
      }
    }
  }

  const setFieldsForEdit = () => {
    setId(props.repo.short_code)
    setShortName(props.repo.name || '')
    setFullName(props.repo.full_name || '')
    setDescription(props.repo.description || '')
  }

  React.useEffect(() => props.edit && setFieldsForEdit(), [])

  return (
    <div className='col-xs-12 no-side-padding' style={{marginTop: '80px', marginBottom: '20px'}}>
      <div className='col-xs-12 no-side-padding'>
        <h2>{configs.title}</h2>
      </div>
      <div className='col-xs-12 no-side-padding' style={{marginBottom: '5px'}}>
        <div className='col-xs-12 no-side-padding form-text-gray'>
          {configs.subTitle}
        </div>
      </div>
      <div className='col-xs-12 no-side-padding'>
        <div className='col-xs-12 no-side-padding' style={{display: 'inline-flex', alignItems: 'flex-start'}}>
          <OwnerSelectorButton
            onChange={newOwner => onChange('owner', newOwner, setOwner)}
            owner={props.owner}
            style={{maxWidth: '80%'}}
            disabled={props.edit}
          />
          <span className='form-text-gray' style={{margin: '0 10px', display: 'flex', marginTop: '6px'}}>
            <RightIcon />
          </span>
          <span>
            {
              props.edit ?
                <Button variant='contained' style={{background: GREEN, color: WHITE, pointerEvents: 'none'}} startIcon={<ListIcon />} >
                  {id}
                </Button> :
                <TextField
                  size='small'
                  label={configs.shortCode.label}
                  required
                  onChange={event => onChange('id', event.target.value || '', setId)}
                  inputProps={{ pattern: "[a-zA-Z0-9-._@]+" }}
                  value={id}
                  onBlur={onShortCodeBlur}
                  id='short-code'
                  helperText={idError}
                  error={Boolean(idError)}
                />
            }
          </span>
            <FormTooltip title={configs.shortCode.tooltip} style={{marginLeft: '10px'}} />
        </div>
        <div className='col-xs-12 no-side-padding form-text-gray' style={{marginTop: '5px'}}>
          <span>Your URL will be:</span>
          <span style={{marginLeft: '5px'}}>
            {getNewRepoURL()}{getCode()}
          </span>
        </div>
      </div>
      <div className='col-xs-12 no-side-padding' style={{display: 'inline-flex', alignItems: 'center', marginTop: '15px'}}>
        <TextField
          size='small'
          label={configs.shortName.label}
          required
          onChange={event => onChange('name', event.target.value || '', setShortName)}
          value={shortName}
        />
        <FormTooltip title={configs.shortName.tooltip} style={{marginLeft: '10px'}} />
      </div>
      <div className='col-xs-12 no-side-padding' style={{display: 'inline-flex', alignItems: 'center', marginTop: '15px'}}>
        <TextField
          size='small'
          label={configs.fullName.label}
          required
          onChange={event => onChange('full_name', event.target.value || '', setFullName)}
          value={fullName}
          fullWidth
        />
        <FormTooltip title={configs.fullName.tooltip} style={{marginLeft: '10px'}} />
      </div>
      <div className='col-xs-12 no-side-padding' style={{display: 'inline-flex', alignItems: 'center', marginTop: '15px'}}>
        <TextField
          multiline
          rows={4}
          label={configs.description.label}
          onChange={event => onChange('description', event.target.value || '', setDescription)}
          value={description}
          fullWidth
        />
        <FormTooltip title={configs.description.tooltip} style={{marginLeft: '10px'}} />
      </div>
    </div>
  )
}

export default NameAndDescription;
