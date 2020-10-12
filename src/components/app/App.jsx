import React, { Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, IconButton, Button, InputBase, OutlinedInput, InputAdornment } from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';
import { WHITE, BLACK } from '../../common/constants';
import './App.scss';
import SearchInput from '../search/SearchInput';
import Search from '../search/Search';
import { Route, Switch, Link } from 'react-router-dom';
import { isAtGlobalSearch } from '../../common/utils';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchResults: undefined,
    }
  }

  handleSearchResults = results => {
    this.setState({searchResults: results}, () => {
      window.location.hash = 'search'
    })
  }

  render() {
    const { searchResults } = this.state;
    return (
      <div>
        <AppBar position="static" variant="outlined" style={{backgroundColor: WHITE, color: BLACK}}>
          <Toolbar>
            <Typography variant="h6" className="brand col-sm-1">
              <Link className="no-anchor-styles" to="/">OCL</Link>
            </Typography>
            {
              !isAtGlobalSearch() &&
              <div className="col-sm-6">
                <SearchInput {...this.props} handleSearchResults={this.handleSearchResults} />
              </div>
            }
          </Toolbar>
        </AppBar>
        <div className="content">
          {
            isAtGlobalSearch() &&
            <Search {...this.props} />
          }
        </div>

      </div>
    );
  }
}

export default App;

