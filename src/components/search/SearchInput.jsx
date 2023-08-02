import 'core-js/features/url-search-params';
import React from 'react';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { InputBase, IconButton, Tooltip } from '@mui/material';
import { get } from 'lodash';
import { isAtGlobalSearch, getSiteTitle } from '../../common/utils';
import { withTranslation } from 'react-i18next';

class SearchInput extends React.Component {
  constructor(props){
    super(props);

    this.inputRef = React.createRef();

    this.state = {
      siteTitle: getSiteTitle(),
      input: undefined,
      queryParams: {},
    }
  }

  getValueFromURL(attr, defaultValue, props) {
    if(!props)
      props = this.props
    const queryParams = new URLSearchParams(get(props, 'location.search', ''))
    return queryParams.get(attr, defaultValue || '')
  }

  _listenKey = event => {
    const isCtrlS = event.keyCode === 83 && event.ctrlKey;
    if (!isCtrlS) {
      return;
    }

    this.inputRef.current.focus();
  };

  componentWillUnmount() {
    document.body.removeEventListener("keydown", this._listenKey);
  }

  componentDidMount() {
    document.body.addEventListener("keydown", this._listenKey);
    this.setState({
      input: this.getValueFromURL('q')
    })
  }

  componentDidUpdate(prevProps) {
    const currentSearchStrFromURL = this.getValueFromURL('q')
    const prevSearchStrFromURL = this.getValueFromURL('q', '', prevProps)

    if(
      (currentSearchStrFromURL !== prevSearchStrFromURL) ||
      (currentSearchStrFromURL && this.state.input === undefined)
    )
      this.setState({input: currentSearchStrFromURL})
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
    const { input } = this.state
    if(this.props.onSearch)
      this.props.onSearch(input)
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
    if(!this.props.nested) {
      const { input } = this.state
      let _input = input || '';
      const queryParams = new URLSearchParams(window.location.hash.split('?')[1])
      const resourceType = queryParams.get('type')
      let URL = '/search/'
      if(!_input) {
        setTimeout(() => {
          URL = '/search/'
          if(resourceType)
            URL += `?type=${resourceType}`
          window.location.hash = URL
        }, 500)
      }
      else {
        if(this.props.location.pathname === '/search/') {
          queryParams.set('q', _input)
          URL += `?${queryParams.toString()}`
        } else {
          URL +=`?q=${_input}`;
          if(resourceType)
            URL += `&type=${resourceType}`
        }
        window.location.hash = URL
      }
    }
  }

  render() {
    const { input, siteTitle } = this.state
    const { searchInputPlaceholder, nested, t } = this.props
    const marginBottom = (isAtGlobalSearch() || nested) ? '5px' : '0px';
    return (
      <div className='col-xs-12 no-side-padding' style={{marginBottom: marginBottom, display: 'flex', alignItems: 'center', border: '1px solid darkgray', borderRadius: '4px'}}>
        <InputBase
          style={{flex: 1, marginLeft: '10px'}}
          placeholder={searchInputPlaceholder || `${t('search.label')} ${siteTitle}`}
          inputProps={{ 'aria-label': 'search ocl' }}
          value={input || ''}
          fullWidth
          onChange={this.handleInputChange}
          onKeyPress={this.handleKeyPress}
          inputRef={this.inputRef}
        />
        {
          input &&
            <Tooltip arrow title={t('common.clear')}>
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
        <Tooltip arrow title={t('search.label')}>
          <IconButton
            type="submit"
            style={{padding: '10px'}}
            aria-label="search"
            onClick={this.performSearch}
            size="large">
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </div>
    );
  }
}

export default withTranslation('translations')(SearchInput);
