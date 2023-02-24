import 'core-js/features/url-search-params';
import React from 'react';
import { withRouter } from "react-router";
import alertifyjs from 'alertifyjs';
import {
  get, set, cloneDeep, merge, forEach, includes, keys, pickBy, size, isEmpty, has, find, isEqual,
  map, omit, isString, values, omitBy, isNumber, filter
} from 'lodash';
import { Share as ShareIcon, AccountTreeOutlined as HierarchyIcon } from '@mui/icons-material'
import { CircularProgress, Chip, Tooltip } from '@mui/material';
import APIService from '../../services/APIService'
import { formatDate, copyURL, toRelativeURL, getParamsFromObject } from '../../common/utils';
import {
  BLUE, GREEN, WHITE, DEFAULT_LIMIT, TABLE_LAYOUT_ID, LIST_LAYOUT_ID
} from '../../common/constants';
import FilterButton from '../common/FilterButton';
import FilterDrawer from '../common/FilterDrawer';
import Results from './Results';
import ResultsTable from './ResultsTable';
import ConceptHierarchyResultsTable from './ConceptHierarchyResultsTable';
import SortButton from './SortButton';
import SearchInput from './SearchInput';
import SearchFilters from './SearchFilters';
import SearchByAttributeInput from './SearchByAttributeInput';
import ResourceTabs from './ResourceTabs';
import { fetchSearchResults, fetchCounts, fetchFacets } from './utils';
import { FACET_ORDER } from './ResultConstants';
import NumericalIDSort from './NumericalIDSort';
import GenericFilterChip from './GenericFilterChip';
import Breadcrumbs from '../sources/Breadcrumbs';
import ResponsiveDrawer from '../common/ResponsiveDrawer';
import ConceptHome from '../concepts/ConceptHome';
import MappingHome from '../mappings/MappingHome';
import { OperationsContext } from '../app/LayoutContext';

const resourceResultStruct = {
  isLoading: false,
  isLoadingCount: false,
  total: 0,
  pageCount: 1,
  pageNumber: 1,
  pages: 1,
  next: undefined,
  prev: undefined,
  facets: {},
  items: [],
}
const DEFAULT_SORT_PARAMS = {sortDesc: '_score'}
class Search extends React.Component {
  static contextType = OperationsContext
  constructor(props) {
    super(props);
    this.state = {
      width: false,
      selectedItem: false,
      isTable: has(props, 'fixedFilters.isTable') ? props.fixedFilters.isTable : true,
      isList: get(props, 'fixedFilters.isList', false),
      isInfinite: false,
      page: 1,
      updatedSince: false,
      searchStr: '',
      exactMatch: 'off',
      resource: 'concepts',
      isLoading: false,
      sortParams: DEFAULT_SORT_PARAMS,
      limit: DEFAULT_LIMIT,
      openFacetsDrawer: false,
      appliedFacets: {},
      viewFilters: {},
      fhirParams: {},
      staticParams: {},
      userFilters: {},
      isURLUpdatedByActionChange: false,
      facets: {},
      hierarchy: false,
      results: {
        concepts: cloneDeep(resourceResultStruct),
        mappings: cloneDeep(resourceResultStruct),
        sources: cloneDeep(resourceResultStruct),
        collections: cloneDeep(resourceResultStruct),
        organizations: cloneDeep(resourceResultStruct),
        users: cloneDeep(resourceResultStruct),
      }
    }
  }

  getLayoutTypeName = () => {
    const { isList } = this.state;
    if(isList)
      return LIST_LAYOUT_ID
    return TABLE_LAYOUT_ID
  }

  componentDidMount() {
    if(this.props.references)
      this.setState({results: {...this.state.results, references: cloneDeep(resourceResultStruct)}})
    this.setQueryParamsInState()
    if(!this.props.nested)
      this.interval = setInterval(this.setSearchContainerWidth, 100)
  }

  componentWillUnmount() {
    if(this.interval)
      clearInterval(this.interval)
  }

  getLayoutAttrValue(attr, type) {
    let result;
    const queryParams = new URLSearchParams(get(this.props, 'location.search'))
    const { fixedFilters } = this.props;
    if(queryParams.get(attr))
      result = queryParams.get(attr)
    else if(has(fixedFilters, attr))
      result = fixedFilters[attr]
    else
      result = this.state[attr]

    if(type === 'bool') {
      if(result === 'false')
        result = false
      if (result === 'true')
        result = true
    }
    else if(type === 'int')
      result = parseInt(result)
    else if(type === 'obj') {
      if(isString(result))
        try {
          result = JSON.parse(result)
        } catch (err) {
          //pass
        }
    }

    return result
  }

