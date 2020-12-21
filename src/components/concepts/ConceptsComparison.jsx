import React from 'react';
import { Link } from 'react-router-dom';
import {
  TableContainer, Table, TableHead, TableBody, TableCell, TableRow,
  Tooltip, CircularProgress,
} from '@material-ui/core';
import {
  Flag as FlagIcon, ArrowDropDown as ArrowDownIcon, ArrowDropUp as ArrowUpIcon
} from '@material-ui/icons';
import {
  get, startCase, map, isEmpty, includes, isEqual, size, filter, reject, isObject, keys, values,
  sortBy, findIndex, uniqBy, reduce
} from 'lodash';
import APIService from '../../services/APIService';
import { formatDate, toObjectArray, toParentURI } from '../../common/utils';
import {
  DIFF_BG_RED,
} from '../../common/constants';
import ReactDiffViewer from 'react-diff-viewer';

const ATTRIBUTES = {
  text1: ['datatype', 'display_locale', 'external_id'],
  textFormatted: ['owner'],
  list: ['names', 'descriptions', 'extras', 'mappings'],
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
          (typeValue && typeValue.toLowerCase() !== 'description') &&
          <span className='gray-italics' style={{marginRight: '5px'}}>
            {typeValue}
          </span>
        }
        <span>
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

const getMappingLabel = (mapping, formatted=false) => {
  if(!mapping)
    return '';

  const label = [
    `UID: ${mapping.id}`,
    `Relationship: ${mapping.map_type}`,
    `Source: ${mapping.owner} / ${mapping.source}`,
    `From Concept Code: ${mapping.from_concept_code}`,
    `From Concept Name: ${mapping.from_concept_name}`,
    `To Concept Code: ${mapping.to_concept_code}`,
    `To Concept Name: ${mapping.to_concept_name}`,
  ].join('\n')

  if(formatted)
    return <div key={label} style={{whiteSpace: 'pre'}}>{label}</div>;

  return label
}


