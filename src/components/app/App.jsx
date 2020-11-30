import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import { WHITE, BLACK } from '../../common/constants';
import './App.scss';
import SearchInput from '../search/SearchInput';
import Search from '../search/Search';
import ConceptHome from '../concepts/ConceptHome';
import MappingHome from '../mappings/MappingHome';
import SourceHome from '../sources/SourceHome';
import CollectionHome from '../collections/CollectionHome';
import OrgHome from '../orgs/OrgHome';
import UserHome from '../users/UserHome';
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

            { /* Concept Home */ }
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

            { /* Mapping Home */ }
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

            { /* Source Home */ }
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/:version([a-zA-Z0-9\-\.\_]+)"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)/:version([a-zA-Z0-9\-\.\_]+)"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_]+)/sources/:source([a-zA-Z0-9\-\.\_]+)"
              component={SourceHome}
            />
            { /* Collection Home */ }
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_]+)/collections/:collection([a-zA-Z0-9\-\.\_]+)/:version([a-zA-Z0-9\-\.\_]+)"
              component={CollectionHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_]+)/collections/:collection([a-zA-Z0-9\-\.\_]+)/:version([a-zA-Z0-9\-\.\_]+)"
              component={CollectionHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_]+)/collections/:collection([a-zA-Z0-9\-\.\_]+)"
              component={CollectionHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_]+)/collections/:collection([a-zA-Z0-9\-\.\_]+)"
              component={CollectionHome}
            />

            {/* Organization Home */}
            <Route path="/orgs/:org([a-zA-Z0-9\-\.\_]+)" component={OrgHome} />

            {/* User Home */}
            <Route path="/users/:user([a-zA-Z0-9\-\.\_]+)" component={UserHome} />
          </Switch>
        </div>

      </div>
    );
  }
}

export default App;