  formatResourceType = resource => {
    if(resource === 'user')
      return 'users'
    if(includes(['org', 'orgs', 'organization'], resource))
      return 'organizations'
    if(includes(['concept'], resource))
      return 'concepts'
    if(includes(['mapping'], resource))
      return 'mappings'
    if(includes(['source'], resource))
      return 'sources'
    if(includes(['collection'], resource))
      return 'collections'

    return resource || 'concepts'
  }

  setQueryParamsInState() {
    const queryParams = new URLSearchParams(get(this.props, 'location.search'))
    let userFilters = this.props.userFilters || {};

    if(this.props.extraControlFilters) {
      forEach(this.props.extraControlFilters, (definition, id) => {
        if(definition.default)
          userFilters[id] = definition.default
      })
    }

    let appliedFacets = {}
    const facetQuery = queryParams.get('facets') || false;
    if(facetQuery)
      try {
        appliedFacets = JSON.parse(facetQuery)
      } catch {
        appliedFacets = {}
      }

    const includeRetired = this.getLayoutAttrValue('includeRetired', 'bool') || (appliedFacets.retired?.false && appliedFacets.retired?.true)
    if(includeRetired) {
      set(appliedFacets, 'retired.true', includeRetired)
      set(appliedFacets, 'retired.false', includeRetired)
      set(appliedFacets, 'includeRetired.true', includeRetired)
    }

    this.setState({
      updatedSince: this.getLayoutAttrValue('updatedSince'),
      isTable: this.getLayoutAttrValue('isTable', 'bool'),
      isList: this.getLayoutAttrValue('isList', 'bool'),
      isInfinite: this.getLayoutAttrValue('isInfinite', 'bool'),
      limit: this.getLayoutAttrValue('limit', 'int'),
      page: this.getLayoutAttrValue('page', 'int'),
      sortParams: this.getLayoutAttrValue('sortParams', 'obj') || DEFAULT_SORT_PARAMS,
      resource: this.formatResourceType(queryParams.get('type') || this.props.resource || 'concepts'),
      isLoading: true,
      searchStr: queryParams.get('q') || '',
      exactMatch: queryParams.get('exactMatch') || 'off',
      viewFilters: this.props.viewFilters || {},
      userFilters: userFilters,
      fhirParams: this.props.fhirParams || {},
      staticParams: this.props.staticParams || {},
      appliedFacets: appliedFacets
    }, () => this.fetchNewResults(null, true, false))
  }

  componentDidUpdate(prevProps) {
    const { isURLUpdatedByActionChange } = this.state
    if(get(prevProps, 'location.search') !== get(this.props, 'location.search') && !isURLUpdatedByActionChange)
      this.setQueryParamsInState()
    if(prevProps.baseURL !== this.props.baseURL && this.props.baseURL && !isURLUpdatedByActionChange)
      this.setQueryParamsInState()
    if(!isEqual(prevProps.viewFilters, this.props.viewFilters) && !isURLUpdatedByActionChange)
      this.setQueryParamsInState()
    if(!isEqual(prevProps.fixedFilters, this.props.fixedFilters) && !isURLUpdatedByActionChange)
      this.setQueryParamsInState()
    if(!isEqual(prevProps.userFilters, this.props.userFilters) && !isURLUpdatedByActionChange)
      this.setQueryParamsInState()
    if(!isEqual(prevProps.extraControlFilters, this.props.extraControlFilters) && !isURLUpdatedByActionChange)
      this.setQueryParamsInState()
    if(!isEqual(prevProps.baseURL, this.props.baseURL)) {
      this.setQueryParamsInState()
    }
  }

  updateSummaryOnResult(resource, summary) {
    const newState = {...this.state}
    set(find(newState.results[resource].items, {uuid: summary.uuid}), 'summary', summary)
    this.setState(newState)
  }

  loadSummary(resource) {
    const resourceState = this.state.results[resource];
    if(!resourceState.tagsLoaded) {
      forEach(resourceState.items, item => {
        APIService.new().overrideURL(item.url).appendToUrl('summary/').get().then(response => {
          this.updateSummaryOnResult(resource, response.data)
        })
      })
    }
  }

  prepareFhirResponseForState(resource, response, resetItems) {
    const data = response.data
    let next = find(data.link, {relation: 'next'})
    if(next === 'null')
      next = null
    let previous = find(data.link, {relation: 'prev'}) || find(data.link, {relation: 'previous'})
    if(previous === 'null')
      previous = null
    let items = get(data, 'entry', [])
    if(this.state.isInfinite && !resetItems)
      items = [...this.state.results[resource].items, ...items]
    const numFound = parseInt(get(data, 'total')) || get(items, 'length') || 0; //1000
    const numReturned = parseInt(get(items, 'length')) || 0; //10
    const pageOffset = get(this.state.fhirParams, '_getpagesoffset') || 0; //10
    const limit = this.state.limit || DEFAULT_LIMIT; //10
    const pages = Math.ceil(numFound / limit) // 100
    const pageNumber = pageOffset ? ((pageOffset/limit) + 1) : 1
    return {
      total: numFound,
      pageCount: numReturned,
      pageNumber: pageNumber,
      pages: pages,
      next: next,
      prev: previous,
      items: items,
    }
  }

