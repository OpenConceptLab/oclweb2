import React from 'react';
import { withRouter } from "react-router";
import alertifyjs from 'alertifyjs';
import {
  get, set, cloneDeep, merge, forEach, includes, keys, pickBy, size, isEmpty, has, find, isEqual,
  map, omit, isString, values, omitBy
} from 'lodash';
import { Share as ShareIcon } from '@mui/icons-material'
import { CircularProgress, Chip, Tooltip } from '@mui/material';
import APIService from '../../services/APIService'
import { formatDate, copyURL, toRelativeURL } from '../../common/utils';
import {
  BLUE, GREEN, WHITE, DEFAULT_LIMIT, TABLE_LAYOUT_ID, LIST_LAYOUT_ID, SPLIT_LAYOUT_ID
} from '../../common/constants';
import ChipDatePicker from '../common/ChipDatePicker';
import IncludeRetiredFilterChip from '../common/IncludeRetiredFilterChip';
import FilterButton from '../common/FilterButton';
import FilterDrawer from '../common/FilterDrawer';
import Results from './Results';
import ResultsTable from './ResultsTable';
import SortButton from './SortButton';
import PageResultsLabel from './PageResultsLabel';
import SearchInput from './SearchInput';
import SearchFilters from './SearchFilters';
import SearchByAttributeInput from './SearchByAttributeInput';
import ResourceTabs from './ResourceTabs';
import { fetchSearchResults, fetchCounts, fetchFacets } from './utils';
import LayoutToggle from '../common/LayoutToggle';
import InfiniteScrollChip from '../common/InfiniteScrollChip';
import { FACET_ORDER } from './ResultConstants';
import BestMatchSort from './BestMatchSort';
import NumericalIDSort from './NumericalIDSort';
import NavigationButtonGroup from './NavigationButtonGroup';
import GenericFilterChip from './GenericFilterChip';

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
  constructor(props) {
    super(props);
    this.state = {
      width: false,
      detailsView: false,
      isTable: has(props, 'fixedFilters.isTable') ? props.fixedFilters.isTable : true,
      isList: get(props, 'fixedFilters.isList', false),
      isSplit: get(props, 'fixedFilters.isSplit', false),
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
      includeRetired: false,
      userFilters: {},
      isURLUpdatedByActionChange: false,
      facets: {},
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
    const { isList, isSplit } = this.state;
    if(isList)
      return LIST_LAYOUT_ID
    if(isSplit)
      return SPLIT_LAYOUT_ID
    return TABLE_LAYOUT_ID
  }

  componentDidMount() {
    if(this.props.references)
      this.setState({results: {...this.state.results, references: cloneDeep(resourceResultStruct)}})
    this.setQueryParamsInState()
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

  setQueryParamsInState() {
    const queryParams = new URLSearchParams(get(this.props, 'location.search'))
    let userFilters = this.props.userFilters || {};

    if(this.props.extraControlFilters) {
      forEach(this.props.extraControlFilters, (definition, id) => {
        if(definition.default)
          userFilters[id] = definition.default
      })
    }

    this.setState({
      updatedSince: this.getLayoutAttrValue('updatedSince'),
      includeRetired: this.getLayoutAttrValue('includeRetired', 'bool'),
      isTable: this.getLayoutAttrValue('isTable', 'bool'),
      isList: this.getLayoutAttrValue('isList', 'bool'),
      isSplit: this.getLayoutAttrValue('isSplit', 'bool'),
      isInfinite: this.getLayoutAttrValue('isInfinite', 'bool'),
      limit: this.getLayoutAttrValue('limit', 'int'),
      page: this.getLayoutAttrValue('page', 'int'),
      sortParams: this.getLayoutAttrValue('sortParams', 'obj') || DEFAULT_SORT_PARAMS,
      resource: queryParams.get('type') || this.props.resource || 'concepts',
      isLoading: true,
      searchStr: queryParams.get('q') || '',
      exactMatch: queryParams.get('exactMatch') || 'off',
      viewFilters: this.props.viewFilters || {},
      userFilters: userFilters,
      fhirParams: this.props.fhirParams || {},
      staticParams: this.props.staticParams || {},
    }, () => {
      if(this.state.isSplit && !this.props.splitView && this.props.onSplitViewToggle)
        this.props.onSplitViewToggle()
      this.fetchNewResults(null, true, false)
    })
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

  getFacetQueryParam() {
    const { appliedFacets, viewFilters } = this.state;
    const queryParam = {}
    forEach(
      appliedFacets, (value, field) => {
        queryParam[field] = keys(pickBy(value, Boolean)).join(',')
      }
    )

    return {...queryParam, ...viewFilters}
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

  filterQueryParamsfromUserFilters = () => pickBy(
    this.state.userFilters, (v, k) => includes(keys(pickBy(this.props.extraControlFilters, f => !f.url)), k)
  )

  fetchNewResults(attrsToSet, counts=true, resetItems=true, updateURL=false, facets=true) {
    if(!attrsToSet)
      attrsToSet = {}

    let newState = {...this.state}
    newState.isLoading = !this.state.isInfinite
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
        includeRetired, fhirParams, staticParams
      } = this.state;
      const { configQueryParams, noQuery, noHeaders, fhir, hapi, paginationParams } = this.props;
      let queryParams = {};
      if(!noQuery) {
        queryParams = {
          q: searchStr || '', page: page, exact_match: exactMatch, limit: limit,
          includeRetired: includeRetired,
          verbose: includes(['sources', 'collections', 'organizations', 'users'], resource),
          ...this.getFacetQueryParam(),
        };
        if(updatedSince)
          queryParams['updatedSince'] = updatedSince
      }
      let _resource = resource
      if(_resource === 'organizations')
        _resource = 'orgs'
      let params = {...staticParams, ...this.filterQueryParamsfromUserFilters()}
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
        }
      )
      if(counts && !this.props.nested)
        fetchCounts(_resource, queryParams, this.onCountsLoad)
      if(!noHeaders && facets && !fhir && resource !== 'references')
        fetchFacets(_resource, queryParams, baseURL, this.onFacetsLoad)
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
      if(!queryParams.get('q'))
        queryParams.delete('q')
      if(queryParams.get('exact_match') === 'off')
        queryParams.delete('exact_match')
      if(queryParams.get('includeRetired') === 'false')
        queryParams.delete('includeRetired')

      return urlParts[0] + '?' + queryParams.toString()
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
      {resource: resource, appliedFacets: {}, sortParams: {sortDesc: '_score'}, userFilters: {}},
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

  onClickIncludeRetired = () => this.fetchNewResults({includeRetired: !this.state.includeRetired}, true, true, true, false)

  onLayoutChange = newLayoutId => {
    const existingLayoutId = this.getLayoutTypeName()
    if(newLayoutId === existingLayoutId)
      return
    const newState = { ...this.state }
    newState.isURLUpdatedByActionChange = true

    if(newLayoutId === LIST_LAYOUT_ID) {
      newState.isTable = false
      newState.isList = true
      newState.isSplit = false
    }
    else if(newLayoutId === SPLIT_LAYOUT_ID) {
      newState.isTable = false
      newState.isList = false
      newState.isSplit = true
    } else {
      newState.isTable = true
      newState.isList = false
      newState.isSplit = false
    }

    const newLayout = !newState.isTable
    if(newLayout && newState.isInfinite)
      newState.isInfinite = false

    this.setState(newState, () => {
      window.location.hash = this.getCurrentLayoutURL()

      if(includes([newLayoutId, existingLayoutId], SPLIT_LAYOUT_ID) && this.props.onSplitViewToggle)
        this.props.onSplitViewToggle()

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
    url += `&isSplit=${this.state.isSplit}`
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
    if(this.state.includeRetired)
      url += `&includeRetired=true`
    if(this.state.updatedSince)
      url += `&updatedSince=${this.state.updatedSince}`
    if(window.location.hash.includes('configs=true'))
      url += `&configs=true`
    if(window.location.hash.includes('new=true'))
      url += `&new=true`

    return window.location.hash.split('?')[0] + '?' + url.split('?')[1];
  }

  getFilterControls() {
    const updatedSinceText = this.getUpdatedSinceText();
    const { nested, extraControls, fhir, extraControlFilters, parentResource, asReference } = this.props;
    const {
      updatedSince, appliedFacets, resource, includeRetired, isTable, isInfinite,
      viewFilters, sortParams, userFilters
    } = this.state;
    const isDisabledFilters = includes(['organizations', 'users'], resource);
    const isSourceChild = includes(['concepts', 'mappings'], resource);
    const sortDesc = get(sortParams, 'sortDesc')
    const sortAsc = get(sortParams, 'sortAsc')
    const sortOn = sortDesc || sortAsc;
    const sortBy = sortDesc ? 'desc' : 'asc'
    return (
      <React.Fragment>
        <span style={{display: 'inline-flex', alignItems: 'center', overflow: 'auto'}}>
          {
            extraControls &&
            <span style={{paddingRight: '4px'}}>
              {
                extraControls
              }
            </span>
          }
          {
            resource !== 'references' && !fhir &&
            <React.Fragment>
              {
                includes(['concepts', 'mappings'], resource) &&
                <span style={{paddingRight: '4px'}}>
                  <IncludeRetiredFilterChip applied={includeRetired} onClick={this.onClickIncludeRetired} size={nested ? 'small' : 'medium'} />
                </span>
              }
              <span style={{paddingRight: '4px'}}>
                <ChipDatePicker onChange={this.onDateChange} label={updatedSinceText} date={updatedSince} size={nested ? 'small' : 'medium'} />
              </span>
              <span style={{paddingRight: '4px', cursor: isDisabledFilters ? 'not-allowed' : 'pointer'}}>
                <FilterButton count={size(appliedFacets)} onClick={this.toggleFacetsDrawer} disabled={isDisabledFilters} label='More Filters' size={nested ? 'small' : 'medium'} />
              </span>
              {
                resource === 'concepts' && isTable && !asReference &&
                <span style={{paddingRight: '4px'}}>
                  <NumericalIDSort selected={sortParams} onSelect={this.onSortChange} size={nested ? 'small' : 'medium'} />
                </span>
              }
              {
                isTable ?
                <span>
                  <BestMatchSort selected={sortParams} onSelect={this.onSortChange} size={nested ? 'small' : 'medium'} />
                </span> :
                <span style={{paddingRight: '4px'}}>
                  <SortButton onChange={this.onSortChange} size={nested ? 'small' : 'medium'} resource={resource} sortOn={sortOn} sortBy={sortBy} />
                </span>
              }
            </React.Fragment>
          }
          {
            resource !== 'references' && !fhir && !asReference &&
            <span style={{paddingLeft: '4px'}}>
              <LayoutToggle layoutId={this.getLayoutTypeName()} size={nested ? 'small' : 'medium'} onClick={this.onLayoutChange} includeSplitView={nested && isSourceChild && parentResource === 'source'} />
            </span>
          }
          {
            !isTable &&
            <span style={{paddingLeft: '4px'}}>
              <InfiniteScrollChip isInfinite={isInfinite} size={nested ? 'small' : 'medium'} onClick={this.onInfiniteToggle} />
            </span>
          }
          {
            !isEmpty(viewFilters) &&
            map(viewFilters, (value, attr) => (
              <span style={{paddingLeft: '4px'}} key={attr}>
                <Chip label={`${attr}=${value}`} color='primary' variant='outlined' size='small' />
              </span>
            ))
          }
          {
            extraControlFilters &&
            map(extraControlFilters, (definition, id) => (
              <span style={{paddingLeft: '4px'}} key={id}>
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
            resource !== 'references' && !fhir && !asReference &&
            <span style={{paddingLeft: '4px'}}>
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
        </span>
      </React.Fragment>
    )
  }

  onLimitChange = limit => this.props.fhir ?
                         this.setState({limit: limit, fhirParams: {...this.state.fhirParams, _count: limit, _getpagesoffset: 0}}, () => this.fetchNewResults(null, false, false)) :
                         this.fetchNewResults({limit: limit}, false, true, true, false)

  toggleFacetsDrawer = () => this.setState({openFacetsDrawer: !this.state.openFacetsDrawer})

  onCloseFacetsDrawer = () => this.setState({openFacetsDrawer: false})

  onApplyFacets = filters => this.setState(
    {appliedFacets: filters}, () => this.fetchNewResults(null, false, true, false, false)
  )

  onApplyUserFilters = (id, value) => {
    let newFilters = {...this.state.userFilters}

    if(value)
      newFilters[id] = value
    else
      newFilters = omit(newFilters, id)

    this.setState({userFilters: newFilters}, () => this.fetchNewResults(null, false, true, true))
  }

  getContainerWidth = () => {
    if(this.state.detailsView) {
      if(this.state.width)
        return `calc(100% - ${this.state.width - 15}px)`
      return '70%'
    }
    return '100%'
  }

  onDetailsToggle = state => this.setState({detailsView: state})

  onWidthChange = newWidth => this.setState({width: newWidth})

  render() {
    const {
      nested, pins, onPinCreate, onPinDelete, showPin, essentialColumns, onReferencesDelete,
      isVersionedObject, parentResource, newResourceComponent, noFilters, noNav, onSelectChange,
      onCreateSimilarClick, onCreateMappingClick, viewFields, noControls, fhir, hapi, onSelect,
      asReference
    } = this.props;
    const {
      resource, results, isLoading, limit, sortParams, openFacetsDrawer, isTable, isInfinite,
      isSplit
    } = this.state;
    const searchResultsContainerClass = nested ? 'col-sm-12 no-side-padding' : 'col-sm-12 no-side-padding';
    const resourceResults = get(results, resource, {});
    const hasPrev = this.hasPrev()
    const hasNext = this.hasNext()
    const isUnderUserHome = nested && parentResource === 'user';
    const shouldShowNewResourceComponent = isUnderUserHome && newResourceComponent;
    const newWidth = this.getContainerWidth()
    return (
      <div className='col-xs-12' style={nested ? {padding: '0px', width: newWidth} : {paddingTop: '10px', width: newWidth}}>
        <div className={searchResultsContainerClass} style={!nested ? {marginTop: '5px'} : {}}>
          <div className='col-sm-9 col-xs-7 no-side-padding' style={{textAlign: 'center'}}>
            {
              fhir ?
              <SearchByAttributeInput {...this.props} onSearch={this.onFhirSearch} /> :
              <SearchInput {...this.props} onSearch={this.onSearch} />
            }
          </div>
          <div className='col-xs-3 no-side-padding flex-vertical-center' style={{marginTop: '8px'}}>
            <span style={{margin: '0 20px', marginTop: '-4px'}}>
              <PageResultsLabel isInfinite={isInfinite} resource={resource} results={results[resource]} limit={limit} onChange={this.onLimitChange} disabled={fhir && !hapi} />
            </span>
            <span>
              {
                !noNav && (
                  shouldShowNewResourceComponent ?
                  newResourceComponent :
                  <NavigationButtonGroup
                    onClick={this.onPageNavButtonClick}
                    prev={hasPrev}
                    next={hasNext}
                  />
                )
              }
            </span>
          </div>
          {
            resource !== 'references' &&
            <div className='col-sm-12 no-side-padding'>
              <SearchFilters nested={nested} controls={!noFilters && this.getFilterControls()} />
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
              <ResourceTabs active={resource} results={results} onClick={this.onResourceChange} />
            </div>
          }
          {
            isLoading ?
            <div className='col-xs-12 no-side-padding' style={{marginTop: '100px', textAlign: 'center', width: '100%'}}>
              <CircularProgress style={{color: BLUE}}/>
            </div> :
            <div className='col-xs-12 no-side-padding' style={{marginTop: '5px', width: '100%'}}>
              {
                isTable ?
                <ResultsTable
                  resource={resource}
                  results={resourceResults}
                  onPageChange={this.onPageChange}
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
                  splitView={isSplit}
                  asReference={asReference}
                />
              }
            </div>
          }
        </div>
        <FilterDrawer
          open={openFacetsDrawer}
          onClose={this.onCloseFacetsDrawer}
          filters={get(results[resource], 'facets.fields', {})}
          facetOrder={get(FACET_ORDER, resource)}
          onApply={this.onApplyFacets}
          kwargs={get(this.props, 'match.params')}
          resource={resource}
        />
      </div>
    );
  }
}

export default withRouter(Search);
