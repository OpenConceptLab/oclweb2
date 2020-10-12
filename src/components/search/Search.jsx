import React from 'react';
import alertifyjs from 'alertifyjs';
import moment from 'moment';
import SearchInput from './SearchInput';
import Resources from './Resources';
import { fetchSearchResults, fetchCounts } from './utils';
import { get, cloneDeep, merge, forEach } from 'lodash';
import { CircularProgress, ButtonGroup, Button } from '@material-ui/core';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@material-ui/icons';
import { BLUE } from '../../common/constants';
import Results from './Results';
import ResultsInfinite from './ResultsInfinite';
import ResultsTable from './ResultsTable';
import SortButton from './SortButton';
import PageResultsLabel from './PageResultsLabel';
import ChipDatePicker from '../common/ChipDatePicker';

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
    this.isInfinite = false;
    this.state = {
      page: 1,
      updatedSince: false,
      searchStr: '',
      exactMatch: 'off',
      resource: 'concepts',
      isLoading: false,
      sortParams: {sortDesc: 'last_update'},
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
    this.setQueryParamsInState()
  }

  setQueryParamsInState() {
    const queryParams = new URLSearchParams(this.props.location.search)
    this.isInfinite = queryParams.get('isInfinite', false)
    this.isTable = queryParams.get('isTable', false)
    this.setState({
      resource: queryParams.get('type') || 'concepts',
      page: queryParams.get('page') || 1,
      isLoading: true,
      searchStr: queryParams.get('q') || '',
      exactMatch: queryParams.get('exactMatch') || 'off',
    }, this.fetchNewResults)
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.search !== this.props.location.search)
      this.setQueryParamsInState()
  }

  prepareResponseForState(resource, response, resetItems) {
    const numFound = parseInt(get(response, 'headers.num_found', 0))
    const numReturned = parseInt(get(response, 'headers.num_returned', 0))
    const next = get(response, 'headers.next')
    const previous = get(response, 'headers.previous')
    const facets = get(response, 'data.facets', {})
    let items = get(response, 'data.results', [])
    if(this.isInfinite && !resetItems)
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
    if(
      value !== this.state.searchStr ||
      exactMatch !== this.state.exactMatch
    )
      this.fetchNewResults(
        {searchStr: value, page: 1, exactMatch: exactMatch},
        true,
        true
      )
  }

  fetchNewResults(attrsToSet, counts=true, resetItems=true) {
    if(!attrsToSet)
      attrsToSet = {}

    let newState = {...this.state}
    newState.isLoading = !this.isInfinite
    newState = merge(newState, attrsToSet)
    if(resetItems)
      newState.page = 1

    if(counts) {
      forEach(newState.results, resourceState => {
        resourceState.isLoadingCount = true
      })
    }
    this.setState(newState, () => {
      const { resource, searchStr, page, exactMatch, sortParams, updatedSince } = this.state;
      const queryParams = {q: searchStr, page: page, exact_match: exactMatch};
      if(updatedSince)
        queryParams['updatedSince'] = updatedSince
      fetchSearchResults(
        resource,
        {...queryParams, ...sortParams},
        null,
        (response) => this.onSearchResultsLoad(resource, response, resetItems)
      )
      if(counts)
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
    this.fetchNewResults({resource: resource}, false, true)
  }

  onDateChange = date => {
    this.fetchNewResults({updatedSince: date}, true, true)
  }

  getUpdatedSinceText() {
    const { updatedSince } = this.state;
    if(updatedSince)
      return `Since: ${moment(updatedSince).format('MM/DD/YY')}`;
    return 'All Time'
  }

  getFilterControls() {
    const updatedSinceText = this.getUpdatedSinceText();
    const { updatedSince } = this.state;
    return (
      <span style={{display: 'inline-flex'}}>
        <span style={{paddingRight: '5px'}}>
          <ChipDatePicker onChange={this.onDateChange} label={updatedSinceText} date={updatedSince} size='small' />
        </span>
        <span>
          <SortButton onChange={this.onSortChange} />
        </span>
      </span>
    )
  }

  render() {
    const { resource, results, isLoading  } = this.state;
    const resourceResults = get(results, resource, {});
    const hasPrev = this.hasPrev()
    const hasNext = this.hasNext()
    return (
      <div className='col-sm-12' style={{paddingTop: '10px'}}>
        <div className='col-sm-3'>
          <Resources active={resource} results={results} onClick={this.onResourceChange} />
        </div>
        <div className='col-sm-9 no-left-padding'>
          <div className='col-sm-8 no-side-padding' style={{textAlign: 'center'}}>
            <SearchInput
              {...this.props}
              onSearch={this.onSearch}
              exactMatchOnNewLine
              moreControls={this.getFilterControls()}
            />
          </div>
          <div className='col-sm-4 no-side-padding' style={{textAlign: 'center', marginTop: '7px'}}>
            <span className='col-sm-9 no-side-padding' style={{marginTop: '2px',}}>
              <PageResultsLabel resource={resource} results={results[resource]} />
            </span>
            <span className='col-sm-3 no-side-padding' style={{textAlign: 'right'}}>
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
            isLoading ?
            <div style={{marginTop: '100px', textAlign: 'center'}}>
              <CircularProgress style={{color: BLUE}}/>
            </div> :
            <div className='col-sm-12 no-side-padding' style={{marginTop: '10px'}}>
              {
                this.isInfinite &&
                <ResultsInfinite resource={resource} results={resourceResults} onLoadMore={this.loadMore} />
              }
              {
                this.isTable &&
                <ResultsTable resource={resource} results={resourceResults} onPageChange={this.onPageChange} />
              }
              {
                !this.isTable && !this.isInfinite &&
                <Results resource={resource} results={resourceResults} onPageChange={this.onPageChange} />
              }
            </div>
          }
        </div>
      </div>
    );
  }
}

export default Search;
