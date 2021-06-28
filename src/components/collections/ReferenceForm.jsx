import React from 'react';
import alertifyjs from 'alertifyjs';
import { Button, Switch, FormControlLabel } from '@material-ui/core';
import { set, get, isEmpty, isNumber, isNaN, cloneDeep, pullAt, find, map, compact } from 'lodash';
import APIService from '../../services/APIService';
import { SOURCE_CHILD_URI_REGEX } from '../../common/constants';
import { isConcept } from '../../common/utils';
import URLReferenceForm from './URLReferenceForm';
import ResourceReferenceForm from './ResourceReferenceForm';
import AddReferencesResult from './AddReferencesResult';

const EXPRESSION_MODEL = {uri: '', valid: false, count: undefined, error: ''}

class ReferenceForm extends React.Component {
  constructor(props) {
    super(props);
    this.expressionRegex = new RegExp(SOURCE_CHILD_URI_REGEX);
    this.state = {
      result: null,
      byURL: false,
      fields: {
        concepts: [],
        mappings: [],
        expressions: [cloneDeep(EXPRESSION_MODEL)],
      },
      fieldErrors: {},
    }
  }

  onSwitchChange = event => this.setState({
    byURL: event.target.checked,
    fields: {...this.state.fields, expressions: [cloneDeep(EXPRESSION_MODEL)]}
  })

  onTextFieldChange = event => this.setFieldValue(event.target.id, event.target.value)

  onExpressionURIChange = event => this.setFieldValue(event.target.id + '.uri', event.target.value)

  isValidExpression = expression => this.expressionRegex.test(expression)

  onExpressionBlur = (event, index) => {
    if(event.target.value && this.isValidExpression(event.target.value))
      this.getResourcesFromExpression(index)
  }

  onExpressionAdd = () => this.setState({
    fields: {
      ...this.state.fields,
      expressions: [...this.state.fields.expressions, cloneDeep(EXPRESSION_MODEL)]
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

  getResourcesFromExpression(index) {
    const newState = {...this.state};
    const expression = get(newState.fields.expressions, index)
    if(expression.uri) {
      const service = isConcept(expression.uri) ? APIService.concepts() : APIService.mappings()
      service.head(null, null, {uri: expression.uri}).then(response => {
        if(get(response, 'status') === 200) {
          const found = parseInt(get(response, 'headers.num_found'))
          expression.count = (!isNaN(found) && isNumber(found)) ? found : undefined
          this.setState(newState)
        }
      })
    }
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
    if(isEmpty(expressions)) {
      alertifyjs.error('Please add/select reference(s) to add')
      return
    }

    if(!this.anyInvalidExpression()) {
      const { parentURL } = this.props
      APIService.new().overrideURL(parentURL).appendToUrl('references/').put({data: {expressions: expressions}}).then(response => this.handleSubmitResponse(response))
    }
  }

  handleSubmitResponse(response) {
    if(response.status === 200) { // success
      this.setState({result: response.data})
    } else { // error
      const genericError = get(response, '__all__')
      if(genericError) {
        alertifyjs.error(genericError.join('\n'))
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
    this.setState({fields: {...this.state.fields, expressions: refs}})
  }

  onResultClose = () => {
    const isAnyAdded = Boolean(find(this.state.result, {added: true}))
    this.props.onCancel();
    if(this.props.reloadOnSuccess && isAnyAdded)
      window.location.reload()
  }

  render() {
    const { byURL, fields, result } = this.state;
    const { onCancel, collection } = this.props;
    const header = `Add Reference(s)`;
    return (
      <div className='col-md-12' style={{marginBottom: '30px'}}>
        <div className='col-md-12 no-side-padding'>
          <h2>{header}</h2>
        </div>
        <div className='col-md-12 no-side-padding'>
          <div className='col-md-3'>
            <FormControlLabel
              control={<Switch checked={byURL} onChange={this.onSwitchChange} color='primary' name="byURL" />}
              label="Add by URL"
              style={{marginBottom: '20px'}}
            />
          </div>
          <div className='col-md-9' style={{textAlign: 'right'}}>
            <Button style={{margin: '0 10px'}} color='primary' variant='outlined' type='submit' onClick={this.onSubmit}>
              Add
            </Button>
            <Button style={{margin: '0 10px'}} variant='outlined' onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <form>
            {
              byURL ?
              <URLReferenceForm
                expressions={fields.expressions}
                onAdd={this.onExpressionAdd}
                onChange={this.onExpressionURIChange}
                onBlur={this.onExpressionBlur}
                onDelete={this.onExpressionDelete}
              /> :
              <ResourceReferenceForm onChange={this.onExpressionChange} />
            }
          </form>
        </div>
        <AddReferencesResult
          title={`Add to Collection: ${collection.id}`}
          open={Boolean(result)}
          onClose={this.onResultClose}
          result={result}
        />
      </div>
    )
  }
}

export default ReferenceForm;
