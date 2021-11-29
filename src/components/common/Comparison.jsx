import React from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import { Link } from 'react-router-dom';
import {
  TableContainer, Table, TableHead, TableBody, TableCell, TableRow,
  CircularProgress, IconButton, Tooltip
} from '@mui/material';
import {
  ArrowDropDown as ArrowDownIcon, ArrowDropUp as ArrowUpIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  get, startCase, map, isEmpty, isEqual, size, keys, maxBy, pickBy, forEach, includes, has, values
} from 'lodash';
import {
  formatDate, toParentURI, sortObjectBy,
  memorySizeOf, formatByteSize
} from '../../common/utils';
import {
  DIFF_BG_RED,
} from '../../common/constants';
import ComparisonAttributes from './ComparisonAttributes';
import ExtrasDiff from '../common/ExtrasDiff';

class Comparison extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isVersion: false,
      isLoadingLHS: true,
      isLoadingRHS: true,
      lhs: {},
      rhs: {},
      drawer: false,
      attributes: {}
    }
  }

  componentDidMount() {
    this.setObjectsForComparison()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.search !== this.props.search)
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
    const queryParams = new URLSearchParams(this.props.search)
    this.props.fetcher(queryParams.get('lhs'), 'lhs', 'isLoadingLHS', this.state).then((lhsData) => {
      this.props.fetcher(queryParams.get('rhs'), 'rhs', 'isLoadingRHS', lhsData).then((data) => {
        this.setState(data, ()=>{
          if(!this.props.postFetch) return
          const formatted = this.props.postFetch(data)
          this.setState(formatted)
        })
      })
    })
  }

  getAttributeValue(concept, attr, type) {
    let value = get(concept, attr)
    if (attr === 'extras')
      return JSON.stringify(value, undefined, 2)
    if(type === 'list') {
      if(isEmpty(value)) return '';
      else return value
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

  getExtraAttributeLabel(val) {
    if(!val)
      return ''
    return `${keys(val)[0]}: ${JSON.stringify(values(val)[0])}`
  }

  getListAttributeValue(attr, val) {
    if(includes(['extras'], attr))
      return this.getExtraAttributeLabel(val)
    if(includes(['parent_concept_urls', 'child_concept_urls'], attr))
      return val
  }

  getHeaderSubAttributes(concept) {
    if (!this.props.getHeaderSubAttributeValues) return null
    return (
      <div style={{margin: '5px 0px'}}>
        {this.props.getHeaderSubAttributeValues(concept, this.state.isVersion).map((attribute, i) => {
           if(attribute.url) {
             return (
               <span style={{marginLeft: i ? '10px': ''}} key={i}>
                 <span className='gray-italics'>{attribute.name}</span>
                 <Link to={toParentURI(attribute.url)}>
                   <span>{attribute.value}</span>
                 </Link>
               </span>
             )
           }
           else{
             return (
               <span style={{marginLeft: i ? '10px': ''}} key={i}>
                 <span className='gray-italics'>{attribute.name}</span>
                 <span>{attribute.value}</span>
               </span>
             )
           }
        })}
      </div>
    )
  }

  getHeaderCell = resource => {
    return (
      <TableCell colSpan="5" style={{width: '45%'}} key={resource.uuid || resource.id}>
        <div style={{fontSize: '14px'}}>
          {this.getHeaderSubAttributes(resource)}
        </div>
        <div style={{fontSize: '18px'}}>
          <Link to={encodeURI(resource.url)}>{resource.display_name || resource.id}</Link>
        </div>
      </TableCell>
    )
  }

  maxArrayElement(v1, v2) {
    return maxBy([v1, v2], size)
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
              const _lhsValCleaned = this.props.getListAttributeValue ? this.props.getListAttributeValue(attr, _lhsVal): this.getListAttributeValue(attr, _lhsVal)
              const _rhsValCleaned = this.props.getListAttributeValue ? this.props.getListAttributeValue(attr, _rhsVal): this.getListAttributeValue(attr, _rhsVal)
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
                        {this.props.getListAttributeValue ? this.props.getListAttributeValue(attr, _lhsVal, true): this.getListAttributeValue(attr, _lhsVal)}
                      </TableCell>
                      <TableCell colSpan='5' style={{width: '45%'}}>
                        {this.props.getListAttributeValue ? this.props.getListAttributeValue(attr, _rhsVal, true): this.getListAttributeValue(attr, _rhsVal)}
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
                    {this.props.getAttributeValue ? this.props.getAttributeValue(lhs, attr, type, true): this.getAttributeValue(lhs, attr, type) }
                  </TableCell>
                  <TableCell colSpan='5' style={{width: '45%'}}>
                    {this.props.getAttributeValue ? this.props.getAttributeValue(rhs, attr, type, true): this.getAttributeValue(rhs, attr, type)}
                  </TableCell>
                </React.Fragment>
              }
            </TableRow>
          )
        }
      </React.Fragment>
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
                        <IconButton onClick={this.onDrawerClick} size="large">
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
                      const lhsValue = this.props.getAttributeValue ? this.props.getAttributeValue(lhs, attr, type): this.getAttributeValue(lhs, attr, type)
                      const rhsValue = this.props.getAttributeValue ? this.props.getAttributeValue(rhs, attr, type): this.getAttributeValue(rhs, attr, type)
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
    );
  }
}

export default Comparison;
