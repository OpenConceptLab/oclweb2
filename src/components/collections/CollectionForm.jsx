import React from 'react';
import alertifyjs from 'alertifyjs';
import { Divider, Button } from '@mui/material';
import { orderBy, map, merge, cloneDeep, get, isEmpty } from 'lodash';
import APIService from '../../services/APIService';
import { recordGAUpsertEvent } from '../../common/utils';
import { COLLECTION_TYPES, WHITE } from '../../common/constants'
import FormHeader from '../common/conceptContainerFormComponents/FormHeader';
import NameAndDescription from '../common/conceptContainerFormComponents/NameAndDescription';
import ConfigurationForm from '../common/conceptContainerFormComponents/ConfigurationForm';
import LanguageForm from '../common/conceptContainerFormComponents/LanguageForm';
import AdvanceSettings from '../common/conceptContainerFormComponents/AdvanceSettings';
import CONFIG from './CollectionFormConfigs';


const TYPES = orderBy(map(COLLECTION_TYPES, t => ({id: t, name: t})), 'name');

class CollectionForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      owner: props.owner
    }
  }

  onChange = (changes, replace) => {
    let newState;

    if(replace)
      newState = {[replace]: changes[replace]}
    else
      newState = merge({...this.state}, changes)

    this.setState(newState)
  }

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const { edit, collection } = this.props
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    if(isFormValid) {
      recordGAUpsertEvent('Collection', edit)
      const payload = this.getPayload()
      const service = APIService.new().overrideURL(this.state.owner.url + 'collections/')
      if(edit)
        service.appendToUrl(`${collection.id}/`).put(payload).then(response => this.handleSubmitResponse(response))
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
    const collectionType = fields.type || get(this.props.source, 'collection_type')
    if(collectionType)
      fields.collection_type = collectionType

    return fields
  }

  render () {
    const { edit, owner, collection } = this.props
    return (
      <form>
        <div className='col-xs-12 no-side-padding' style={{marginBottom: '30px', overflowX: 'hidden'}}>
          <FormHeader {...CONFIG} edit={edit} />
          <div className='col-xs-12'>
            <NameAndDescription {...CONFIG} edit={edit} owner={owner} onChange={this.onChange} repo={collection} />
            <Divider style={{width: '100%'}} />
            <LanguageForm {...CONFIG} edit={edit} owner={owner} onChange={this.onChange} repo={collection} />
            <Divider style={{width: '100%'}} />
            <ConfigurationForm {...CONFIG} edit={edit} owner={owner} types={TYPES} onChange={this.onChange} repo={collection} />
            <Divider style={{width: '100%'}} />
            {
              ((edit && !isEmpty(collection)) || !edit) &&
                <AdvanceSettings {...CONFIG} edit={edit} owner={owner} onChange={this.onChange} repo={collection} />
            }
          </div>
          <div className='col-xs-12' style={{position: 'fixed', background: WHITE, bottom: 0, zIndex: 1999}}>
            <Button variant='contained' type='submit' onClick={this.onSubmit} style={{margin: '10px 0'}}>
              {edit ? 'Update Collection' : 'Create Collection'}
            </Button>
          </div>
        </div>
      </form>
    )
  }
}

export default CollectionForm;
