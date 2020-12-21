import React from 'react';
import {
  TableContainer, Table, TableHead, TableBody, TableCell, TableRow,
  Tooltip, CircularProgress
} from '@material-ui/core';
import { Flag as FlagIcon } from '@material-ui/icons';
import {
  get, startCase, map, isEmpty, includes, isEqual, size, filter, reject, isObject, keys, values
} from 'lodash';
import APIService from '../../services/APIService';
import { formatDate, toObjectArray } from '../../common/utils';
import ReactDiffViewer from 'react-diff-viewer';

const ATTRIBUTES = {
  text1: ['datatype', 'display_locale', 'external_id'],
  textFormatted: ['owner'],
  list: ['names', 'descriptions', 'extras'],
  bool: ['retired'],
  text2: ['created_by', 'updated_by'],
  date: ['created_on', 'updated_on'],
}

const getLocaleLabelFormatted = locale => {
  if(!locale)
    return ''
  const nameAttr = get(locale, 'name') ? 'name' : 'description';
  const typeValue = get(locale, 'name_type') || get(locale, 'description_type');
  return (
    <React.Fragment key={locale.uuid}>
      <div className='flex-vertical-center'>
        {
          typeValue &&
          <span className='gray-italics'>
            {typeValue}
          </span>
        }
        <span style={{marginLeft: '5px'}}>
          {get(locale, 'name') || get(locale, 'description')}
        </span>
        <span className='gray-italics-small' style={{marginLeft: '5px'}}>
          {`[${locale.locale}]`}
        </span>
        {
          locale.locale_preferred &&
          <span style={{marginLeft: '5px'}}>
            <Tooltip title={`Preferred ${nameAttr} for this locale`} placement='top-start'>
              <FlagIcon color='secondary' fontSize='small' style={{width: '18px', marginTop: '4px'}}/>
            </Tooltip>
          </span>
        }
      </div>
    </React.Fragment>
  )
}

const getLocaleLabel = locale => {
  if(!locale)
    return '';

  let typeValue = get(locale, 'name_type') || get(locale, 'description_type') || '';
  if(typeValue)
    typeValue += ' | '

  const nameValue = get(locale, 'name') || get(locale, 'description');
  const preferredText = locale.locale_preferred ? '(preferred)' : '';

  return `[${locale.locale}] ${typeValue}${nameValue} ${preferredText}`
}

