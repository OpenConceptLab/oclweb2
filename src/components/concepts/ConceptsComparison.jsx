import React from 'react';
import {
  TableContainer, Table, TableHead, TableBody, TableCell, TableRow,
  Tooltip
} from '@material-ui/core';
import { Flag as FlagIcon } from '@material-ui/icons';
import { get, startCase, map, isEmpty, includes, isEqual } from 'lodash';
import APIService from '../../services/APIService';
import { formatDate } from '../../common/utils';

const ATTRIBUTES = {
  text1: ['datatype', 'display_locale', 'external_id'],
  list: ['names', 'descriptions'],
  text2: ['created_by', 'updated_by'],
  date: ['created_on', 'updated_on'],
}

const getLocaleLabel = locale => {
  const nameAttr = get(locale, 'name') ? 'name' : 'description';
  return (
    <React.Fragment key={locale.uuid}>
      <div className='flex-vertical-center'>
        <span className='gray-italics'>
          {get(locale, 'name_type') || get(locale, 'description_type')}
        </span>
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
          this.setState({[attr]: response.data, [loadingAttr]: false})
      })
    }
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

  getValue(concept, attr, type) {
    if(type === 'list') {
      if(includes(['names', 'descriptions'], attr)) {
        const locales = get(concept, attr)
        return isEmpty(locales) ? '-' : map(locales, getLocaleLabel)
      }
    } else if(type === 'date') {
      const date = get(concept, attr);
      return date ? formatDate(date) : '-';
    } else {
      return get(concept, attr, '-')
    }
  }

  render() {
    const { lhs, rhs } = this.state;
    return (
      <div className='col-md-12' style={{paddingTop: '10px', paddingBottom: '10px'}}>
        <TableContainer  style={{borderRadius: '4px'}}>
          <Table size='small'>
            <TableHead>
              <TableRow colSpan="12">
                <TableCell colSpan="2" style={{width: '20%'}}></TableCell>
                <TableCell colSpan="5" style={{width: '40%'}}>
                  <div style={{fontSize: '12px'}}>
                    {this.getConceptHeader(lhs)}
                  </div>
                  <div style={{fontSize: '18px'}}>
                    {get(lhs, 'display_name')}
                  </div>
                </TableCell>
                <TableCell colSpan="5" style={{width: '40%'}}>
                  <div style={{fontSize: '12px'}}>
                    {this.getConceptHeader(rhs)}
                  </div>
                  <div style={{fontSize: '18px'}}>
                    {get(rhs, 'display_name')}
                  </div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody style={{border: '1px solid lightgray'}}>
              {
                map(ATTRIBUTES, (attrs, type) => {
                  return map(attrs, attr => {
                    const isDiff = !isEqual(get(lhs, attr), get(rhs, attr));
                    const className = isDiff ? 'diff-red' : '';
                    return (
                      <TableRow key={attr} colSpan='12' className={className}>
                        <TableCell colSpan='2' style={{width: '20%', fontWeight: 'bold'}}>
                          {startCase(attr)}
                        </TableCell>
                        <TableCell colSpan='5' style={{width: '40%'}}>
                          {this.getValue(lhs, attr, type)}
                        </TableCell>
                        <TableCell colSpan='5' style={{width: '40%'}}>
                          {this.getValue(rhs, attr, type)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                })
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    )
  }
}

export default ConceptsComparison;
