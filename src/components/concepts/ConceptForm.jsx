import React from 'react';
import alertifyjs from 'alertifyjs';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField, IconButton, Button, CircularProgress } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  set, get, map, cloneDeep, pullAt, filter, isEmpty, pick, isObject, values, startCase,
} from 'lodash';
import APIService from '../../services/APIService';
import {
  arrayToObject, fetchDatatypes, fetchNameTypes, sortValuesBySourceSummary,
  fetchDescriptionTypes, fetchConceptClasses, recordGAUpsertEvent
} from '../../common/utils';
import { ERROR_RED } from '../../common/constants';
import LocaleForm from './LocaleForm';
import ExtrasForm from '../common/ExtrasForm';
import OwnerParentSelection from '../common/OwnerParentSelection';
import GroupHeader from '../common/GroupHeader';
import GroupItems from '../common/GroupItems';

const NAME_MODEL = {locale: '', name_type: '', name: '', external_id: '', locale_preferred: false}
const DESC_MODEL = {locale: '', description_type: '', description: '', external_id: '', locale_preferred: false}
const EXTRAS_MODEL = {key: '', value: ''}
const ANCHOR_UNDERLINE_STYLES = {textDecoration: 'underline', cursor: 'pointer'}

class ConceptForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      manualMnemonic: false,
      manualExternalId: false,
      parent: null,
      fields: {
        id: '',
        concept_class: '',
        datatype: '',
        external_id: '',
        names: [cloneDeep(NAME_MODEL)],
        descriptions: [],
        extras: [],
        parent_concept_urls: [],
        comment: '',
      },
      fieldErrors: {},
      serverErrors: null,
      selected_concept_class: null,
      selected_datatype: null,
      conceptClasses: [],
      datatypes: [],
      nameTypes: [],
      descriptionTypes: [],
    }
  }

  componentDidMount() {
    fetchDatatypes(data => this.setState({datatypes: sortValuesBySourceSummary(data, this.props.sourceVersionSummary, 'concepts.datatype')}))
    fetchConceptClasses(data => this.setState({conceptClasses: sortValuesBySourceSummary(data, this.props.sourceVersionSummary, 'concepts.concept_class')}))
    fetchNameTypes(data => this.setState({nameTypes: sortValuesBySourceSummary(data, this.props.sourceVersionSummary, 'concepts.name_type')}))
    fetchDescriptionTypes(data => this.setState({descriptionTypes: data}))
    if(this.props.edit && this.props.concept)
      this.fetchConceptToEdit()
    if(this.props.copyFrom)
      this.fetchConceptToCreate()
    if(!this.props.edit)
      this.setState({parent: this.props.source})
  }

  fetchConceptToCreate() {
    const { copyFrom } = this.props;
    APIService.new().overrideURL(copyFrom.url).get().then(response => this.setFieldsForEdit(response.data))
  }

  fetchConceptToEdit() {
    const { concept } = this.props;
    APIService.new().overrideURL(concept.url).get().then(response => this.setFieldsForEdit(response.data))
  }

  setFieldsForEdit(data) {
    const { edit } = this.props;
    const instance = data
    const newState = {...this.state}
    if(edit)
      newState.fields.id = instance.id

    newState.fields.concept_class = instance.concept_class
    newState.selected_concept_class = {id: instance.concept_class, name: instance.concept_class}
    newState.selected_datatype = {id: instance.datatype, name: instance.datatype}
    newState.fields.datatype = instance.datatype
    newState.fields.external_id = instance.external_id || ''
    newState.fields.names = isEmpty(instance.names) ? newState.fields.names : map(instance.names, name => pick(name, ['locale', 'name_type', 'locale_preferred', 'external_id', 'name']))
    newState.fields.descriptions = isEmpty(instance.descriptions) ? newState.fields.descriptions : map(instance.descriptions, desc => pick(desc, ['locale', 'description_type', 'locale_preferred', 'external_id', 'description']))
    newState.fields.extras = isEmpty(instance.extras) ? newState.fields.extras : map(instance.extras, (v, k) => ({key: k, value: v}))
    newState.fields.parent_concept_urls = instance.parent_concept_urls || []
    this.setState(newState);
  }

  getIdHelperText() {
    const { parent, fields } = this.state
    const { edit, source } = this.props
    const defaultId = "[concept-id]"
    const id = fields.id
    const parentURL = edit ? this.props.parentURL : get(parent, 'url');
    return (
      <span>
        {
          parentURL &&
            <span>
              {
                source.autoid_concept_mnemonic &&
                  <React.Fragment>
                    <a onClick={this.toggleManualMnemonic} style={ANCHOR_UNDERLINE_STYLES}>Auto-assign</a><br/>
                  </React.Fragment>
              }
              {
                source.autoid_concept_mnemonic === 'sequential' &&
                  <React.Fragment>
                    <span>This is optional since the parent repository is set can to take care of generating the ID. The ID will be generated to next in sequence.</span><br/>
                  </React.Fragment>
              }
              {
                source.autoid_concept_mnemonic === 'uuid' &&
                  <React.Fragment>
                    <span>This is optional since the parent repository is set to take care of generating the ID. The ID will be generated in UUID format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.</span><br/>
                  </React.Fragment>
              }
              <span>Your new concept will live at: <br />
                { `${window.location.origin}/#${parentURL}concepts/` }
              </span>
              <span><b>{id ? encodeURIComponent(id) : defaultId}</b>/</span>
            </span>
        }
      </span>
    )
  }

  getExternalIdHelperText() {
    const { source } = this.props
    if(!source)
      return ''
    return (
      <span>
        {
          source.autoid_concept_external_id &&
            <React.Fragment>
              <a onClick={this.toggleManualExternalId} style={ANCHOR_UNDERLINE_STYLES}>Auto-assign</a><br/>
            </React.Fragment>
        }
        {
          source.autoid_concept_external_id === 'sequence' &&
            <span>This is optional since the parent repository is set to take care of generating the External ID. The External ID will be generated to next in sequence.</span>
        }
        {
          source.autoid_concept_external_id === 'uuid' &&
            <span>This is optional since the parent repository is set to take care of generating the External ID. The External ID will be generated in UUID format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.</span>
        }
        {
          !source.autoid_concept_external_id && ''
        }
      </span>
    )
  }

  onTextFieldChange = event => {
    this.setFieldValue(event.target.id, event.target.value)
  }

  onIdFieldBlur = event => {
    const el = event.target
    if(el)
      el.reportValidity()
  }

  onAutoCompleteChange = (id, item) => {
    this.setFieldValue(id, get(item, 'id', ''), true)
  }

  onCheckboxChange = (id, value) => {
    this.setFieldValue(id, value)
  }

  onDeleteParentConceptURL = index => {
    let newValue = cloneDeep(this.state.fields.parent_concept_urls)
    newValue.splice(index, 1)
    this.setFieldValue('fields.parent_concept_urls', newValue)
  }

  onAddParentConceptURL = () => {
    this.setFieldValue('fields.parent_concept_urls', [...this.state.fields.parent_concept_urls, ''])
  }

  onAddNameLocale = () => {
    this.setFieldValue('fields.names', [...this.state.fields.names, cloneDeep(NAME_MODEL)])
  }

  onAddDescLocale = () => {
    this.setFieldValue('fields.descriptions', [...this.state.fields.descriptions, cloneDeep(DESC_MODEL)])
  }

  onAddExtras = () => {
    this.setFieldValue('fields.extras', [...this.state.fields.extras, cloneDeep(EXTRAS_MODEL)])
  }

  setFieldValue(id, value, setObject=false) {
    const newState = {...this.state}
    set(newState, id, value)

    const fieldName = get(id.split('fields.'), '1')
    if(fieldName && !isEmpty(value) && get(newState.fieldErrors, fieldName))
      newState.fieldErrors[fieldName] = null
    if(setObject)
      newState[`selected_${fieldName}`] = {id: value, name: value}
    this.setState(newState)
  }

  onDeleteNameLocale = index => {
    const newState = {...this.state}
    pullAt(newState.fields.names, index)
    this.setState(newState)
  }

  onDeleteDescLocale = index => {
    const newState = {...this.state}
    pullAt(newState.fields.descriptions, index)
    this.setState(newState)
  }

  onDeleteExtras = index => {
    const newState = {...this.state}
    pullAt(newState.fields.extras, index)
    this.setState(newState)
  }

  onExtrasChange = (index, key, value) => {
    const newState = {...this.state}
    if(key !== '__')
      newState.fields.extras[index].key = key
    if(value !== '__')
      newState.fields.extras[index].value = value
    this.setState(newState)
  }

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();
    const { parent } = this.state;
    const { edit } = this.props
    const parentURL = edit ? this.props.concept.url : get(parent, 'url');
    const fields = cloneDeep(this.state.fields);
    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()

    const isFormValid = form.checkValidity()
    if(parentURL && isFormValid) {
      recordGAUpsertEvent('Concept', edit)
      if(edit)
        fields.update_comment = fields.comment
      fields.extras = arrayToObject(fields.extras)
      fields.names = this.cleanLocales(fields.names)
      fields.descriptions = this.cleanLocales(fields.descriptions)
      let service = APIService.new().overrideURL(encodeURI(parentURL))
      if(edit) {
        service.put(fields).then(response => this.handleSubmitResponse(response))
      } else {
        service.appendToUrl('concepts/').post(fields).then(response => this.handleSubmitResponse(response))
      }
    }
  }

  handleSubmitResponse(response) {
    const { edit, reloadOnSuccess, onCancel } = this.props
    if(response.status === 201 || response.status === 200) { // success
      const verb = edit ? 'updated' : 'created'
      const successMsg = `Successfully ${verb} concept`;
      const message = reloadOnSuccess ? successMsg + '. Reloading..' : successMsg;
      onCancel();
      alertifyjs.success(message, 1, () => {
        if(reloadOnSuccess) {
          window.location.hash = `#${response.data.url}`
        }
      })
    } else { // error
      const genericError = get(response, '__all__')
      if(genericError) {
        alertifyjs.error(genericError.join('<br/>'))
      } else if (isObject(response)) {
        alertifyjs.error(map(values(response), startCase).join('.<br/>'))
      } else {
        this.setState(
          {fieldErrors: response || {}},
          () => alertifyjs.error('Please fill mandatory fields.')
        )
      }
    }
  }

  cleanLocales(locales) {
    return filter(locales, locale => {
      return locale.locale &&
        (get(locale, 'name') || get(locale, 'description'))
    })
  }

  onParentChange = newParent => this.setState({parent: newParent})

  getOwner = () => {
    const { concept, source, edit } = this.props;
    if(edit) {
      return {type: concept.owner_type.toLowerCase(), id: concept.owner, name: concept.owner}
    }
    return {type: source.owner_type.toLowerCase(), id: source.owner, name: source.owner}
  }

  getParent = () => {
    const { edit, concept } = this.props;
    if(edit)
      return {id: concept.source, name: concept.source}
    return this.state.parent
  }

  toggleManualMnemonic = () => {
    const newManualMnemonic = !this.state.manualMnemonic
    const newState = {...this.state}
    if(!newManualMnemonic)
      newState.fields.id = ''
    newState.manualMnemonic = newManualMnemonic
    this.setState(newState)
  }

  toggleManualExternalId = () => {
    const newManualExternalId = !this.state.manualExternalId
    const newState = {...this.state}
    if(!newManualExternalId)
      newState.fields.external_id = ''
    newState.manualExternalId = newManualExternalId
    this.setState(newState)
  }

  render() {
    const {
      fieldErrors, fields, datatypes, nameTypes, conceptClasses,
      descriptionTypes, selected_concept_class, selected_datatype, manualMnemonic, manualExternalId
    } = this.state;
    const isLoading = isEmpty(descriptionTypes) || isEmpty(datatypes) || isEmpty(nameTypes);
    const { onCancel, edit, source } = this.props;
    const header = edit ? `Edit Concept: ${fields.id}` : 'New Concept'

    return (
      <div className='col-md-12' style={{marginBottom: '30px'}}>
        <div className='col-md-12 no-side-padding'>
          <h2>{header}</h2>
        </div>
        {
          isLoading ?
            <div style={{width: '100%', textAlign: 'center', marginTop: '100px'}}>
              <CircularProgress />
            </div>:
          <div className='col-md-12 no-side-padding'>
            <form>
              <OwnerParentSelection
                selectedOwner={this.getOwner()}
                selectedParent={this.getParent()}
                requiredParent
                requiredOwner
                onChange={this.onParentChange}
                disabled={edit}
              />
              {
                !edit &&
                  <div style={{marginTop: '15px', width: '100%'}}>
                    {
                      get(source, 'autoid_concept_mnemonic') && !manualMnemonic ?
                        <span style={{fontWeight: '500', borderLeft: '3px solid lightgray', padding: '10px 5px'}}>
                          Concept ID will be auto-assigned (<a style={ANCHOR_UNDERLINE_STYLES} onClick={this.toggleManualMnemonic}>click here</a> to override with manual entry)
                        </span> :
                      <TextField
                        error={Boolean(fieldErrors.id)}
                        id="fields.id"
                        label="Concept ID"
                        placeholder="e.g. A15.0"
                        helperText={this.getIdHelperText()}
                        variant="outlined"
                        fullWidth
                        required={!source.autoid_concept_mnemonic}
                        onChange={this.onTextFieldChange}
                        onBlur={this.onIdFieldBlur}
                        value={fields.id}
                        disabled={edit}
                      />
                    }
                  </div>
              }
              <div style={{marginTop: '15px', width: '100%'}}>
                <Autocomplete
                  freeSolo={get(source, 'custom_validation_schema') !== "OpenMRS"}
                  openOnFocus
                  id="fields.concept_class"
                  value={selected_concept_class}
                  options={conceptClasses}
                  getOptionLabel={option => option.name}
                  fullWidth
                  required
                  groupBy={option => option.resultType}
                  renderGroup={params => (
                    <li style={{listStyle: 'none'}} key={params.group}>
                      <GroupHeader>{params.group}</GroupHeader>
                      <GroupItems>{params.children}</GroupItems>
                    </li>
                  )}
                  renderInput={
                    params => <TextField
                                {...params}
                                error={Boolean(fieldErrors.concept_class)}
                                required
                                label="Concept Class"
                                variant="outlined"
                                fullWidth />
                  }
                  onChange={(event, item) => this.onAutoCompleteChange('fields.concept_class', item)}
                  onInputChange={(event, value) => this.setFieldValue('fields.concept_class', value)}
                />
              </div>
              <div style={{marginTop: '15px', width: '100%'}}>
                <Autocomplete
                  openOnFocus
                  isOptionEqualToValue={(option, value) => option.id === get(value, 'id')}
                  id="fields.datatype"
                  value={selected_datatype}
                  options={datatypes}
                  getOptionLabel={option => option.name}
                  fullWidth
                  required
                  groupBy={option => option.resultType}
                  renderGroup={params => (
                    <li style={{listStyle: 'none'}} key={params.group}>
                      <GroupHeader>{params.group}</GroupHeader>
                      <GroupItems>{params.children}</GroupItems>
                    </li>
                  )}
                  renderInput={
                    params => <TextField
                                {...params}
                                error={Boolean(fieldErrors.datatype)}
                                required
                                label="Datatype"
                                variant="outlined"
                                fullWidth />
                  }
                  onChange={(event, item) => this.onAutoCompleteChange('fields.datatype', item)}
                />
              </div>
              <div style={{marginTop: '15px', width: '100%'}}>
                {
                  get(source, 'autoid_concept_external_id') && !manualExternalId && !edit ?
                    <span style={{fontWeight: '500', borderLeft: '3px solid lightgray', padding: '10px 5px'}}>
                      Concept External ID will be auto-assigned (<a style={ANCHOR_UNDERLINE_STYLES} onClick={this.toggleManualExternalId}>click here</a> to override with manual entry)
                    </span> :
                  <TextField
                    id="fields.external_id"
                    label="External ID"
                    placeholder="e.g. UUID from external system"
                    variant="outlined"
                    fullWidth
                    onChange={this.onTextFieldChange}
                    value={fields.external_id}
                    helperText={edit ? undefined : this.getExternalIdHelperText()}
                  />
                }
              </div>
              {
                edit &&
                  <div style={{marginTop: '15px', width: '100%'}}>
                    <TextField
                      id="fields.comment"
                      label="Update Comment"
                      variant="outlined"
                      fullWidth
                      onChange={this.onTextFieldChange}
                      value={fields.comment}
                      required
                    />
                  </div>
              }
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <div className='col-md-8'>
                  <h3>Parent Concept URLs</h3>
                </div>
                <div className='col-md-4' style={{textAlign: 'right'}}>
                  <IconButton color='primary' onClick={this.onAddParentConceptURL} size="large">
                    <AddIcon />
                  </IconButton>
                </div>
                {
                  map(fields.parent_concept_urls, (url, index) => (
                    <div className='col-md-12 no-side-padding' key={index} style={index > 0 ? {marginTop: '5px', width: '100%'} : {width: '100%'}}>
                      <div className='col-md-10 no-left-padding'>
                        <TextField
                          id={`fields.parent_concept_urls.${index}`}
                          label="Parent Concept URL"
                          variant="outlined"
                          fullWidth
                          onChange={this.onTextFieldChange}
                          value={get(fields, `parent_concept_urls.${index}`)}
                        />
                      </div>
                      <div className='col-md-2 no-right-padding'>
                        <IconButton
                          style={{}}
                          onClick={() => this.onDeleteParentConceptURL(index)}
                          size="large"><DeleteIcon /></IconButton>
                      </div>
                    </div>
                  ))
                }
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <div className='col-md-8'>
                  <h3 style={fieldErrors.names && isEmpty(fields.names) ? {color: ERROR_RED} : {}}>Names & Synonyms</h3>
                </div>
                <div className='col-md-4' style={{textAlign: 'right'}}>
                  <IconButton color='primary' onClick={this.onAddNameLocale} size="large">
                    <AddIcon />
                  </IconButton>
                </div>
                {
                  map(fields.names, (name, index) => (
                    <div className='col-md-12 no-side-padding' key={index} style={index > 0 ? {marginTop: '5px', width: '100%'} : {width: '100%'}}>
                      <LocaleForm
                        error={Boolean(index === 0 && fieldErrors.name)}
                        locale={name}
                        index={index}
                        localeAttr='fields.names'
                        onTextFieldChange={this.onTextFieldChange}
                        onAutoCompleteChange={this.onAutoCompleteChange}
                        onCheckboxChange={this.onCheckboxChange}
                        types={nameTypes}
                        onDelete={this.onDeleteNameLocale}
                        sourceVersionSummary={this.props.sourceVersionSummary}
                      />
                    </div>
                  ))
                }
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <div className='col-md-8'>
                  <h3>Descriptions</h3>
                </div>
                <div className='col-md-4' style={{textAlign: 'right'}}>
                  <IconButton color='primary' onClick={this.onAddDescLocale} size="large">
                    <AddIcon />
                  </IconButton>
                </div>
                {
                  map(fields.descriptions, (desc, index) => (
                    <div className='col-md-12 no-side-padding' key={index} style={index > 0 ? {marginTop: '5px', width: '100%'} : {width: '100%'}}>
                      <LocaleForm
                        locale={desc}
                        index={index}
                        localeAttr='fields.descriptions'
                        onTextFieldChange={this.onTextFieldChange}
                        onAutoCompleteChange={this.onAutoCompleteChange}
                        onCheckboxChange={this.onCheckboxChange}
                        types={descriptionTypes}
                        onDelete={this.onDeleteDescLocale}
                        sourceVersionSummary={this.props.sourceVersionSummary}
                      />
                    </div>
                  ))
                }
              </div>
              <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
                <div className='col-md-8'>
                  <h3>Custom Attributes</h3>
                </div>
                <div className='col-md-4' style={{textAlign: 'right'}}>
                  <IconButton color='primary' onClick={this.onAddExtras} size="large">
                    <AddIcon />
                  </IconButton>
                </div>
                {
                  map(fields.extras, (extra, index) => (
                    <div className='col-md-12 no-side-padding' key={index} style={index > 0 ? {marginTop: '5px', width: '100%'} : {width: '100%'}}>
                      <ExtrasForm
                        extra={extra}
                        index={index}
                        onChange={this.onExtrasChange}
                        onDelete={this.onDeleteExtras}
                      />
                    </div>
                  ))
                }
              </div>
              <div className='col-md-12' style={{textAlign: 'center', margin: '20px 0'}}>
                <Button style={{margin: '0 10px'}} color='primary' variant='outlined' type='submit' onClick={this.onSubmit}>
                  {edit ? 'Update' : 'Create'}
                </Button>
                <Button style={{margin: '0 10px'}} variant='outlined' onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        }
      </div>
    );
  }
}

export default ConceptForm;
