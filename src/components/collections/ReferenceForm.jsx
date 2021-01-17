import React from 'react';
import alertifyjs from 'alertifyjs';
import { Button, Switch, FormControlLabel } from '@material-ui/core';
import { set, get, isEmpty, isNumber, isNaN, cloneDeep, pullAt, find, map } from 'lodash';
import APIService from '../../services/APIService';
import { SOURCE_CHILD_URI_REGEX } from '../../common/constants';
import URLReferenceForm from './URLReferenceForm';
const EXPRESSION_MODEL = {uri: '', valid: false, count: undefined, error: ''}

class ReferenceForm extends React.Component {
  constructor(props) {
    super(props);
    this.expressionRegex = new RegExp(SOURCE_CHILD_URI_REGEX);
    this.state = {
      byURL: false,
      fields: {
        concepts: [],
        mappings: [],
        expressions: [cloneDeep(EXPRESSION_MODEL)],
        expression: '',
      },
      fieldErrors: {},
    }
  }

  onSwitchChange = event => this.setState({byURL: event.target.checked})

  onTextFieldChange = event => this.setFieldValue(event.target.id, event.target.value)

  onExpressionURIChange = event => this.setFieldValue(event.target.id + '.uri', event.target.value)

  isValidExpression = expression => this.expressionRegex.test(expression)

  onExpressionBlur = (event, index) => {
    const value = event.target.value
    const newState = {...this.state}
    const isValid = this.isValidExpression(value)

    if(value && !isValid) {
      set(newState, `${event.target.id}.error`, 'This is not a valid expression.')
      this.setState(newState)
    } else {
      set(newState, `${event.target.id}.error`, '')
      this.setState(newState, () => this.getResourcesFromExpression(index))
    }
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
      APIService.concepts().head(null, null, {uri: expression.uri}).then(response => {
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

    const form = document.getElementsByTagName('form')[0];
    form.reportValidity()
    const isFormValid = form.checkValidity()
    if(isFormValid && !this.anyInvalidExpression()) {
      const { parentURL } = this.props
      const fields = cloneDeep(this.state.fields);
      const expressions = map(fields.expressions, 'uri')
      APIService.new().overrideURL(parentURL).appendToUrl('references/').put({data: {expressions: expressions}}).then(response => this.handleSubmitResponse(response))
    }
  }

  handleSubmitResponse(response) {
    const { reloadOnSuccess, onCancel } = this.props
    if(response.status === 200) { // success
      const successMsg = `Successfully added reference(s)`;
      const message = reloadOnSuccess ? successMsg + '. Reloading..' : successMsg;
      onCancel();
      alertifyjs.success(message, 1, () => {
        if(reloadOnSuccess)
          window.location.reload()
      })
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

  render() {
    const { byURL, fields } = this.state;
    const { onCancel } = this.props;
    const header = `Add Reference(s)`;
    return (
      <div className='col-md-12' style={{marginBottom: '30px'}}>
        <div className='col-md-12 no-side-padding'>
          <h2>{header}</h2>
        </div>
        <div className='col-md-12 no-side-padding'>
          <div className='col-md-12'>
            <FormControlLabel
              control={<Switch checked={byURL} onChange={this.onSwitchChange} color='primary' name="byURL" />}
              label="Add by URL"
              style={{marginBottom: '20px'}}
            />
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
              <div></div>
            }
            <div className='col-md-12' style={{textAlign: 'center', margin: '15px 0'}}>
              <Button style={{margin: '0 10px'}} color='primary' variant='outlined' type='submit' onClick={this.onSubmit}>
                Add
              </Button>
              <Button style={{margin: '0 10px'}} variant='outlined' onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default ReferenceForm;