class ConceptsComparison extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingLHS: true,
      isLoadingRHS: true,
      lhs: {},
      rhs: {},
      collapsedAttrs: {},
    }
  }

  componentDidMount() {
    const collapsedAttrs = reduce(ATTRIBUTES.list , (obj, key) => {
      obj[key] = false
      return obj
    }, {});

    this.setState({collapsedAttrs: collapsedAttrs})
    this.setObjectsForComparison()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.search !== this.props.location.search)
      this.setObjectsForComparison()
  }

  onCollapseIconClick(attr) {
    this.setState({collapsedAttrs: {
      ...this.state.collapsedAttrs,
      [attr]: !this.state.collapsedAttrs[attr],
    }})
  }

  setObjectsForComparison() {
    const queryParams = new URLSearchParams(this.props.location.search)
    this.fetchConcept(queryParams.get('lhs'), 'lhs', 'isLoadingLHS')
    this.fetchConcept(queryParams.get('rhs'), 'rhs', 'isLoadingRHS')
  }

  fetchConcept(uri, attr, loadingAttr) {
    if(uri && attr && loadingAttr) {
      APIService.new().overrideURL(uri).get(null, null, {includeInverseMappings: true}).then(response => {
        if(get(response, 'status') === 200)
          this.setState({[attr]: this.formatConcept(response.data), [loadingAttr]: false}, this.sortMappings)
      })
    }
  }

  formatConcept(concept) {
    concept.names = this.sortLocales(concept.names)
    concept.descriptions = this.sortLocales(concept.descriptions)
    concept.extras = toObjectArray(concept.extras)
    return concept
  }

  sortMappings() {
    if(!isEmpty(get(this.state.lhs, 'mappings')) && !isEmpty(get(this.state.rhs, 'mappings'))) {
      const newState = {...this.state};
      if(newState.lhs.mappings.length > newState.rhs.mappings.length) {
        newState.lhs.mappings = uniqBy([...sortBy(
          newState.rhs.mappings, m1 => findIndex(newState.lhs.mappings, m2 => m1.id === m2.id)
        ), ...newState.lhs.mappings], 'id')
      } else {
        newState.rhs.mappings = uniqBy([...sortBy(
          newState.lhs.mappings, m1 => findIndex(newState.rhs.mappings, m2 => m1.id === m2.id)
        ), ...newState.rhs.mappings], 'id')
      }

      this.setState(newState)
    }
  }

  sortLocales = locales => {
    return [
      ...filter(locales, {name_type: 'FULLY_SPECIFIED', locale_preferred: true}),
      ...filter(reject(locales, {name_type: 'FULLY_SPECIFIED'}), {locale_preferred: true}),
      ...filter(locales, {name_type: 'FULLY_SPECIFIED', locale_preferred: false}),
      ...reject(reject(locales, {name_type: 'FULLY_SPECIFIED'}), {locale_preferred: true}),
    ]
  }

  getHeaderSubAttributes(concept) {
    return (
      <React.Fragment>
        <div style={{margin: '5px 0px'}}>
          <span>
            <span className='gray-italics'>Source:</span>
            <Link to={toParentURI(concept.url)} target="_blank">
              <span>{concept.source}</span>
            </Link>
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
      } else if (attr === 'mappings') {
        const mappings = get(concept, attr);
        if(isEmpty(mappings)) return '';
        return map(mappings, mapping => getMappingLabel(mapping, formatted));
      } else {
        return get(concept, attr)
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
    if(includes(['mappings'], attr))
      return getMappingLabel(val, formatted)
    if(includes(['extras'], attr))
      return this.getExtraAttributeLabel(val)
  }

  getExtraAttributeLabel(val) {
    if(!val)
      return ''
    return `${keys(val)[0]}: ${JSON.stringify(values(val)[0])}`
  }

  getAttributeDOM(attr, type, lhsValue, rhsValue, isDiff) {
    const { lhs, rhs } = this.state;
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
                  <TableCell colSpan='2' rowSpan={rowSpan} style={{width: '10%', fontWeight: 'bold', verticalAlign: 'top'}}>
                    {type !== 'list' && startCase(attr)}
                  </TableCell>
                }
                {
                  _isDiff ?
                  <TableCell colSpan='10' style={{width: '90%'}} className='diff-row'>
                    <ReactDiffViewer
                      oldValue={_lhsValCleaned}
                      newValue={_rhsValCleaned}
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
            <TableCell colSpan='2' style={{width: '10%', fontWeight: 'bold', verticalAlign: 'top'}}>
              {type !== 'list' && startCase(attr)}
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
  }

  getHeaderCell = concept => {
    return (
      <TableCell colSpan="5" style={{width: '45%'}} key={concept.id}>
        <div style={{fontSize: '14px'}}>
          {this.getHeaderSubAttributes(concept)}
        </div>
        <div style={{fontSize: '18px'}}>
          <Link to={concept.url} target="_blank">{concept.display_name}</Link>
        </div>
      </TableCell>
    )
  }

  render() {
    const { lhs, rhs, isLoadingLHS, isLoadingRHS, collapsedAttrs } = this.state;
    const isLoading = isLoadingLHS || isLoadingRHS;
    return (
      <React.Fragment>
        {
          isLoading ?
          <div style={{textAlign: 'center', marginTop: '30px'}}>
            <CircularProgress color='primary' />
          </div> :
          <div className='col-md-12' style={{paddingTop: '10px', paddingBottom: '10px'}}>
            <TableContainer  style={{borderRadius: '4px', border: '1px solid lightgray'}}>
              <Table size='small'>
                <TableHead>
                  <TableRow colSpan="12">
                    <TableCell colSpan="2" style={{width: '10%'}}></TableCell>
                    {
                      map([lhs, rhs], this.getHeaderCell)
                    }
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    map(ATTRIBUTES, (attrs, type) => {
                      return map(attrs, attr => {
                        const lhsValue = this.getValue(lhs, attr, type);
                        const rhsValue = this.getValue(rhs, attr, type);
                        const isDiff = !isEqual(lhsValue, rhsValue);
                        const children = this.getAttributeDOM(attr, type, lhsValue, rhsValue, isDiff);
                        if(type === 'list') {
                          const lhsCount = lhs[attr].length;
                          const rhsCount = rhs[attr].length;
                          const hasKids = Boolean(lhsCount || rhsCount);
                          const styles = isDiff ? {background: DIFF_BG_RED} : {};
                          const isExpanded = get(collapsedAttrs, attr) || !hasKids;
                          return (
                            <React.Fragment key={attr}>
                              <TableRow colSpan='12' onClick={() => this.onCollapseIconClick(attr)} style={{cursor: 'pointer'}}>
                                <TableCell colSpan='12' style={{ fontWeight: 'bold', fontSize: '0.875rem', ...styles }}>
                                  <span className='flex-vertical-center'>
                                    <span style={{marginRight: '5px'}}>{`${startCase(attr)} (${lhsCount}/${rhsCount})`}</span>
                                    {
                                      isExpanded ? <ArrowUpIcon fontSize='inherit' /> : <ArrowDownIcon fontSize='inherit' />
                                    }
                                  </span>
                                </TableCell>
                              </TableRow>
                              {
                                isExpanded &&
                                <React.Fragment>
                                  {children}
                                </React.Fragment>
                              }
                            </React.Fragment>
                          )
                        } else {
                          return children;
                        }
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