class ConceptsComparison extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingLHS: true,
      isLoadingRHS: true,
      lhs: {},
      rhs: {},
    }
  }

  componentDidMount() {
    this.setObjectsForComparison()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.search !== this.props.location.search)
      this.setObjectsForComparison()
  }

  setObjectsForComparison() {
    const queryParams = new URLSearchParams(this.props.location.search)
    this.fetchConcept(queryParams.get('lhs'), 'lhs', 'isLoadingLHS')
    this.fetchConcept(queryParams.get('rhs'), 'rhs', 'isLoadingRHS')
  }

  fetchConcept(uri, attr, loadingAttr) {
    if(uri && attr && loadingAttr) {
      APIService.new().overrideURL(uri).get().then(response => {
        if(get(response, 'status') === 200)
          this.setState({[attr]: this.formatConcept(response.data), [loadingAttr]: false})
      })
    }
  }

  formatConcept(concept) {
    concept.names = this.sortLocales(concept.names)
    concept.descriptions = this.sortLocales(concept.descriptions)
    concept.extras = toObjectArray(concept.extras)
    return concept
  }

  sortLocales = locales => {
    return [
      ...filter(locales, {name_type: 'FULLY_SPECIFIED', locale_preferred: true}),
      ...filter(reject(locales, {name_type: 'FULLY_SPECIFIED'}), {locale_preferred: true}),
      ...filter(locales, {name_type: 'FULLY_SPECIFIED', locale_preferred: false}),
      ...reject(reject(locales, {name_type: 'FULLY_SPECIFIED'}), {locale_preferred: true}),
    ]
  }

  getConceptHeader(concept) {
    return (
      <React.Fragment>
        <div style={{margin: '5px 2px'}}>
          <span>
            <span className='gray-italics'>Source:</span>
            <span>{concept.source}</span>
          </span>
          <span style={{marginLeft: '10px'}}>
            <span className='gray-italics'>Type:</span>
            <span>{concept.concept_class}</span>
          </span>
          <span style={{marginLeft: '10px'}}>
            <span className='gray-italics'>UID:</span>
            <span>{concept.id}</span>
          </span>
        </div>
      </React.Fragment>
    )
  }

  getValue(concept, attr, type, formatted=false) {
    if(type === 'list') {
      if(includes(['names', 'descriptions'], attr)) {
        const locales = get(concept, attr)
        if(isEmpty(locales)) return '';
        if(formatted)
          return map(locales, getLocaleLabelFormatted)
        return map(locales, getLocaleLabel).join('\n')
      }
    } else if(type === 'date') {
      let date = get(concept, attr);

      if(attr === 'created_on')
        date ||= get(concept, 'created_at')
      if(attr === 'updated_on')
        date ||= get(concept, 'updated_at')

      return date ? formatDate(date) : '';
    } else if (type === 'textFormatted') {
      if(attr === 'owner')
        return `${concept.owner_type}: ${concept.owner}`
    } else if (type === 'bool') {
      return get(concept, attr) ? 'True' : 'False'
    } else {
      if(includes(['created_by', 'updated_by'], attr))
        return get(concept, attr) || get(concept, `version_${attr}`) || ''
      return get(concept, attr, '')
    }
  }

  maxArrayElement(v1, v2) {
    const v1Length = isObject(v1) ? size(v1) : 0
    const v2Length = isObject(v2) ? size(v2) : 0
    return v1Length > v2Length ? v1 : v2;
  }

  getListAttrValue(attr, val, formatted=false) {
    if(includes(['names', 'descriptions'], attr))
      return formatted ? getLocaleLabelFormatted(val) : getLocaleLabel(val)
    if(includes(['extras'], attr))
      return this.getExtraAttributeLabel(val)
  }

  getExtraAttributeLabel(val) {
    if(!val)
      return ''
    return `${keys(val)[0]}: ${JSON.stringify(values(val)[0])}`
  }

  render() {
    const { lhs, rhs, isLoadingLHS, isLoadingRHS } = this.state;
    const isLoading = isLoadingLHS || isLoadingRHS;
    return (
      <React.Fragment>
        {
          isLoading ?
          <div style={{textAlign: 'center'}}>
            <CircularProgress color='primary' />
          </div> :
          <div className='col-md-12' style={{paddingTop: '10px', paddingBottom: '10px'}}>
            <TableContainer  style={{borderRadius: '4px', border: '1px solid lightgray'}}>
              <Table size='small'>
                <TableHead>
                  <TableRow colSpan="12">
                    <TableCell colSpan="2" style={{width: '10%'}}></TableCell>
                    <TableCell colSpan="5" style={{width: '45%'}}>
                      <div style={{fontSize: '14px'}}>
                        {this.getConceptHeader(lhs)}
                      </div>
                      <div style={{fontSize: '18px'}}>
                        {get(lhs, 'display_name')}
                      </div>
                    </TableCell>
                    <TableCell colSpan="5" style={{width: '45%'}}>
                      <div style={{fontSize: '14px'}}>
                        {this.getConceptHeader(rhs)}
                      </div>
                      <div style={{fontSize: '18px'}}>
                        {get(rhs, 'display_name')}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    map(ATTRIBUTES, (attrs, type) => {
                      return map(attrs, attr => {
                        const lhsValue = this.getValue(lhs, attr, type);
                        const rhsValue = this.getValue(rhs, attr, type);
                        const isDiff = !isEqual(lhsValue, rhsValue);
                        const maxLengthAttr = type === 'list' ? this.maxArrayElement(get(lhs, attr), get(rhs, attr)) : [];
                        const rowSpan = size(maxLengthAttr);
                        return (
                          <React.Fragment key={attr}>
                            {
                              type === 'list' ?
                              map(maxLengthAttr, (_attr, index) => {
                                const _lhsVal = get(lhs, `${attr}.${index}`, '')
                                const _rhsVal = get(rhs, `${attr}.${index}`, '')
                                const _lhsValCleaned = this.getListAttrValue(attr, _lhsVal)
                                const _rhsValCleaned = this.getListAttrValue(attr, _rhsVal)
                                const _isDiff = !isEqual(_lhsValCleaned, _rhsValCleaned);
                                return (
                                  <TableRow key={_attr.uuid || index} colSpan='12'>
                                    {
                                      index === 0 &&
                                      <TableCell colSpan='2' rowSpan={rowSpan} style={{width: '10%', fontWeight: 'bold'}}>
                                        {startCase(attr)}
                                      </TableCell>
                                    }
                                    {
                                      _isDiff ?
                                      <TableCell colSpan='10' style={{width: '90%'}} className='diff-row'>
                                        <ReactDiffViewer
                                          oldValue={this.getListAttrValue(attr, _lhsVal)}
                                          newValue={this.getListAttrValue(attr, _rhsVal)}
                                          showDiffOnly={false}
                                          splitView
                                          hideLineNumbers
                                        />
                                      </TableCell> :
                                      <React.Fragment>
                                        <TableCell colSpan='5' style={{width: '45%'}}>
                                          {this.getListAttrValue(attr, _lhsVal, true)}
                                        </TableCell>
                                        <TableCell colSpan='5' style={{width: '45%'}}>
                                          {this.getListAttrValue(attr, _rhsVal, true)}
                                        </TableCell>
                                      </React.Fragment>
                                    }
                                  </TableRow>
                                )
                              }) :
                              <TableRow key={attr} colSpan='12'>
                                <TableCell colSpan='2' style={{width: '10%', fontWeight: 'bold'}}>
                                  {startCase(attr)}
                                </TableCell>
                                {
                                  isDiff ?
                                  <TableCell colSpan='10' style={{width: '90%'}} className='diff-row'>
                                    <ReactDiffViewer
                                      oldValue={lhsValue}
                                      newValue={rhsValue}
                                      showDiffOnly={false}
                                      splitView
                                      hideLineNumbers
                                    />
                                  </TableCell> :
                                  <React.Fragment>
                                    <TableCell colSpan='5' style={{width: '45%'}}>
                                      {this.getValue(lhs, attr, type, true)}
                                    </TableCell>
                                    <TableCell colSpan='5' style={{width: '45%'}}>
                                      {this.getValue(rhs, attr, type, true)}
                                    </TableCell>
                                  </React.Fragment>
                                }
                              </TableRow>
                            }
                          </React.Fragment>
                        )
                      })
                    })
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        }
      </React.Fragment>
    )
  }
}

export default ConceptsComparison;
