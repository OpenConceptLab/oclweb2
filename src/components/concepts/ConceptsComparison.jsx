import React from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import { Link } from 'react-router-dom';
import {
  TableContainer, Table, TableHead, TableBody, TableCell, TableRow,
  CircularProgress, IconButton, Tooltip
} from '@material-ui/core';
import {
  ArrowDropDown as ArrowDownIcon, ArrowDropUp as ArrowUpIcon,
  Settings as SettingsIcon,
} from '@material-ui/icons';
import {
  get, startCase, map, isEmpty, includes, isEqual, size, filter, reject, keys, values,
  sortBy, findIndex, uniqBy, has, maxBy, cloneDeep, pickBy, forEach
} from 'lodash';
import APIService from '../../services/APIService';
import {
  formatDate, toObjectArray, toParentURI, sortObjectBy,
  memorySizeOf, formatByteSize
} from '../../common/utils';
import {
  DIFF_BG_RED,
} from '../../common/constants';
import ComparisonAttributes from './ComparisonAttributes';
import ExtrasDiff from '../common/ExtrasDiff';

const getLocaleLabelExpanded = (locale, formatted=false) => {
  if(!locale)
    return '';

  const nameAttr = has(locale, 'name') ? 'Name' : 'Description';
  const typeValue = get(locale, 'name_type') || get(locale, 'description_type') || '';
  const nameValue = get(locale, 'name') || get(locale, 'description');
  const preferredText = locale.locale_preferred ? 'True' : 'False';

  const label = [
    `Type: ${typeValue}`,
    `${nameAttr}: ${nameValue}`,
    `Locale: ${locale.locale}`,
    `Preferred: ${preferredText}`,
  ].join('\n')

  if(formatted)
    return <div key={label} style={{whiteSpace: 'break-spaces'}}>{label}</div>;

  return label;
}

const getMappingConceptName = (mapping, rel) => {
  return get(mapping, `${rel}_name`) || get(mapping, `${rel}_name_resolved`) || get(mapping, `${rel}.display_name`)
}

const getMappingLabel = (mapping, formatted=false) => {
  if(!mapping)
    return '';

  const label = [
    `UID: ${mapping.id}`,
    `Relationship: ${mapping.map_type}`,
    `Source: ${mapping.owner} / ${mapping.source}`,
    `From Concept Code: ${mapping.from_concept_code}`,
    `From Concept Name: ${getMappingConceptName(mapping, 'from_concept')}`,
    `To Concept Code: ${mapping.to_concept_code}`,
    `To Concept Name: ${getMappingConceptName(mapping, 'to_concept')}`,
  ].join('\n')

  if(formatted)
    return <div key={label} style={{whiteSpace: 'break-spaces'}}>{label}</div>;

  return label
}


class ConceptsComparison extends React.Component {
  constructor(props) {
    super(props);
    this.attributeState = {show: true, type: 'text'}
    this.state = {
      isVersion: false,
      isLoadingLHS: true,
      isLoadingRHS: true,
      lhs: {},
      rhs: {},
      drawer: false,
      attributes: {
        datatype: {...cloneDeep(this.attributeState), position: 1},
        display_locale: {...cloneDeep(this.attributeState), position: 2},
        external_id: {...cloneDeep(this.attributeState), position: 3},
        owner: {...cloneDeep(this.attributeState), type: 'textFormatted', position: 4},
        names: {...cloneDeep(this.attributeState), collapsed: true, type: 'list', position: 5},
        descriptions: {...cloneDeep(this.attributeState), collapsed: true, type: 'list', position: 6},
        parent_concept_urls: {...cloneDeep(this.attributeState), collapsed: true, type: 'list', position: 14},
        child_concept_urls: {...cloneDeep(this.attributeState), collapsed: true, type: 'list', position: 15},
        mappings: {...cloneDeep(this.attributeState), collapsed: true, type: 'list', position: 7},
        extras: {...cloneDeep(this.attributeState), collapsed: true, type: 'list', position: 8},
        retired: {...cloneDeep(this.attributeState), type: 'bool', position: 9},
        created_by: {...cloneDeep(this.attributeState), position: 10},
        updated_by: {...cloneDeep(this.attributeState), position: 11},
        created_on: {...cloneDeep(this.attributeState), type: 'date', position: 12},
        updated_on: {...cloneDeep(this.attributeState), type: 'date', position: 13},
      },
    }
  }

