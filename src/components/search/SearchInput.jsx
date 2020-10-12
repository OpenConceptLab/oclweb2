import React from 'react';
import { Search as SearchIcon } from '@material-ui/icons';
import { OutlinedInput, InputAdornment, FormControlLabel, Checkbox, Chip } from '@material-ui/core';
import { get } from 'lodash';
import APIService from '../../services/APIService';
import { isAtGlobalSearch } from '../../common/utils';

class SearchInput extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      input: undefined,
      exactMatch: 'off',
      queryParams: {},
    }
  }


  getValueFromURL(attr, defaultValue, props) {
    if(!props)
      props = this.props
    const queryParams = new URLSearchParams(props.location.search)
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
    if (event.key === 'Enter')
      this.performSearch()
  }

  performSearch() {
    const { input, exactMatch } = this.state
    if(this.props.onSearch)
      this.props.onSearch(input, exactMatch)
    else
      this.moveToSearchPage()
  }

  handleInputChange = event => {
    this.setState({input: event.target.value})
  }

  moveToSearchPage = () => {
    if(!isAtGlobalSearch()) {
      const { input, exactMatch } = this.state
      const exactMatchStr = exactMatch === 'on' ? '&exactMatch=on' : '';
      const URL = `/search/?q=${input}&type=concepts${exactMatchStr}`;
      window.location.hash = URL;
    }
  }

  handleExactMatchChange = () => {
    const isOn = this.state.exactMatch === 'on'
    this.setState({exactMatch: isOn ? 'off' : 'on'}, this.performSearch)
  }

  render() {
    const { input, exactMatch } = this.state
    const isExactMatch = exactMatch === 'on';
    return (
      <div className='col-sm-12 no-side-padding'>
        <div className='col-sm-10 no-side-padding'>
          <OutlinedInput
            id="outlined-adornment-weight"
            endAdornment={<InputAdornment position="end"><SearchIcon /></InputAdornment>}
            aria-describedby="outlined-weight-helper-text"
            labelWidth={0}
            placeholder="Search OCL"
            className="search-input"
            fullWidth
            onKeyPress={this.handleKeyPress}
            value={input}
            onChange={this.handleInputChange}
          />
        </div>
        <div className='col-sm-2' style={{padding: '9px'}}>
          <Chip
            onClick={this.handleExactMatchChange}
            label='Exact Match'
            variant='outlined'
            color={isExactMatch ? 'primary' : 'default'}
            size="small"
          />
        </div>
      </div>
    )
  }
}

export default SearchInput;