  prepareResponseForState(resource, response, resetItems) {
    const numFound = parseInt(get(response, 'headers.num_found', 0))
    const numReturned = parseInt(get(response, 'headers.num_returned', 0))
    const next = get(response, 'headers.next')
    const previous = get(response, 'headers.previous')
    let items = get(response, 'data', [])
    if(resource === 'references') {
      const includedReferences = filter(items, {include: true})
      const excludedReferences = filter(items, {include: false})
      items = [...includedReferences, ...excludedReferences]
    }
    if(this.state.isInfinite && !resetItems)
      items = [...this.state.results[resource].items, ...items]
    return {
      total: numFound,
      pageCount: numReturned,
      pageNumber: parseInt(get(response, 'headers.page_number', 1)),
      pages: parseInt(get(response, 'headers.pages', 1)),
      next: next,
      prev: previous,
      facets: this.state.facets,
      items: items,
    }
  }

  onSearchResultsLoad = (resource, response, resetItems) => {
    if(response.status === 200) {
      this.setState({
        isLoading: false,
        results: {
          ...this.state.results,
          [resource]: this.props.fhir ? this.prepareFhirResponseForState(resource, response, resetItems) : this.prepareResponseForState(resource, response, resetItems)
        }
      }, () => {
        if(includes(['sources', 'collections'], resource))
          this.loadSummary(resource)
      })
    } else if (get(response, 'detail'))
      this.setState({isLoading: false}, () => alertifyjs.error(response.detail, 0))
    else
      this.setState({isLoading: false}, () => {throw response})
  }

  onFacetsLoad = (response, resource) => {
    if(response.status === 200) {
      this.setState({facets: get(response, 'data.facets', {})}, () => {
        if(has(this.state, `results.${resource}.facets`)) {
          const newState = {...this.state}
          newState.results[resource].facets = this.state.facets
          this.setState(newState)
        }
      })
    }
  }

  onCountsLoad = (response, resource) => {
    if(resource === 'orgs')
      resource = 'organizations'
    if(response.status === 200) {
      this.setState({
        results: {
          ...this.state.results,
          [resource]: {
            total: parseInt(get(response, 'headers.num_found', 0)),
            isLoadingCount: false
          }
        }
      })
    }
  }

  onSearch = (value, exactMatch) => {
    this.fetchNewResults({searchStr: value, page: 1, exactMatch: exactMatch}, true, true, true)
  }

  onFhirSearch = params => this.setState(
    {fhirParams: {...params, _sort: this.state.fhirParams._sort || '_id'}},
    this.fetchNewResults
  )

  _getFacetQueryParam() {
    const { appliedFacets } = this.state;
    const queryParam = {}
    forEach(
      appliedFacets, (value, field) => {
        queryParam[field] = keys(pickBy(value, Boolean)).join(',')
      }
    )

    return queryParam
  }

  getFacetQueryParam() {
    return {...this._getFacetQueryParam(), ...this.state.viewFilters}
  }

  prepareBaseURL = () => {
    const { extraControlFilters, defaultURI } = this.props
    let baseURL = this.props.baseURL
    if(isEmpty(extraControlFilters) || !baseURL.includes('[:') || isEmpty(this.state.userFilters))
      return defaultURI || baseURL
    if(baseURL.includes('[:')) {
      const vars = baseURL.match(/\[:\w+]/g)
      let varValues = {}
      forEach(vars, _var => {
        let found;
        forEach(extraControlFilters, (data, key) => data.key === _var.replace('[:', '').replace(']', '') ? found = key : null)
        if(found)
          varValues[_var] = get(this.state.userFilters, found)
      })
      varValues = omitBy(varValues, v => !v)

      if(!varValues || isEmpty(varValues) || (values(varValues).length !== keys(varValues).length))
        return defaultURI || baseURL

      forEach(varValues, (value, _var) => baseURL = baseURL.replaceAll(_var, value))
      return baseURL
    }
  }

  filterQueryParamsFromUserFilters = () => pickBy(
    this.state.userFilters, (v, k) => includes(keys(pickBy(this.props.extraControlFilters, f => !f.url)), k)
  )

