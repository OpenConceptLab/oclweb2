import React from 'react';
import alertifyjs from 'alertifyjs';
import { Button, ButtonGroup, List, ListItem, ListItemButton } from '@mui/material';
import { ArrowDropDown as DownIcon } from '@mui/icons-material';
import {
  set, get, isEmpty, cloneDeep, pullAt, find, map, compact
} from 'lodash';
import APIService from '../../services/APIService';
import { toRelativeURL } from '../../common/utils';
import URLReferenceForm from './URLReferenceForm';
import ResourceReferenceForm from './ResourceReferenceForm';
import AddReferencesResult from '../common/AddReferencesResult';
import ReferenceCascadeDialog from '../common/ReferenceCascadeDialog';
import PopperGrow from '../common/PopperGrow';
import Search from '../search/Search';

const EXPRESSION_MODEL = {uri: '', valid: false, count: undefined, error: ''}
const ADD_EXPRESSION_OPTION = {id: 'addExpression', label: 'Add as Expression'}
const ADD_CONCEPTS_EXPRESSION_OPTION = {id: 'addConceptsExpression', label: 'Add Concepts Expression'}
const ADD_MAPPINGS_EXPRESSION_OPTION = {id: 'addMappingsExpression', label: 'Add Mappings Expression'}
const ADD_BOTH_EXPRESSION_OPTION = {id: 'addBothExpression', label: 'Add Concepts and Mappings Expression'}
const ADD_SELECTED_OPTION = {id: 'addSelected', label: 'Add Selected'}
class ReferenceForm extends React.Component {
  constructor(props) {
    super(props);
    this.anchorRef = React.createRef()
    this.state = {
      searchExpression: null,
      selectedExpressions: [],
      conceptsSearchExpression: null,
      mappingsSearchExpression: null,
      openOptions: false,
      selectedOption: ADD_EXPRESSION_OPTION,
      isSubmitting: false,
      cascadeDialog: false,
      result: null,
      byURL: false,
      byResource: false,
      cascadeMappings: false,
      cascadeToConcepts: false,
      fields: {
        expressions: [cloneDeep(EXPRESSION_MODEL)],
      },
      fieldErrors: {},
    }
  }


  resetExpressions = () => this.setState({selectedExpressions: [], fields: {...this.state.fields, expressions: [cloneDeep(EXPRESSION_MODEL)]}})

  onSwitchChange = event => this.setState({
    byURL: event.target.checked,
    selectedExpressions: [],
    fields: {...this.state.fields, expressions: [cloneDeep(EXPRESSION_MODEL)]}
  })

  onTextFieldChange = event => this.setFieldValue(event.target.id, event.target.value)

  onExpressionURIChange = event => this.setFieldValue(event.target.id + '.uri', event.target.value)

  onExpressionAdd = () => this.setState({
    fields: {
      ...this.state.fields,
      expressions: [...this.state.fields.expressions, cloneDeep(EXPRESSION_MODEL)]
    }
  })

  onExpressionsUpdate = expressions => this.setState({
    fields: {
      ...this.state.fields,
      expressions: expressions
    }
  })

  onExpressionDelete = index => {
    const newState = {...this.state}
    pullAt(newState.fields.expressions, index)
    this.setState(newState)
  }

  setFieldValue(id, value) {
    const newState = {...this.state}
    set(newState, id, value)

    const fieldName = get(id.split('fields.'), '1')
    if(fieldName && !isEmpty(value) && get(newState.fieldErrors, fieldName) && fieldName !== 'expressions')
      newState.fieldErrors[fieldName] = null
    this.setState(newState)
  }

  anyInvalidExpression() {
    const { fields } = this.state;
    return Boolean(find(fields.expressions, expression => !isEmpty(expression.error)))
  }

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const fields = cloneDeep(this.state.fields);
    const expressions = compact(map(fields.expressions, 'uri'))
    if(this.state.byURL) {
      const isValid = document.getElementsByTagName('form')[0].reportValidity();
      if(!isValid) {
        alertifyjs.error('Please fill required fields')
        return
      }
    } else {
      if(isEmpty(expressions)) {
        if(this.state.byURL)
          alertifyjs.error('Please add at least one expression')
        else if(this.state.byResource)
          alertifyjs.error('Please select at least one concept or mapping')
        else
          alertifyjs.error('Please select at least one concept')
        return
      }
    }

