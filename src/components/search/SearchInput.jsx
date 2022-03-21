import 'core-js/features/url-search-params';
import React from 'react';
import {
  Search as SearchIcon,
  CenterFocusStrong as ExactMatchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { InputBase, Divider, IconButton, Tooltip } from '@mui/material';
import { get } from 'lodash';
import { isAtGlobalSearch, getSiteTitle } from '../../common/utils';

class SearchInput extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      siteTitle: getSiteTitle(),
      input: undefined,
      exactMatch: 'off',
      queryParams: {},
    }
  }

  getValueFromURL(attr, defaultValue, props) {
    if(!props)
      props = this.props
    const queryParams = new URLSearchParams(get(props, 'location.search', ''))
    return queryParams.get(attr, defaultValue || '')
  }

  componentDidMount() {
    this.setState({
      input: this.getValueFromURL('q'), exactMatch: this.getValueFromURL('exactMatch')
    })
  }

  componentDidUpdate(prevProps) {
    const currentSearchStrFromURL = this.getValueFromURL('q')
    const currentExactMatchFromURL = this.getValueFromURL('exactMatch')
    const prevSearchStrFromURL = this.getValueFromURL('q', '', prevProps)
    const prevExactMatchFromURL = this.getValueFromURL('exactMatch', '', prevProps)

    if(
      (currentSearchStrFromURL !== prevSearchStrFromURL) ||
      (currentSearchStrFromURL && this.state.input === undefined)
    )
      this.setState({input: currentSearchStrFromURL})
    if(
      (currentExactMatchFromURL !== prevExactMatchFromURL) ||
      (currentExactMatchFromURL && !this.state.exactMatch)
    )
      this.setState({exactMatch: currentExactMatchFromURL})
  }

  handleKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.performSearch()
    }
    return false
  }

  performSearch = event => {
    if(event) {
      event.preventDefault()
      event.stopPropagation()
    }
    const { input, exactMatch } = this.state
    if(this.props.onSearch)
      this.props.onSearch(input, exactMatch)
    else
      this.moveToSearchPage()
  }

  clearSearch = () => {
    this.setState({input: ''}, this.performSearch)
  }

  handleInputChange = event => {
    this.setState({input: event.target.value}, () => {
      if(this.props.onChange)
        this.props.onChange(this.state.input)
    })
  }

  moveToSearchPage = () => {
    if(!isAtGlobalSearch()) {
      const { input, exactMatch } = this.state
      let _input = input || '';
      const exactMatchStr = exactMatch === 'on' ? '&exactMatch=on' : '';
      const URL = `/search/?q=${_input}${exactMatchStr}`;
      window.location.hash = URL;
    }
  }

  handleExactMatchChange = () => {
    const isOn = this.state.exactMatch === 'on'
    this.setState({exactMatch: isOn ? 'off' : 'on'}, this.performSearch)
  }

  render() {
    const { input, exactMatch, siteTitle } = this.state
    const { searchInputPlaceholder, nested, noExactMatch } = this.props
    const marginBottom = (isAtGlobalSearch() || nested) ? '5px' : '0px';
    return (
      <div className='col-xs-12 no-side-padding' style={{marginBottom: marginBottom, display: 'flex', alignItems: 'center', border: '1px solid darkgray', borderRadius: '4px'}}>
        <InputBase
          style={{flex: 1, marginLeft: '10px'}}
          placeholder={searchInputPlaceholder || `Search ${siteTitle}`}
          inputProps={{ 'aria-label': 'search ocl' }}
          value={input || ''}
          fullWidth
          onChange={this.handleInputChange}
          onKeyPress={this.handleKeyPress}
        />
        {
          input &&
          <Tooltip arrow title='Clear'>
            <IconButton
              type="submit"
              style={{padding: '10px'}}
              aria-label="clear"
              onClick={this.clearSearch}
              size="large">
              <ClearIcon />
            </IconButton>
          </Tooltip>
        }
        <Tooltip arrow title='Search'>
          <IconButton
            type="submit"
            style={{padding: '10px'}}
            aria-label="search"
            onClick={this.performSearch}
            size="large">
            <SearchIcon />
          </IconButton>
        </Tooltip>
        {
          !noExactMatch &&
          <React.Fragment>
            <Divider style={{height: '28px', margin: '4px'}} orientation="vertical" />
            <Tooltip arrow title='Exact Match'>
              <IconButton
                color={exactMatch === 'on' ? "primary" : "default"}
                style={{padding: '10px'}}
                aria-label="exact"
                onClick={this.handleExactMatchChange}
                size="large">
                <ExactMatchIcon />
              </IconButton>
            </Tooltip>
          </React.Fragment>
        }
      </div>
    );
  }
}

export default SearchInput;