  fetchNewResults(attrsToSet, counts=true, resetItems=true, updateURL=false, facets=true) {
    if(!attrsToSet)
      attrsToSet = {}

    let newState = {...this.state}
    newState.isLoading = !this.state.isInfinite
    newState.selectedItem = false
    newState = merge(newState, attrsToSet)
    if(resetItems)
      newState.page = 1

    if(counts) {
      forEach(newState.results, resourceState => {
        resourceState.isLoadingCount = true
      })
    }
    if(!this.props.fhir)
      newState.isURLUpdatedByActionChange = true
    this.setState(newState, () => {
      const {
        resource, searchStr, page, exactMatch, sortParams, updatedSince, limit,
        fhirParams, staticParams
      } = this.state;
      const { configQueryParams, noQuery, noHeaders, fhir, hapi, paginationParams, onHierarchyToggle, hierarchy } = this.props;
      let queryParams = {};
      if(!noQuery) {
        queryParams = {
          q: searchStr || '', page: page, exact_match: exactMatch, limit: limit,
          verbose: includes(['sources', 'collections', 'organizations', 'users', 'references'], resource),
          ...this.getFacetQueryParam(),
        };
        if(onHierarchyToggle && resource === 'concepts') {
          queryParams['onlyParentLess'] = hierarchy
        }
        if(updatedSince)
          queryParams['updatedSince'] = updatedSince
      }
      let _resource = resource
      if(_resource === 'organizations')
        _resource = 'orgs'
      let params = {...staticParams, ...this.filterQueryParamsFromUserFilters()}
      if(!noQuery)
        params = {...params, ...queryParams, ...sortParams, ...(configQueryParams || {})}
      if(fhir) {
        if(hapi || paginationParams)
          params = {...params, ...fhirParams}
        else
          params = {...params, page: page, ...fhirParams}
      }

      const baseURL = this.prepareBaseURL()
      fetchSearchResults(
        _resource,
        params,
        baseURL,
        null,
        response => {
          this.searchURL = this.convertToExpressionURL(response.request.responseURL)
          if(this.props.onSearchResponse)
            this.props.onSearchResponse(response, this.searchURL)
          if(updateURL && !fhir)
            window.location.hash = this.getCurrentLayoutURL()
          this.onSearchResultsLoad(resource, response, resetItems)
          setTimeout(() => this.setState({isURLUpdatedByActionChange: false}), 1000)
          if(!noHeaders && facets && !fhir && resource !== 'references')
            fetchFacets(_resource, queryParams, baseURL, this.onFacetsLoad)
          if(counts && !this.props.nested)
            fetchCounts(_resource, queryParams, this.onCountsLoad)
        }
      )
    })
  }

  convertToExpressionURL = url => {
    const urlParts = url.split('?')
    const queryString = urlParts[1]
    if(queryString) {
      let queryParams = new URLSearchParams(queryString)
      queryParams.delete('sortDesc')
      queryParams.delete('sortAsc')
      queryParams.delete('verbose')
      if(this.props.asReference) {
        queryParams.delete('limit')
        queryParams.delete('page')
      }
      if(!queryParams.get('q'))
        queryParams.delete('q')
      if(queryParams.get('exact_match') === 'off')
        queryParams.delete('exact_match')

      const _string = queryParams.toString()
      if(_string)
        return urlParts[0] + '?' + _string
      return urlParts[0]
    }
    return url
  }

  loadMore = () => {
    this.fetchNewResults({page: this.state.page + 1}, false, false, true, false);
  }

  onPageChange = page => {
    if(page !== this.state.page) {
      if(this.props.fhir)
        this.setState({
          page: page,
          fhirParams: {
            ...this.state.fhirParams,
            _getpagesoffset: ((parseInt(page) - 1) * this.state.limit)
          }
        }, () => this.fetchNewResults(null, false, false))
      else
        this.fetchNewResults({page: page}, false, false, true, false)

    }
  }

  onSortChange = params => {
    if(this.props.fhir) {
      const _sort = params.sortAsc ? params.sortAsc : '-' + params.sortDesc;
      this.setState({
        sortParams: params,
        fhirParams: {...this.state.fhirParams, _sort: _sort}
      }, () => this.fetchNewResults(null, false, true))
    }
    else
      this.setState({sortParams: params}, () => this.fetchNewResults(null, false, true, true, false))
  }

  hasPrev() {
    const { resource, results } = this.state;
    const { fhir } = this.props;
    const prev = get(results, `${resource}.prev`);
    return fhir ?
           (get(prev, 'url') && Boolean(get(prev, 'url') !== 'null')) :
           Boolean(prev);
  }

