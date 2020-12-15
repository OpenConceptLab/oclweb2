import React from 'react';
import alertifyjs from 'alertifyjs';
import moment from 'moment';
import {
  get, cloneDeep, merge, forEach, includes, keys, pickBy, size, isEmpty, reject,
} from 'lodash';
import { CircularProgress, ButtonGroup, Button } from '@material-ui/core';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@material-ui/icons';
import APIService from '../../services/APIService';
import { BLUE, DEFAULT_LIMIT } from '../../common/constants';
import ChipDatePicker from '../common/ChipDatePicker';
import IncludeRetiredFilterChip from '../common/IncludeRetiredFilterChip';
import FilterButton from '../common/FilterButton';
import FilterDrawer from '../common/FilterDrawer';
import Results from './Results';
import ResultsInfinite from './ResultsInfinite';
import ResultsTable from './ResultsTable';
import SortButton from './SortButton';
import ResultsCountDropDown from '../common/ResultsCountDropDown';
import PageResultsLabel from './PageResultsLabel';
import SearchInput from './SearchInput';
import ResourcesHorizontal from './ResourcesHorizontal';
import ResourceTabs from './ResourceTabs';
//import Resources from './Resources';
import { fetchSearchResults, fetchCounts } from './utils';
import { getCurrentUserUsername } from '../../common/utils';
import LayoutToggle from '../common/LayoutToggle';
import InfiniteScrollChip from '../common/InfiniteScrollChip';

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
const CURRENT_USER_ID = getCurrentUserUsername();

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTable: true,
      isInfinite: false,
      page: 1,
      updatedSince: false,
      searchStr: '',
      exactMatch: 'off',
      resource: 'concepts',
      isLoading: false,
      sortParams: {sortDesc: 'last_update'},
      limit: DEFAULT_LIMIT,
      openFacetsDrawer: false,
      appliedFacets: {},
      includeRetired: false,
      pins: [],
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
    this.getUserPins()
  }

  setQueryParamsInState() {
    const queryParams = new URLSearchParams(this.props.location.search)
    const fixedFilters = this.props.fixedFilters;
    this.setState({
      isTable: queryParams.get('isTable') || get(fixedFilters, 'isTable') || this.state.isTable,
      isInfinite: queryParams.get('isInfinite') || get(fixedFilters, 'isInfinite'),
      resource: queryParams.get('type') || this.props.resource || 'concepts',
      page: queryParams.get('page') || 1,
      isLoading: true,
      searchStr: queryParams.get('q') || '',
      exactMatch: queryParams.get('exactMatch') || 'off',
      limit: parseInt(queryParams.get('limit')) || get(fixedFilters, 'limit') || DEFAULT_LIMIT,
    }, this.fetchNewResults)
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.search !== this.props.location.search)
      this.setQueryParamsInState()
    if(prevProps.baseURL !== this.props.baseURL && this.props.baseURL)
      this.setQueryParamsInState()

    if(prevProps.lastDeletedPinId !== this.props.lastDeletedPinId && this.props.lastDeletedPinId)
      this.deleteUserPin(this.props.lastDeletedPinId)
  }

  propogatePinChange = () => {
    if(this.props.onPinChange)
      this.props.onPinChange(this.state.pins)
  }

  getUserPins() {
    if(CURRENT_USER_ID)
      APIService.users(CURRENT_USER_ID).pins()
                .get()
                .then(response => this.setState({pins: response.data}, this.propogatePinChange))
  }

  createUserPin = (resourceType, resourceId) => {
    APIService.users(CURRENT_USER_ID).pins()
              .post({resource_type: resourceType, resource_id: resourceId})
              .then(response => {
                if(get(response, 'status') === 201) {
                  this.setState({pins: [...this.state.pins, response.data]}, () => {
                    this.propogatePinChange()
                  })
                }
              })
  }

  deleteUserPin = pinId => {
    if(pinId)
      APIService.users(CURRENT_USER_ID).pins(pinId)
                .delete()
                .then(response => {
                  if(get(response, 'status') === 204)
                    this.setState({pins: reject(this.state.pins, {id: pinId})}, this.propogatePinChange)
                })
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
          [resource]: this.prepareResponseForState(resource, response, resetItems)
        }
      })
    } else {
      this.setState({isLoading: false}, () => {
        alertifyjs.error('System encountered an error.')
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

  getCurrentResourceTotalResults() {
    const { resource, results } = this.state
    return get(results, `${resource}.total`, 0)
  }

  getFacetQueryParam() {
    const { appliedFacets } = this.state;
    const queryParam = {}
    forEach(
      appliedFacets, (value, field) => {
        queryParam[field] = keys(pickBy(value, Boolean)).join(',')
      }
    )

    return queryParam
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
        includeRetired,
      } = this.state;
      const queryParams = {
        q: searchStr, page: page, exact_match: exactMatch, limit: limit,
        includeRetired: includeRetired,
        verbose: includes(['sources', 'collections', 'organizations', 'users'], resource),
        ...this.getFacetQueryParam(),
      };
      if(updatedSince)
        queryParams['updatedSince'] = updatedSince
      let _resource = resource
      if(_resource === 'organizations')
        _resource = 'orgs'
      fetchSearchResults(
        _resource,
        {...queryParams, ...sortParams},
        this.props.baseURL,
        null,
        (response) => this.onSearchResultsLoad(resource, response, resetItems)
      )
      if(counts && !this.props.nested)
        fetchCounts(resource, queryParams, this.onCountsLoad)
    })
  }

  loadMore = () => {
    this.fetchNewResults({page: this.state.page + 1}, false, false);
  }

  onPageChange = page => {
    if(page !== this.state.page)
      this.fetchNewResults({page: page}, false, false)
  }

  onSortChange = params => {
    this.setState({sortParams: params}, () => this.fetchNewResults(null, false, true))
  }

  hasPrev() {
    const { resource, results } = this.state;
    return Boolean(get(results, `${resource}.prev`))
  }

  hasNext() {
    const { resource, results } = this.state;
    return Boolean(get(results, `${resource}.next`))
  }

  onPageNavButtonClick = isNext => {
    if(isNext)
      this.onPageChange(this.state.page + 1)
    else
      this.onPageChange(this.state.page - 1)
  }

  onResourceChange = resource => {
    const shouldGetCounts = !isEmpty(this.state.appliedFacets);
    this.setState({resource: resource, appliedFacets: {}}, () => this.fetchNewResults(null, shouldGetCounts, true))
  }

  onDateChange = date => {
    this.fetchNewResults({updatedSince: date}, true, true)
  }

  getUpdatedSinceText() {
    const { updatedSince } = this.state;
    if(updatedSince)
      return `Since: ${moment(updatedSince).format('MM/DD/YYYY')}`;
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
    const totalResults = this.getCurrentResourceTotalResults();
    const { nested, extraControls } = this.props;
    const {
      updatedSince, limit, appliedFacets, resource, includeRetired, isTable, isInfinite,
    } = this.state;
    const isDisabledFilters = includes(['organizations', 'users'], resource);
    return (
      <span style={{display: 'inline-flex', alignItems: 'center'}}>
        {
          extraControls &&
          <span style={{paddingRight: '5px'}}>
            {
              extraControls
            }
          </span>
        }
        {
          resource !== 'references' &&
          <span>
            <span style={{paddingRight: '5px'}}>
              <IncludeRetiredFilterChip applied={includeRetired} onClick={this.onClickIncludeRetired} size={nested ? 'small' : 'medium'} />
            </span>
            <span style={{paddingRight: '5px'}}>
              <ChipDatePicker onChange={this.onDateChange} label={updatedSinceText} date={updatedSince} size={nested ? 'small' : 'medium'} />
            </span>
            <span style={{paddingRight: '5px'}}>
              <FilterButton count={size(appliedFacets)} onClick={this.toggleFacetsDrawer} disabled={isDisabledFilters} label='More Filters' size={nested ? 'small' : 'medium'} />
            </span>
            {
              !isTable && <span style={{paddingRight: '5px'}}>
                <SortButton onChange={this.onSortChange} size={nested ? 'small' : 'medium'} />
              </span>
            }
          </span>

        }
        <span>
          <ResultsCountDropDown onChange={this.onLimitChange} defaultLimit={limit} total={totalResults} size={nested ? 'small' : 'medium'} />
        </span>
        <span style={{paddingLeft: '5px'}}>
          <LayoutToggle isTable={isTable} size={nested ? 'small' : 'medium'} onClick={this.onLayoutChange} />
        </span>
        {
          !isTable &&
          <span style={{paddingLeft: '5px'}}>
            <InfiniteScrollChip isInfinite={isInfinite} size={nested ? 'small' : 'medium'} onClick={this.onInfiniteToggle} />
          </span>
        }
      </span>
    )
  }

  onLimitChange = limit => {
    this.fetchNewResults({limit: limit}, false, true)
  }

  toggleFacetsDrawer = () => {
    this.setState({openFacetsDrawer: !this.state.openFacetsDrawer})
  }

  onCloseFacetsDrawer = () => {
    this.setState({openFacetsDrawer: false})
  }

  onApplyFacets = filters => {
    this.setState({appliedFacets: filters}, () => this.fetchNewResults(null, false, true))
  }

  render() {
    const { nested } = this.props;
    const {
      resource, results, isLoading, limit, sortParams, openFacetsDrawer, isTable, isInfinite, pins
    } = this.state;
    const searchResultsContainerClass = nested ? 'col-sm-12 no-side-padding' : 'col-sm-12 no-side-padding';
    const resourceResults = get(results, resource, {});
    const hasPrev = this.hasPrev()
    const hasNext = this.hasNext()
    return (
      <div className='col-sm-12' style={nested ? {padding: '0px'} : {paddingTop: '10px'}}>
        <div className={searchResultsContainerClass} style={!nested ? {marginTop: '5px'} : {}}>
          <div className='col-sm-10 no-side-padding' style={{textAlign: 'center'}}>
            <SearchInput
              {...this.props}
              onSearch={this.onSearch}
              exactMatchOnNewLine
              moreControls={this.getFilterControls()}
            />
          </div>
          <div className='col-sm-2 no-side-padding' style={{textAlign: 'right', marginTop: '7px'}}>
            <span className='col-sm-8 no-side-padding' style={{marginTop: '2px', textAlign: 'center'}}>
              <PageResultsLabel isInfinite={isInfinite} resource={resource} results={results[resource]} limit={limit} />
            </span>
            <span className='col-sm-4 no-side-padding'>
              <ButtonGroup size="small" color="primary" aria-label="outlined primary button group">
                <Button style={{padding: 0}} onClick={() => this.onPageNavButtonClick(false)} disabled={!hasPrev}>
                  <NavigateBeforeIcon width="10" />
                </Button>
                <Button style={{padding: 0}} onClick={() => this.onPageNavButtonClick(true)} disabled={!hasNext}>
                  <NavigateNextIcon width="10" />
                </Button>
              </ButtonGroup>
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
            <div className='col-sm-12 no-side-padding' style={{marginTop: '100px', textAlign: 'center'}}>
              <CircularProgress style={{color: BLUE}}/>
            </div> :
            <div className='col-sm-12 no-side-padding' style={{marginTop: '5px'}}>
              {
                isInfinite &&
                <ResultsInfinite resource={resource} results={resourceResults} onLoadMore={this.loadMore} />
              }
              {
                isTable &&
                <ResultsTable
                  resource={resource}
                  results={resourceResults}
                  onPageChange={this.onPageChange}
                  onSortChange={this.onSortChange}
                  sortParams={sortParams}
                  onCreatePin={this.createUserPin}
                  onDeletePin={this.deleteUserPin}
                  pins={pins}
                  nested={nested}
                />
              }
              {
                !isTable && !isInfinite &&
                <Results resource={resource} results={resourceResults} onPageChange={this.onPageChange} />
              }
            </div>
          }
        </div>
        <FilterDrawer
          open={openFacetsDrawer}
          onClose={this.onCloseFacetsDrawer}
          filters={get(results[resource], 'facets.fields', {})}
          onApply={this.onApplyFacets}
        />
      </div>
    );
  }
}

export default Search;
