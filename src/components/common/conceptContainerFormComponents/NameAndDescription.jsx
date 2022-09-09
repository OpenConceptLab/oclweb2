import React from 'react';
import { ChevronRight as RightIcon, List as ListIcon } from '@mui/icons-material';
import { TextField, Button } from '@mui/material';
import { GREEN, WHITE } from '../../../common/constants';
import OwnerSelectorButton from '../../common/OwnerSelectorButton';
import FormTooltip from '../../common/FormTooltip';


const NameAndDescription = props => {
  const [owner, setOwner] = React.useState(props.owner)
  const [id, setId] = React.useState('')
  const [shortName, setShortName] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const configs = props.nameAndDescription
  const getNewRepoURL = () => `/users/${owner.id || owner.username}/${props.resource}s/`
  const getCode = () => <b>{id ? id : 'short-code'}/</b>
  const onChange = (id, value, setter) => {
    setter(value)
    props.onChange({[id]: value}, id === 'owner' ? 'owner' : false)
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
        <div className='col-xs-12 no-side-padding' style={{display: 'inline-flex', alignItems: 'center'}}>
          <OwnerSelectorButton
            onChange={newOwner => onChange('owner', newOwner, setOwner)}
            owner={props.owner}
            style={{maxWidth: '80%'}}
            disabled={props.edit}
          />
          <span className='form-text-gray' style={{margin: '0 10px', display: 'flex'}}>
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