  hasNext() {
    const { resource, results } = this.state;
    const { fhir } = this.props;
    const next = get(results, `${resource}.next`);
    return fhir ?
           (get(next, 'url') && Boolean(get(next, 'url') !== 'null')) :
           Boolean(next);
  }

  onPageNavButtonClick = isNext => {
    if(isNext)
      this.onPageChange(this.state.page + 1)
    else
      this.onPageChange(this.state.page - 1)
  }

  onResourceChange = resource => {
    const shouldGetCounts = !isEmpty(this.state.appliedFacets);

    this.setState(
      {resource: resource, appliedFacets: {}, sortParams: {sortDesc: '_score'}, userFilters: {}, width: false},
      () => this.fetchNewResults(null, shouldGetCounts, true, true)
    )
  }

  onDateChange = date => this.fetchNewResults({updatedSince: date}, true, true, true)

  getUpdatedSinceText() {
    const { updatedSince } = this.state;
    if(updatedSince)
      return `Since: ${formatDate(updatedSince)}`
    return 'All Time'
  }

  onLayoutChange = newLayoutId => {
    const existingLayoutId = this.getLayoutTypeName()
    if(newLayoutId === existingLayoutId)
      return
    const newState = { ...this.state }
    newState.isURLUpdatedByActionChange = true

    if(newLayoutId === LIST_LAYOUT_ID) {
      newState.isTable = false
      newState.isList = true
    }
    else {
      newState.isTable = true
      newState.isList = false
    }

    const newLayout = !newState.isTable
    if(newLayout && newState.isInfinite)
      newState.isInfinite = false

    this.setState(newState, () => {
      window.location.hash = this.getCurrentLayoutURL()

      setTimeout(() => this.setState({isURLUpdatedByActionChange: false}), 1000)
    })
  }

  onInfiniteToggle = () => this.setState({isInfinite: !this.state.isInfinite})

  onShareClick = () => copyURL(this.convertURLToFQDN(this.getCurrentLayoutURL().replace('#/', '/')))

  convertURLToFQDN = url => window.location.origin + '/#' + url

  getCurrentLayoutURL() {
    if(this.props.nested && this.props.asReference)
      return window.location.hash

    let url = this.props.match.url;
    let resource = this.state.resource || 'concepts'
    if(resource === 'organizations')
      resource = 'orgs'
    if(this.props.nested && !url.match('/' + resource))
      url += url.endsWith('/') ? resource : '/' + resource
    url += `?q=${this.state.searchStr || ''}`
    url += `&isTable=${this.state.isTable}`
    url += `&isList=${this.state.isList}`
    url += `&page=${this.state.page}`
    url += `&exactMatch=${this.state.exactMatch || 'off'}`
    if(!this.props.nested)
      url += `&type=${this.state.resource || 'concepts'}`
    if(this.state.limit !== DEFAULT_LIMIT)
      url += `&limit=${this.state.limit || DEFAULT_LIMIT}`
    if(!isEqual(this.state.sortParams, DEFAULT_SORT_PARAMS))
      url += `&sortParams=${JSON.stringify(this.state.sortParams)}`
    if(this.state.isInfinite)
      url += `&isInfinite=true`
    if(this.state.updatedSince)
      url += `&updatedSince=${this.state.updatedSince}`
    if(window.location.hash.includes('configs=true'))
      url += `&configs=true`
    if(window.location.hash.includes('new=true'))
      url += `&new=true`

    const appliedFacets = this.state.appliedFacets
    if(!isEmpty(appliedFacets)){
      url += `&facets=${JSON.stringify(omit(appliedFacets, 'includeRetired'))}`
    }

    return window.location.hash.split('?')[0] + '?' + url.split('?')[1];
  }

  getFilterControls() {
    const { nested, extraControls, fhir, extraControlFilters, asReference } = this.props;
    const {
      appliedFacets, resource,
      viewFilters, userFilters
    } = this.state;
    const isDisabledFilters = includes(['organizations', 'users'], resource);
    return (
      <React.Fragment>
        <span style={{display: 'inline-flex', alignItems: 'center', overflow: 'auto'}}>
          {
            !isDisabledFilters && !asReference && !fhir && resource !== 'references' &&
            <span className='filter-chip'>
              <FilterButton
                minWidth='inherit'
                count={size(appliedFacets)}
                onClick={this.toggleFacetsDrawer}
                disabled={isDisabledFilters}
                label='Filters'
                size={nested ? 'small' : 'medium'}
                isOpen={this.state.openFacetsDrawer}
              />
            </span>
          }
          {
            extraControlFilters &&
            map(extraControlFilters, (definition, id) => (
              <span className='filter-chip' key={id}>
                <GenericFilterChip
                  id={id}
                  size={nested ? 'small' : 'medium'}
                  onChange={this.onApplyUserFilters}
                  value={get(userFilters, id)}
                  {...definition}
                />
              </span>
            ))
          }
          {
            extraControls &&
            <span style={{paddingRight: '4px'}}>
              {
                extraControls
              }
            </span>
          }
          {
            !isEmpty(viewFilters) &&
            map(viewFilters, (value, attr) => (
              <span className='filter-chip' key={attr}>
                <Chip label={`${attr}=${value}`} color='primary' variant='outlined' size='small' />
              </span>
            ))
          }
        </span>
      </React.Fragment>
    )
  }

