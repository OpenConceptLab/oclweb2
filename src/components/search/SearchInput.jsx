import React from 'react';
import { Search as SearchIcon } from '@material-ui/icons';
import { OutlinedInput, InputAdornment, Chip } from '@material-ui/core';
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
      let _input = input || '';
      const exactMatchStr = exactMatch === 'on' ? '&exactMatch=on' : '';
      const URL = `/search/?q=${_input}&type=concepts${exactMatchStr}`;
      window.location.hash = URL;
    }
  }

  handleExactMatchChange = () => {
    const isOn = this.state.exactMatch === 'on'
    this.setState({exactMatch: isOn ? 'off' : 'on'}, this.performSearch)
  }

  getExactMatchDOM() {
    const { moreControls, exactMatchOnNewLine } = this.props;
    const { exactMatch } = this.state;
    const isExactMatch = exactMatch === 'on';
    const className = exactMatchOnNewLine ? '' : 'col-sm-2 no-side-padding';
    const styles = exactMatchOnNewLine ? {textAlign: 'left'} : {marginTop: '8px'}
    return (
      <div className={className} style={styles}>
        <span style={{padding: '0 5px'}}>
          <Chip
            onClick={this.handleExactMatchChange}
            label='Exact Match'
            variant='outlined'
            color={isExactMatch ? 'primary' : 'default'}
            size="small"
          />
        </span>
        {moreControls}
      </div>
    )
  }

  render() {
    const { exactMatchOnNewLine } = this.props;
    const { input } = this.state
    const inputContainerClass = exactMatchOnNewLine ? 'col-sm-12 no-side-padding' : 'col-sm-10 no-side-padding';
    return (
      <div>
        <div className='col-sm-12 no-side-padding' style={{marginBottom: '5px'}}>
          <div className={inputContainerClass}>
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
          {
            !exactMatchOnNewLine &&
            this.getExactMatchDOM()
          }
        </div>
        {
          exactMatchOnNewLine &&
          this.getExactMatchDOM()
        }
      </div>
    )
  }
}

export default SearchInput;
