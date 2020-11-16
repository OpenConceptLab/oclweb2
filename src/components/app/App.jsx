import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import { WHITE, BLACK } from '../../common/constants';
import './App.scss';
import SearchInput from '../search/SearchInput';
import Search from '../search/Search';
import ConceptHome from '../concepts/ConceptHome';
import MappingHome from '../mappings/MappingHome';
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
          <Switch>

            { /* Concept Details */ }
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/concepts/:concept([a-zA-Z0-9\-\.\_]+)/:conceptVersion([a-zA-Z0-9\-\.\_]+)"
              component={ConceptHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/concepts/:concept([a-zA-Z0-9\-\.\_]+)/:conceptVersion([a-zA-Z0-9\-\.\_]+)"
              component={ConceptHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/:version([a-zA-Z0-9\-\.\_]+)/concepts/:concept([a-zA-Z0-9\-\.\_]+)/:conceptVersion([a-zA-Z0-9\-\.\_]+)"
              component={ConceptHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/:version([a-zA-Z0-9\-\.\_]+)/concepts/:concept([a-zA-Z0-9\-\.\_]+)/:conceptVersion([a-zA-Z0-9\-\.\_]+)"
              component={ConceptHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/concepts/:concept([a-zA-Z0-9\-\.\_]+)"
              component={ConceptHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/concepts/:concept([a-zA-Z0-9\-\.\_]+)"
              component={ConceptHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/:version([a-zA-Z0-9\-\.\_]+)/concepts/:concept([a-zA-Z0-9\-\.\_]+)"
              component={ConceptHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/:version([a-zA-Z0-9\-\.\_]+)/concepts/:concept([a-zA-Z0-9\-\.\_]+)"
              component={ConceptHome}
            />

            { /* Mapping Details */ }
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/mappings/:mapping([a-zA-Z0-9\-\.\_]+)/:mappingVersion([a-zA-Z0-9\-\.\_]+)"
              component={MappingHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/mappings/:mapping([a-zA-Z0-9\-\.\_]+)/:mappingVersion([a-zA-Z0-9\-\.\_]+)"
              component={MappingHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/:version([a-zA-Z0-9\-\.\_]+)/mappings/:mapping([a-zA-Z0-9\-\.\_]+)/:mappingVersion([a-zA-Z0-9\-\.\_]+)"
              component={MappingHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/:version([a-zA-Z0-9\-\.\_]+)/mappings/:mapping([a-zA-Z0-9\-\.\_]+)/:mappingVersion([a-zA-Z0-9\-\.\_]+)"
              component={MappingHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/mappings/:mapping([a-zA-Z0-9\-\.\_]+)"
              component={MappingHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/mappings/:mapping([a-zA-Z0-9\-\.\_]+)"
              component={MappingHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/:version([a-zA-Z0-9\-\.\_]+)/mappings/:mapping([a-zA-Z0-9\-\.\_]+)"
              component={MappingHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/:version([a-zA-Z0-9\-\.\_]+)/mappings/:mapping([a-zA-Z0-9\-\.\_]+)"
              component={MappingHome}
            />
          </Switch>
        </div>

      </div>
    );
  }
}

export default App;