    if(!this.anyInvalidExpression()){
      this.setState({cascadeDialog: true})
    }
  }

  getExpressionsToSubmit = () => {
    const expressions = this.state.fields.expressions
    if(expressions[0].uri)
      return {expressions: compact(map(expressions, 'uri'))}

    return expressions
  }

  submitReferences = () => {
    this.setState({isSubmitting: true}, () => {
      const { cascadeMappings, cascadeToConcepts } = this.state
      const { parentURL } = this.props
      let queryParams = {}
      if(cascadeToConcepts)
        queryParams = {cascade: 'sourceToConcepts'}
      else if(cascadeMappings)
        queryParams = {cascade: 'sourceMappings'}


      APIService.new().overrideURL(parentURL).appendToUrl('references/').put(
        {data: this.getExpressionsToSubmit()}, null, null, queryParams
      ).then(response => this.setState(
        {cascadeDialog: false, isSubmitting: false}, () => this.handleSubmitResponse(response))
      )
    })
  }

  handleSubmitResponse(response) {
    if(response.status === 200) { // success
      this.setState({result: response.data})
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

  onExpressionChange = expressions => {
    const refs = map(expressions, expression => ({...cloneDeep(EXPRESSION_MODEL), uri: expression}))
    this.setState({selectedExpressions: expressions, fields: {...this.state.fields, expressions: refs}})
  }

  onResultClose = () => {
    const isAnyAdded = Boolean(find(this.state.result, {added: true}))
    this.props.onCancel();
    if(this.props.reloadOnSuccess && isAnyAdded)
      window.location.reload()
  }

  onAddSearchExpressionClick = (event, expressions) => {
    event.persist()
    this.setState(
      {
        fields: {
          ...this.state.fields, expressions: map(expressions, expression => ({...EXPRESSION_MODEL, valid: true, uri: expression}))
        }
      },
      () => this.onSubmit(event)
    )
  }

  onSearchResponse = (response, searchExpression) => this.setState({searchExpression: toRelativeURL(searchExpression)})

  onConceptsSearchResponse = (response, searchExpression) => this.setState({conceptsSearchExpression: toRelativeURL(searchExpression)})

  onMappingsSearchResponse = (response, searchExpression) => this.setState({mappingsSearchExpression: toRelativeURL(searchExpression)})

  handleOptionsToggle = () => this.setState({openOptions: !this.state.openOptions})

  getSecondaryOptions = () => {
    if(this.state.byURL)
      return []

    if(this.state.byResource)
      return [ADD_SELECTED_OPTION, ADD_CONCEPTS_EXPRESSION_OPTION, ADD_MAPPINGS_EXPRESSION_OPTION, ADD_BOTH_EXPRESSION_OPTION]

    return [ADD_EXPRESSION_OPTION, ADD_SELECTED_OPTION]
  }

  onOptionClick = (event, option) => {
    event.persist()
    const selectedOption = option || this.state.selectedOption
    if(selectedOption.id === 'addExpression')
      this.onAddSearchExpressionClick(event, [this.state.searchExpression])
    else if(selectedOption.id === 'addConceptsExpression')
      this.onAddSearchExpressionClick(event, [this.state.conceptsSearchExpression])
    else if(selectedOption.id === 'addMappingsExpression')
      this.onAddSearchExpressionClick(event, [this.state.mappingsSearchExpression])
    else if(selectedOption.id === 'addBothExpression')
      this.onAddSearchExpressionClick(event, [this.state.conceptsSearchExpression, this.state.mappingsSearchExpression])
    else if(selectedOption.id === 'addSelected')
      this.onAddSearchExpressionClick(event, this.state.selectedExpressions)
  }

  render() {
    const {
      byURL, byResource, fields, result, cascadeDialog, isSubmitting,
      openOptions
    } = this.state;
    const { onCancel, collection } = this.props;
    const byGlobal = !byResource && !byURL;
    const header = `Add Reference(s)`;
    const secondaryOptions = this.getSecondaryOptions()
    return (
      <div className='col-xs-12' style={{marginBottom: '30px'}}>
        <div className='col-xs-12 no-side-padding'>
          <h2 style={{margin: '10px 0'}}>{header}</h2>
        </div>
        <div className='col-xs-12 no-side-padding'>
          <div className='col-xs-7 no-left-padding'>
            <ButtonGroup>
              <Button variant={byGlobal ? 'contained' : 'outlined'} onClick={() => this.setState({byURL: false, byResource: false, selectedOption: ADD_EXPRESSION_OPTION}, this.resetExpressions)}>
                Search Concepts
              </Button>
              <Button variant={byResource ? 'contained' : 'outlined'} onClick={() => this.setState({byURL: false, byResource: true, selectedOption: ADD_SELECTED_OPTION, searchExpression: null}, this.resetExpressions)}>
                Find a Source/Collection
              </Button>
              <Button variant={byURL ? 'contained' : 'outlined'} onClick={() => this.setState({byURL: true, byResource: false, selectedOption: null, searchExpression: null}, this.resetExpressions)}>
                Add Expression
              </Button>
            </ButtonGroup>
          </div>
          <div className='col-xs-5 no-right-padding' style={{textAlign: 'right'}}>
            {
              byURL ?
              <Button style={{margin: '0 10px'}} color='primary' variant='outlined' type='submit' onClick={this.onSubmit}>
                Add
              </Button> :
              <React.Fragment>
                <Button color='primary' variant='outlined' onClick={isEmpty(secondaryOptions) ? this.onSelectedOptionClick : this.handleOptionsToggle} ref={this.anchorRef} endIcon={!isEmpty(secondaryOptions) ? <DownIcon /> : null}>
                  Add
                </Button>
                <PopperGrow minWidth='100px' open={openOptions} anchorRef={this.anchorRef} handleClose={this.handleOptionsToggle}>
                  <List dense style={{padding: '0px'}}>
                    {
                      map(secondaryOptions, option => (
                        <ListItem key={option.id} style={{padding: '2px 0'}}>
                          <ListItemButton onClick={event => this.onOptionClick(event, option)}>{option.label}</ListItemButton>
                        </ListItem>
                      ))
                    }
                  </List>
                </PopperGrow>
              </React.Fragment>
            }
            <Button style={{margin: '0 10px'}} variant='outlined' color='secondary' onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <div className='col-xs-12 no-side-padding'>
            <form style={{margin: '15px 0'}}>
              {
                byGlobal &&
                <Search
                  {...this.props}
                  noFilters
                  nested
                  asReference
                  resource='concepts'
                  onSelectChange={this.onExpressionChange}
                  onSearchResponse={this.onSearchResponse}
                />
              }
              {
                byURL &&
                <URLReferenceForm
                  expressions={fields.expressions}
                  onChange={this.onExpressionsUpdate}
                />
              }
              {
                byResource &&
                <ResourceReferenceForm
                  onChange={this.onExpressionChange}
                  onConceptsSearchResponse={this.onConceptsSearchResponse}
                  onMappingsSearchResponse={this.onMappingsSearchResponse}
                />
              }
            </form>
          </div>
        </div>
        {
          Boolean(result) &&
          <AddReferencesResult
            title={`Add to Collection: ${collection.id}`}
            open={Boolean(result)}
            onClose={this.onResultClose}
            result={result}
          />
        }
        {
          cascadeDialog &&
          <ReferenceCascadeDialog
            open={cascadeDialog}
            references={fields.expressions}
            onCascadeChange={states => this.setState({
                cascadeToConcepts: states.cascadeToConcepts, cascadeMappings: states.cascadeMappings
            })}
            collectionName={`${collection.owner}/${collection.short_code}`}
            onClose={() => this.setState({cascadeDialog: false})}
            onAdd={this.submitReferences}
            isAdding={isSubmitting}
          />
        }
      </div>
    )
  }
}

export default ReferenceForm;
