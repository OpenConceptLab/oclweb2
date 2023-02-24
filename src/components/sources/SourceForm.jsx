import React from 'react';
import alertifyjs from 'alertifyjs';
import { Divider, Button } from '@mui/material';
import { orderBy, map, merge, cloneDeep, get, isEmpty } from 'lodash';
import APIService from '../../services/APIService';
import { recordGAUpsertEvent } from '../../common/utils';
import { SOURCE_TYPES, WHITE } from '../../common/constants'
import FormHeader from '../common/conceptContainerFormComponents/FormHeader';
import NameAndDescription from '../common/conceptContainerFormComponents/NameAndDescription';
import ConfigurationForm from '../common/conceptContainerFormComponents/ConfigurationForm';
import LanguageForm from '../common/conceptContainerFormComponents/LanguageForm';
import AdvanceSettings from '../common/conceptContainerFormComponents/AdvanceSettings';
import CONFIG from './SourceFormConfigs'

const TYPES = orderBy(map(SOURCE_TYPES, t => ({id: t, name: t})), 'name');

class SourceForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      owner: props.owner
    }
  }

  onChange = (changes, replace) => this.setState(
    replace ? {[replace]: changes[replace]} : merge({...this.state}, changes)
  )

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const { edit, source } = this.props
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    if(isFormValid) {
      recordGAUpsertEvent('Source', edit)
      const payload = this.getPayload()
      const service = APIService.new().overrideURL(this.state.owner.url + 'sources/')
      if(edit)
        service.appendToUrl(`${source.id}/`).put(payload).then(response => this.handleSubmitResponse(response))
      else
        service.post(payload).then(response => this.handleSubmitResponse(response))
    }
  }

  handleSubmitResponse(response) {
    const { edit, reloadOnSuccess, onCancel, resourceType, onSuccess } = this.props
    if(response.status === 201 || response.status === 200) { // success
      const verb = edit ? 'updated' : 'created'
      const successMsg = `Successfully ${verb} ${resourceType}`;
      const message = reloadOnSuccess ? successMsg + '. Reloading..' : successMsg;
      onCancel();
      alertifyjs.success(message, 1, () => {
        if(reloadOnSuccess)
          window.location.reload()
        if(onSuccess)
          onSuccess(response.data)
      })
    } else { // error
      const genericError = get(response, '__all__')
      if(genericError) {
        alertifyjs.error(genericError.join('<br />'))
      } else {
        this.setState(
          {fieldErrors: response || {}},
          () => alertifyjs.error('Please fill mandatory fields.')
        )
      }
    }
  }


  getPayload = () => {
    let fields = cloneDeep(this.state)
    delete fields.owner;
    delete fields.fieldErrors;
    [
      'autoid_concept_mnemonic', 'autoid_concept_external_id',
      'autoid_mapping_mnemonic', 'autoid_mapping_external_id',
    ].forEach(field => {
      if(fields[field] !== 'sequential')
        delete fields[`${field}_start_from`]
    })
    const sourceType = fields.type || get(this.props.source, 'source_type')
    if(sourceType)
      fields.source_type = sourceType

    return fields
  }

  render () {
    const { edit, owner, source } = this.props
    return (
      <form>
        <div className='col-xs-12 no-side-padding' style={{marginBottom: '30px', overflowX: 'hidden'}}>
          <FormHeader {...CONFIG} edit={edit} />
          <div className='col-xs-12'>
            <NameAndDescription {...CONFIG} edit={edit} owner={owner} onChange={this.onChange} repo={source} />
            <Divider style={{width: '100%'}} />
            <LanguageForm {...CONFIG} edit={edit} owner={owner} onChange={this.onChange} repo={source} />
            <Divider style={{width: '100%'}} />
            <ConfigurationForm {...CONFIG} edit={edit} owner={owner} types={TYPES} onChange={this.onChange} repo={source} />
            <Divider style={{width: '100%'}} />
            {
              ((edit && !isEmpty(source)) || !edit) &&
                <AdvanceSettings {...CONFIG} edit={edit} owner={owner} onChange={this.onChange} repo={source} />
            }
          </div>
          <div className='col-xs-12' style={{position: 'fixed', background: WHITE, bottom: 0, zIndex: 1999}}>
            <Button variant='contained' type='submit' onClick={this.onSubmit} style={{margin: '10px 0'}}>
              {edit ? 'Update Source' : 'Create Source'}
            </Button>
          </div>
        </div>
      </form>
    )
  }
}

export default SourceForm;
