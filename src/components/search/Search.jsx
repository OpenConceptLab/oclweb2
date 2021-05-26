import React from 'react';
import {
  get, set, cloneDeep, merge, forEach, includes, keys, pickBy, size, isEmpty, has, find, isEqual,
  map
} from 'lodash';
import { CircularProgress, Chip } from '@material-ui/core';
import APIService from '../../services/APIService'
import { formatDate } from '../../common/utils';
import { BLUE, DEFAULT_LIMIT } from '../../common/constants';
import ChipDatePicker from '../common/ChipDatePicker';
import IncludeRetiredFilterChip from '../common/IncludeRetiredFilterChip';
import FilterButton from '../common/FilterButton';
import FilterDrawer from '../common/FilterDrawer';
import Results from './Results';
import ResultsTable from './ResultsTable';
import SortButton from './SortButton';
import PageResultsLabel from './PageResultsLabel';
import SearchInput from './SearchInput';
import SearchByAttributeInput from './SearchByAttributeInput';
import ResourcesHorizontal from './ResourcesHorizontal';
import ResourceTabs from './ResourceTabs';
//import Resources from './Resources';
import { fetchSearchResults, fetchCounts } from './utils';
import LayoutToggle from '../common/LayoutToggle';
import InfiniteScrollChip from '../common/InfiniteScrollChip';
import { FACET_ORDER } from './ResultConstants';
import BestMatchSort from './BestMatchSort';
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

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTable: has(props, 'fixedFilters.isTable') ? props.fixedFilters.isTable : true,
      isInfinite: false,
      page: 1,
      updatedSince: false,
      searchStr: '',
      exactMatch: 'off',
      resource: 'concepts',
      isLoading: false,
      sortParams: {sortDesc: '_score'},
      limit: DEFAULT_LIMIT,
      openFacetsDrawer: false,
      appliedFacets: {},
      viewFilters: {},
      fhirParams: {},
      staticParams: {},
      includeRetired: false,
      userFilters: {},
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

  componentDidMount() {
    if(this.props.references)
      this.setState({results: {...this.state.results, references: cloneDeep(resourceResultStruct)}})
    this.setQueryParamsInState()
  }

  getLayoutAttrValue(attr) {
    const queryParams = new URLSearchParams(get(this.props, 'location.search'))
    const { fixedFilters } = this.props;
    if(has(queryParams, attr))
      return queryParams.get(attr)
    if(has(fixedFilters, attr))
      return fixedFilters[attr]

    return this.state[attr]
  }

  setQueryParamsInState() {
    const queryParams = new URLSearchParams(get(this.props, 'location.search'))
    const fixedFilters = this.props.fixedFilters;
    this.setState({
      isTable: this.getLayoutAttrValue('isTable'),
      isInfinite: this.getLayoutAttrValue('isInfinite'),
      resource: queryParams.get('type') || this.props.resource || 'concepts',
      page: queryParams.get('page') || 1,
      isLoading: true,
      searchStr: queryParams.get('q') || '',
      exactMatch: queryParams.get('exactMatch') || 'off',
      limit: parseInt(queryParams.get('limit')) || get(fixedFilters, 'limit') || DEFAULT_LIMIT,
      viewFilters: this.props.viewFilters || {},
      sortParams: get(fixedFilters, 'sortParams') || this.state.sortParams,
      fhirParams: this.props.fhirParams || {},
      staticParams: this.props.staticParams || {},
    }, this.fetchNewResults)
  }

  componentDidUpdate(prevProps) {
    if(get(prevProps, 'location.search') !== get(this.props, 'location.search')) {
      this.setQueryParamsInState()
    }
    if(prevProps.baseURL !== this.props.baseURL && this.props.baseURL) {
      this.setQueryParamsInState()
    }
    if(!isEqual(prevProps.viewFilters, this.props.viewFilters)) {
      this.setQueryParamsInState()
    }
    if(!isEqual(prevProps.fixedFilters, this.props.fixedFilters)) {
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
    const facets = get(response, 'data.facets', {})
    let items = get(response, 'data.results', [])
    if(this.state.isInfinite && !resetItems)
      items = [...this.state.results[resource].items, ...items]
    return {
      total: numFound,
      pageCount: numReturned,
      pageNumber: parseInt(get(response, 'headers.page_number', 1)),
      pages: parseInt(get(response, 'headers.pages', 1)),
      next: next,
      prev: previous,
      facets: facets,
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
    } else {
      this.setState({isLoading: false}, () => {
        throw response
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
    this.fetchNewResults({searchStr: value, page: 1, exactMatch: exactMatch}, true, true)
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

  fetchNewResults(attrsToSet, counts=true, resetItems=true) {
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
    this.setState(newState, () => {
      const {
        resource, searchStr, page, exactMatch, sortParams, updatedSince, limit,
        includeRetired, fhirParams, staticParams, userFilters
      } = this.state;
      const { configQueryParams, noQuery, noHeaders, fhir, hapi } = this.props;
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
      let params = {...staticParams, ...userFilters}
      if(!noQuery)
        params = {...params, ...queryParams, ...sortParams, ...(configQueryParams || {})}
      if(fhir) {
        if(hapi)
          params = {...params, ...fhirParams}
        else
          params = {...params, page: page, ...fhirParams}
      }
      fetchSearchResults(
        _resource,
        params,
        !noHeaders,
        this.props.baseURL,
        null,
        response => this.onSearchResultsLoad(resource, response, resetItems)
      )
      if(counts && !this.props.nested)
        fetchCounts(_resource, queryParams, this.onCountsLoad)
    })
  }

  loadMore = () => {
    this.fetchNewResults({page: this.state.page + 1}, false, false);
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
        this.fetchNewResults({page: page}, false, false)

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
      this.setState({sortParams: params}, () => this.fetchNewResults(null, false, true))
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
      () => this.fetchNewResults(null, shouldGetCounts, true)
    )
  }

  onDateChange = date => {
    this.fetchNewResults({updatedSince: date}, true, true)
  }

  getUpdatedSinceText() {
    const { updatedSince } = this.state;
    if(updatedSince)
      return `Since: ${formatDate(updatedSince)}`
    return 'All Time'
  }

  onClickIncludeRetired = () => {
    this.fetchNewResults({includeRetired: !this.state.includeRetired}, true, true)
  }

  onLayoutChange = () => {
    const newLayout = !this.state.isTable
    let isInfinite = this.state.isInfinite
    if(newLayout && isInfinite)
      isInfinite = false

    this.setState({ isTable: !this.state.isTable, isInfinite: isInfinite })
  }

  onInfiniteToggle = () => {
    this.setState({isInfinite: !this.state.isInfinite})
  }

  getFilterControls() {
    const updatedSinceText = this.getUpdatedSinceText();
    const { nested, extraControls, fhir, extraControlFilters } = this.props;
    const {
      updatedSince, appliedFacets, resource, includeRetired, isTable, isInfinite,
      viewFilters, sortParams, userFilters
    } = this.state;
    const isDisabledFilters = includes(['organizations', 'users'], resource);
    const sortDesc = get(sortParams, 'sortDesc')
    const sortAsc = get(sortParams, 'sortAsc')
    const sortOn = sortDesc || sortAsc;
    const sortBy = sortDesc ? 'desc' : 'asc'
    return (
      <span style={{display: 'inline-flex', alignItems: 'center', width: 'max-content'}}>
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
          <span>
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
              isTable ?
              <span>
                <BestMatchSort selected={sortParams} onSelect={this.onSortChange} size={nested ? 'small' : 'medium'} />
              </span> :
              <span style={{paddingRight: '4px'}}>
                <SortButton onChange={this.onSortChange} size={nested ? 'small' : 'medium'} resource={resource} sortOn={sortOn} sortBy={sortBy} />
              </span>
            }
          </span>

        }
        {
          resource !== 'references' && !fhir &&
          <span style={{paddingLeft: '4px'}}>
            <LayoutToggle isTable={isTable} size={nested ? 'small' : 'medium'} onClick={this.onLayoutChange} />
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
      </span>
    )
  }

  onLimitChange = limit => this.props.fhir ?
                         this.setState({limit: limit, fhirParams: {...this.state.fhirParams, _count: limit, _getpagesoffset: 0}}, () => this.fetchNewResults(null, false, false)) :
                         this.fetchNewResults({limit: limit}, false, true)

  toggleFacetsDrawer = () => this.setState({openFacetsDrawer: !this.state.openFacetsDrawer})

  onCloseFacetsDrawer = () => this.setState({openFacetsDrawer: false})

  onApplyFacets = filters => this.setState(
    {appliedFacets: filters}, () => this.fetchNewResults(null, false, true)
  )

  onApplyUserFilters = (id, value) => this.setState(
    {userFilters: value ? {[id]: value} : {}}, () => this.fetchNewResults(null, false, true)
  )

  render() {
    const {
      nested, pins, onPinCreate, onPinDelete, showPin, essentialColumns, onReferencesDelete,
      isVersionedObject, parentResource, newResourceComponent, noFilters, noNav, onSelectChange,
      onCreateSimilarClick, onCreateMappingClick, viewFields, noControls, fhir, hapi
    } = this.props;
    const {
      resource, results, isLoading, limit, sortParams, openFacetsDrawer, isTable, isInfinite
    } = this.state;
    const searchResultsContainerClass = nested ? 'col-sm-12 no-side-padding' : 'col-sm-12 no-side-padding';
    const resourceResults = get(results, resource, {});
    const hasPrev = this.hasPrev()
    const hasNext = this.hasNext()
    const isUnderUserHome = nested && parentResource === 'user';
    const shouldShowNewResourceComponent = isUnderUserHome && newResourceComponent;
    return (
      <div className='col-sm-12' style={nested ? {padding: '0px'} : {paddingTop: '10px'}}>
        <div className={searchResultsContainerClass} style={!nested ? {marginTop: '5px'} : {}}>
          <div className='col-sm-9 no-side-padding' style={{textAlign: 'center', marginBottom: '5px'}}>
            {
              fhir ?
              <SearchByAttributeInput
                {...this.props}
                onSearch={this.onFhirSearch}
              /> :
              <SearchInput
                {...this.props}
                onSearch={this.onSearch}
                exactMatchOnNewLine
                moreControls={!noFilters && this.getFilterControls()}
              />
            }
          </div>
          <div className='col-sm-3 no-side-padding flex-vertical-center' style={{marginTop: '8px'}}>
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
            !nested &&
            <div className='col-sm-12 search-resources' style={{marginTop: '10px', display: 'none'}}>
              <ResourcesHorizontal active={resource} results={results} onClick={this.onResourceChange} />
            </div>
          }
          {
            !nested &&
            <div className='col-sm-12' style={{marginTop: '5px', padding: '0px'}}>
              <ResourceTabs active={resource} results={results} onClick={this.onResourceChange} />
            </div>
          }
          {
            isLoading ?
            <div className='col-sm-12 no-side-padding' style={{marginTop: '100px', textAlign: 'center', width: '100%'}}>
              <CircularProgress style={{color: BLUE}}/>
            </div> :
            <div className='col-sm-12 no-side-padding' style={{marginTop: '5px', width: '100%'}}>
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

export default Search;