  onLimitChange = limit => this.props.fhir ?
                         this.setState({limit: limit, fhirParams: {...this.state.fhirParams, _count: limit, _getpagesoffset: 0}}, () => this.fetchNewResults(null, false, false)) :
                         this.fetchNewResults({limit: limit}, false, true, true, false)

  toggleFacetsDrawer = () => this.setState({openFacetsDrawer: !this.state.openFacetsDrawer}, () => {
    if(this.props.onFilterDrawerToggle)
      this.props.onFilterDrawerToggle()
  })

  onApplyFacets = (filters, updatedSince) => this.setState({appliedFacets: filters, updatedSince: updatedSince}, () => this.fetchNewResults(null, false, true, true, false))

  onApplyUserFilters = (id, value) => {
    let newFilters = {...this.state.userFilters}

    if(value)
      newFilters[id] = value
    else
      newFilters = omit(newFilters, id)

    this.setState({userFilters: newFilters}, () => this.fetchNewResults(null, false, true, true))
  }

  getContainerLayoutProps = () => {
    const layout = {width: 100, paddingRight: this.props.nested ? 0 : '10px', paddingLeft: this.props.nested ? 0: '10px', marginTop: this.props.nested ? 0 : '60px'}
    if(this.state.openFacetsDrawer && !this.props.nested) {
      layout.width -= 12
      layout.marginLeft = '12%'
      layout.paddingLeft = '5px'
    }
    if(this.state.selectedItem) {
      if(this.state.width) {
        const resourceDom = document.getElementById('resource-item-container')
        let itemWidth = 0
        if(resourceDom)
          itemWidth = resourceDom.getBoundingClientRect()?.width || 0
        layout.width = `calc(${layout.width}% - ${itemWidth}px)`
      }
      else
        layout.width -= 39.7
    }

    if(isNumber(layout.width))
      layout.width = `${layout.width}%`

    return layout
  }

  setSearchContainerWidth = () => {
    const el = document.getElementById('search-container')
    if(el) {
      const props = this.getContainerLayoutProps()
      const existingWidth = el.getBoundingClientRect()?.width || 0
      if(props.width !== existingWidth)
        el.style.width = props.width
    }
  }

  getMainContainerProps = () => {
    const layout = {zIndex: 1201, position: 'fixed'}
    if(this.state.openFacetsDrawer && !this.props.nested) {
      layout.width = '88.5%'
      layout.marginLeft = '12%'
      layout.padding = '0px 10px 0px 5px'
    } else {
      layout.paddingRight = '0'
      layout.paddingLeft = '0'
    }

    return layout
  }

  onDetailsToggle = item => this.setState({selectedItem: item, width: item ? this.state.width : false}, () => {
    const { setOperationItem, setParentResource } = this.context
    setOperationItem(item)
    setParentResource('source')
  })

  onWidthChange = newWidth => this.setState({width: newWidth})

  onHierarchyViewChange = () => this.setState({hierarchy: !this.props.hierarchy}, () => {
    this.fetchNewResults()
    this.props.onHierarchyToggle()
  })

  getBreadcrumbParams = () => {
    const { searchStr, selectedItem } = this.state
    let params = {search: searchStr ? `"${searchStr}"` : 'All Results'}
    if(selectedItem)
      params = {...params, ...getParamsFromObject(selectedItem)}
    return params
  }

  onCloseDetails = () => {
    this.setState({selectedItem: null, width: false})
  }