  componentDidMount() {
    this.setObjectsForComparison()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.search !== this.props.location.search)
      this.setObjectsForComparison()
  }

  onDrawerClick = () => {
    this.setState({drawer: !this.state.drawer})
  }

  reorder = (startIndex, endIndex) => {
    const { attributes } = this.state;
    const attrs = keys(attributes);
    const result = Array.from(attrs);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    const orderedAttrs = {};
    forEach(result, (attr, index) => {
      orderedAttrs[attr] = attributes[attr]
      orderedAttrs[attr].position = index + 1
    })

    return orderedAttrs;
  };


  onAttributeDragEnd = result => {
    if(result.destination && result.source.index !== result.destination.index)
      this.setState({attributes: this.reorder(result.source.index, result.destination.index)})
  }

  onToggleAttributeClick = attr => {
    this.setState({
      attributes: {
        ...this.state.attributes,
        [attr]: {
          ...this.state.attributes[attr],
          show: !this.state.attributes[attr].show
        }
      }
    })
  }

  onCollapseIconClick(attr) {
    this.setState({
      attributes: {
        ...this.state.attributes,
        [attr]: {
          ...this.state.attributes[attr],
          collapsed: !this.state.attributes[attr].collapsed
        }
      }
    })
  }

  setObjectsForComparison() {
    const queryParams = new URLSearchParams(this.props.location.search)
    this.fetchConcept(queryParams.get('lhs'), 'lhs', 'isLoadingLHS')
    this.fetchConcept(queryParams.get('rhs'), 'rhs', 'isLoadingRHS')
  }

  fetchConcept(uri, attr, loadingAttr) {
    if(uri && attr && loadingAttr) {
      const { isVersion } = this.state;
      const isAnyVersion = isVersion || uri.match(/\//g).length === 8;
      APIService.new().overrideURL(uri).get(null, null, {includeInverseMappings: true}).then(response => {
        if(get(response, 'status') === 200) {
          const newState = {...this.state}
          newState[attr] = this.formatConcept(response.data)
          newState[loadingAttr] = false
          newState.isVersion = isAnyVersion
          if(isAnyVersion) {
            newState.attributes['is_latest_version'] = {...cloneDeep(this.attributeState), type: 'bool', position: 14}
            newState.attributes['update_comment'] = {...cloneDeep(this.attributeState), position: 15}
          }
          this.setState(newState, this.sortMappings)
        }
      })
    }
  }

  formatConcept(concept) {
    concept.names = this.sortLocales(concept.names)
    concept.descriptions = this.sortLocales(concept.descriptions)
    concept.originalExtras = concept.extras
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
            <Link to={toParentURI(concept.url)}>
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
          {
            this.state.isVersion &&
            <span style={{marginLeft: '10px'}}>
              <span className='gray-italics'>VERSION:</span>
              <span>{concept.version}</span>
            </span>
          }
        </div>
      </React.Fragment>
    )
  }

  getValue(concept, attr, type, formatted=false) {
    let value = get(concept, attr)
    if (attr === 'extras')
      return JSON.stringify(value, undefined, 2)
    if(type === 'list') {
      if(isEmpty(value)) return '';
      if(includes(['names', 'descriptions'], attr))
        return map(value, locale => getLocaleLabelExpanded(locale, formatted))
      if (attr === 'mappings')
        return map(value, mapping => getMappingLabel(mapping, formatted));
      else
        return value
    } else if(type === 'date') {
      if(attr === 'created_on')
        value ||= get(concept, 'created_at')
      if(attr === 'updated_on')
        value ||= get(concept, 'updated_at')

      return value ? formatDate(value) : '';
    } else if (type === 'textFormatted') {
      if(attr === 'owner')
        return `${concept.owner_type}: ${concept.owner}`
    } else if (type === 'bool') {
      return value ? 'True' : 'False'
    } else {
      if(includes(['created_by', 'updated_by'], attr))
        value ||= get(concept, `version_${attr}`)
      if(attr === 'updated_by' && has(concept, 'version_created_by'))
        value ||= concept.version_created_by
      return value || '';
    }
  }

  maxArrayElement(v1, v2) {
    return maxBy([v1, v2], size)
  }

  getListAttrValue(attr, val, formatted=false) {
    if(includes(['names', 'descriptions'], attr))
      return getLocaleLabelExpanded(val, formatted)
    if(includes(['mappings'], attr))
      return getMappingLabel(val, formatted)
    if(includes(['extras'], attr))
      return this.getExtraAttributeLabel(val)
    if(includes(['parent_concept_urls', 'child_concept_urls'], attr))
      return val
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
    const isExtras = attr === 'extras';
    return (
      <React.Fragment key={attr}>
        {
          isExtras ?
          <ExtrasDiff lhs={lhs.originalExtras} rhs={rhs.originalExtras}  /> :
          (
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
                        compareMethod='diffLines'
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
                    compareMethod='diffLines'
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
          )
        }
      </React.Fragment>
    )
  }

  getHeaderCell = concept => {
    return (
      <TableCell colSpan="5" style={{width: '45%'}} key={concept.uuid || concept.id}>
        <div style={{fontSize: '14px'}}>
          {this.getHeaderSubAttributes(concept)}
        </div>
        <div style={{fontSize: '18px'}}>
          <Link to={concept.url}>{concept.display_name}</Link>
        </div>
      </TableCell>
    )
  }

  render() {
    const { lhs, rhs, isLoadingLHS, isLoadingRHS, attributes, drawer } = this.state;
    const isLoading = isLoadingLHS || isLoadingRHS;
    const visibleAttributes = sortObjectBy(pickBy(attributes, {show: true}), config => config.position)
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
                    <TableCell colSpan="2" style={{width: '10%'}}>
                      <Tooltip arrow title='Customize attributes' placement='top'>
                        <IconButton onClick={this.onDrawerClick}>
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    {
                      map([lhs, rhs], this.getHeaderCell)
                    }
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    map(visibleAttributes, (config, attr) => {
                      const type = config.type;
                      const lhsValue = this.getValue(lhs, attr, type);
                      const rhsValue = this.getValue(rhs, attr, type);
                      const isDiff = !isEqual(lhsValue, rhsValue);
                      const children = this.getAttributeDOM(attr, type, lhsValue, rhsValue, isDiff);
                      if(type === 'list') {
                        const lhsRawValue = lhs[attr];
                        const rhsRawValue = rhs[attr];
                        const lhsCount = lhsRawValue.length;
                        const rhsCount = rhsRawValue.length;
                        const hasKids = Boolean(lhsCount || rhsCount);
                        const styles = isDiff ? {background: DIFF_BG_RED} : {};
                        const isExpanded = !config.collapsed || !hasKids;
                        const isExtras = attr === 'extras';
                        let lhsSize, rhsSize;
                        let size = '';
                        if(isExtras && (!isEmpty(lhsRawValue) || !isEmpty(rhsRawValue))) {
                          lhsSize = memorySizeOf(lhsRawValue, false)
                          rhsSize = memorySizeOf(rhsRawValue, false)
                          const totalSize = lhsSize + rhsSize;
                          const tooMany = totalSize/1024 >= 99; // More than 95KB
                          size = `${formatByteSize(totalSize)}`;
                          size = tooMany ? `${size} (this may take some time)` : size
                        }
                        return (
                          <React.Fragment key={attr}>
                            <TableRow colSpan='12' onClick={() => this.onCollapseIconClick(attr)} style={{cursor: 'pointer'}}>
                              <TableCell colSpan='12' style={{ fontWeight: 'bold', fontSize: '0.875rem', ...styles }}>
                                <span className='flex-vertical-center'>
                                  <span style={{marginRight: '5px'}}>{`${startCase(attr)} (${lhsCount}/${rhsCount})`}</span>
                                  { size && <span className='byte-size'>{size}</span> }
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
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        }
        <ComparisonAttributes
          attributes={attributes}
          open={drawer}
          onClose={this.onDrawerClick}
          onCheckboxClick={this.onToggleAttributeClick}
          onDragEnd={this.onAttributeDragEnd}
        />
      </React.Fragment>
    )
  }
}

export default ConceptsComparison;
