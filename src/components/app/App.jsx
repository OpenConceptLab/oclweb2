import React, { Component } from 'react';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import { WHITE, BLACK } from '../../common/constants';
import './App.scss';
import SearchInput from '../search/SearchInput';
import Search from '../search/Search';
import { Link } from 'react-router-dom';
import { isAtGlobalSearch } from '../../common/utils';

class App extends Component {
  handleSearchResults = results => {
    this.setState({searchResults: results}, () => {
      window.location.hash = 'search'
    })
  }

  render() {
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