  render() {
    const { openOperations } = this.context;
    const {
      nested, pins, onPinCreate, onPinDelete, showPin, essentialColumns, onReferencesDelete,
      isVersionedObject, parentResource, newResourceComponent, noFilters, onSelectChange,
      onCreateSimilarClick, onCreateMappingClick, viewFields, noControls, fhir, hapi, onSelect,
      asReference, onHierarchyToggle, hierarchy
    } = this.props;
    const {
      resource, results, isLoading, sortParams, openFacetsDrawer, isTable, isInfinite, appliedFacets,
      selectedItem, limit
    } = this.state;
    const isInsideConfiguredOrg = isEqual(keys(this.props.match.params), ['org'])
    const resourceResults = get(results, resource, {});
    const isUnderUserHome = nested && parentResource === 'user';
    const shouldShowNewResourceComponent = isUnderUserHome && newResourceComponent;
    const layoutProps = this.getContainerLayoutProps()
    const showHierarchy = resource === 'concepts' && onHierarchyToggle && hierarchy
    return (
      <React.Fragment>
        <div className='col-xs-12' style={{...this.getMainContainerProps()}}>
          {
            !nested && !fhir &&
            <Breadcrumbs
              params={this.getBreadcrumbParams()}
              isVersionedObject
              selectedResource={selectedItem}
              onSplitViewClose={this.onCloseDetails}
            />
          }
        </div>
        <div id="search-container" className='col-xs-12' style={layoutProps}>
          <div className='col-xs-12 no-side-padding'>
            {
              nested &&
              <div className='col-xs-12 flex-vertical-center' style={{paddingLeft: 0, paddingRight: '3px'}}>
                {
                  fhir ?
                  <SearchByAttributeInput {...this.props} onSearch={this.onFhirSearch} /> :
                  <SearchInput {...this.props} onSearch={this.onSearch} />
                }
                {
                  shouldShowNewResourceComponent &&
                  <span style={{marginLeft: '15px'}}>{ newResourceComponent }</span>
                }
              </div>
            }
            {
              resource !== 'references' && !noFilters &&
              <div className='col-xs-12 no-side-padding' style={{display: 'flex'}}>
                <SearchFilters
                  nested={nested}
                  filterControls={this.getFilterControls()}
                  layoutControls={
                    <React.Fragment>
                      {
                        resource === 'concepts' && isTable && !asReference && !fhir &&
                        <span className='filter-chip'>
                          <NumericalIDSort selected={sortParams} onSelect={this.onSortChange} size={nested ? 'small' : 'medium'} />
                        </span>
                      }
                      {
                        !isTable && !fhir &&
                        <SortButton onChange={this.onSortChange} size={nested ? 'small' : 'medium'} resource={resource} sortOn={get(sortParams, 'sortDesc') || get(sortParams, 'sortAsc')} sortBy={get(sortParams, 'sortDesc') ? 'desc' : 'asc'} />
                      }
                      {
                        onHierarchyToggle && resource === 'concepts' && nested &&
                        <span className='filter-chip'>
                          <Chip
                            icon={<HierarchyIcon fontSize='small' />}
                                 size='small'
                      onClick={this.onHierarchyViewChange}
                                 label='Hierarchy'
                                 color={hierarchy ? 'primary' : 'secondary'}
                                 variant={hierarchy ? 'contained' : 'outlined'}
                          />
                        </span>
                      }
                      {
                        !fhir && !asReference &&
                        <span className='filter-chip'>
                          <Tooltip title='Copy Link to this results'>
                            <Chip
                        onClick={this.onShareClick}
                                icon={<ShareIcon fontSize='small' />}
                                label='Share'
                                color='secondary'
                                variant='outlined'
                                size={nested ? 'small' : 'medium'}
                            />
                          </Tooltip>
                        </span>
                      }
                    </React.Fragment>
                  }
                />
              </div>
            }
            {
              nested && asReference && this.searchURL &&
              <div className='col-sm-12 no-side-padding'>
                <div style={{width: '100%', display: 'inline-flex', marginTop: '4px', fontSize: '12px', fontWeight: 'bold'}}>
                  <span onClick={() => copyURL(toRelativeURL(this.searchURL))} style={{backgroundColor: GREEN, color: WHITE, padding: '4px', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px', border: `1px solid ${GREEN}`, textAlign: 'center', cursor: 'pointer'}}>
                    Copy Expression
                  </span>
                  <span onClick={() => copyURL(toRelativeURL(this.searchURL))} style={{color: GREEN, padding: '4px', borderTopRightRadius: '16px', borderBottomRightRadius: '16px', border: `1px solid ${GREEN}`, maxWidth: 'calc(100% - 105px)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', cursor: 'pointer'}}>
                    {toRelativeURL(this.searchURL)}
                  </span>
                </div>
              </div>
            }
            {
              !nested &&
              <div className='col-xs-12' style={{marginTop: '5px', padding: '0px'}}>
                <ResourceTabs isSplitView={Boolean(selectedItem)} active={resource} results={results} onClick={this.onResourceChange} />
              </div>
            }
            {
              isLoading && (showHierarchy || !isTable) ?
              <div className='col-xs-12 no-side-padding' style={{marginTop: '100px', textAlign: 'center', width: '100%'}}>
                <CircularProgress style={{color: BLUE}} disableShrink />
              </div> :
              <div className='col-xs-12 no-side-padding' style={{marginTop: '5px', width: '100%'}}>
                {
                  showHierarchy ?
                  <ConceptHierarchyResultsTable
                    results={resourceResults}
                    onPageChange={this.onPageChange}
                    onSelectChange={onSelectChange}
                    onCreateSimilarClick={onCreateSimilarClick}
                    onCreateMappingClick={onCreateMappingClick}
                    viewFields={viewFields}
                    onSelect={onSelect}
                  /> : (
                    isTable ?
                    <ResultsTable
                      isLoading={isLoading}
                      resource={resource}
                      results={resourceResults}
                      onPageChange={this.onPageChange}
                      onLimitChange={this.onLimitChange}
                      onSortChange={this.onSortChange}
                      sortParams={sortParams}
                      onPinCreate={onPinCreate}
                      onPinDelete={onPinDelete}
                      pins={pins}
                      nested={nested}
                      showPin={showPin}
                      essentialColumns={essentialColumns}
                      onReferencesDelete={onReferencesDelete}
                      isVersionedObject={isVersionedObject}
                      onSelectChange={onSelectChange}
                      onCreateSimilarClick={onCreateSimilarClick}
                      onCreateMappingClick={onCreateMappingClick}
                      viewFields={viewFields}
                      noControls={noControls}
                      fhir={fhir}
                      hapi={hapi}
                      history={this.props.history}
                      onSelect={onSelect}
                      asReference={asReference}
                      onIndependentDetailsToggle={this.onDetailsToggle}
                      onWidthChange={this.onWidthChange}
                      isInsideConfiguredOrg={isInsideConfiguredOrg}
                      limit={limit}
                    /> :
                    <Results
                      resource={resource}
                      results={resourceResults}
                      onPageChange={this.onPageChange}
                      onSelectChange={onSelectChange}
                      viewFields={viewFields}
                      onCreateSimilarClick={onCreateSimilarClick}
                      onCreateMappingClick={onCreateMappingClick}
                      onReferencesDelete={onReferencesDelete}
                      isInfinite={isInfinite}
                      onLoadMore={this.loadMore}
                      noControls={noControls}
                      history={this.props.history}
                      onSelect={onSelect}
                      asReference={asReference}
                    />
                  )
                }
              </div>
            }
          </div>
        </div>
        <FilterDrawer
          open={openFacetsDrawer}
          onClose={this.toggleFacetsDrawer}
          filters={get(results[resource], 'facets.fields', {})}
          facetOrder={get(FACET_ORDER, resource)}
          onApply={this.onApplyFacets}
          kwargs={get(this.props, 'match.params')}
          resource={resource}
          appliedFacets={appliedFacets}
          updatedSinceText={this.getUpdatedSinceText()}
          updatedSince={this.state.updatedSince}
          onUpdateSinceChange={this.onDateChange}
        />
        {
          selectedItem &&
          <ResponsiveDrawer
            width={openOperations ? '28.5%' : '38.5%'}
            paperStyle={{background: '#f1f1f1', marginTop: isInsideConfiguredOrg ? '60px' : '120px', right: openOperations ? '350px' : 0}}
            variant='persistent'
            isOpen
            noToolbar
            onClose={this.onCloseDetails}
            onWidthChange={newWidth => this.onWidthChange(newWidth)}
            formComponent={
              <div className='col-xs-12 no-side-padding' style={{backgroundColor: '#f1f1f1'}}>
                {
                  selectedItem.concept_class ?
                  <ConceptHome
                    global
                    scoped
                    singleColumn
                    showActions={isInsideConfiguredOrg}
                                onClose={isInsideConfiguredOrg ? this.onCloseDetails : null}
                                concept={selectedItem}
                                location={{pathname: selectedItem.url}}
                                match={{params: {conceptVersion: (selectedItem.uuid !== selectedItem.versioned_object_id.toString() || window.location.hash.includes('/collections/') || !selectedItem.is_latest_version) ? selectedItem.version : null }}}
                  /> :
                  <MappingHome
                    global
                    scoped
                    singleColumn
                    noRedirect
                    showActions={isInsideConfiguredOrg}
                                onClose={isInsideConfiguredOrg ? this.onCloseDetails : null}
                                mapping={selectedItem}
                                location={{pathname: selectedItem.url}}
                                match={{params: {mappingVersion: (selectedItem.uuid !== selectedItem.versioned_object_id.toString() || window.location.hash.includes('/collections/') || !selectedItem.is_latest_version) ? selectedItem.version : null}}}
                  />
                }
              </div>
            }
          />
        }
      </React.Fragment>
    );
  }
}

export default withRouter(Search);
