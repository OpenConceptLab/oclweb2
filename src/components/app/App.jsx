import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import alertifyjs from 'alertifyjs';
import { AppBar, Toolbar, Typography, Button, IconButton, Tooltip } from '@material-ui/core';
import { Person as PersonIcon, ExitToApp as LogoutIcon } from '@material-ui/icons';
import { get } from 'lodash';
import { WHITE, BLACK } from '../../common/constants';
import './App.scss';
import SearchInput from '../search/SearchInput';
import Search from '../search/Search';
import ConceptHome from '../concepts/ConceptHome';
import ConceptsComparison from '../concepts/ConceptsComparison';
import MappingHome from '../mappings/MappingHome';
import SourceHome from '../sources/SourceHome';
import CollectionHome from '../collections/CollectionHome';
import OrgHome from '../orgs/OrgHome';
import UserHome from '../users/UserHome';
import Login from '../users/Login';
import { Link } from 'react-router-dom';
import { isAtGlobalSearch, isLoggedIn, getCurrentUser } from '../../common/utils';

class App extends Component {
  handleSearchResults = results => {
    this.setState({searchResults: results}, () => {
      window.location.hash = 'search'
    })
  }

  componentDidMount() {
    this.addLogoutListenerForAllTabs()
  }

  addLogoutListenerForAllTabs() {
    window.addEventListener("storage", function(event) {
      if(event.key === 'token' && !event.newValue) {
        localStorage.clear()
        window.location = '/';
      }
    });
  }

  onLoginClick() {
    window.location.hash = '#/accounts/login'
  }

  onLogoutClick() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alertifyjs.success('You have signed out.')
    window.location.hash = '#/'
    window.location.reload()
  }

  toUserHome() {
    window.location.hash = '#' + get(getCurrentUser(), 'url');
  }

  render() {
    const user = getCurrentUser()
    const authenticated = isLoggedIn()
    return (
      <div>
        <AppBar position="static" variant="outlined" style={{backgroundColor: WHITE, color: BLACK}}>
          <Toolbar>
            <Typography variant="h6" className="brand col-sm-1">
              <Link className="no-anchor-styles" to="/">OCL</Link>
            </Typography>
            <div className="col-sm-8">
              {
                !isAtGlobalSearch() &&
                <SearchInput {...this.props} handleSearchResults={this.handleSearchResults} />
              }
            </div>
            <div className='col-sm-4 pull-right' style={{textAlign: 'right'}}>
              {
                authenticated ?
                <span>
                  <Button onClick={this.toUserHome} color='primary' variant='contained' startIcon={<PersonIcon />}>
                    {user.username}
                  </Button>
                  <Tooltip title='logout' placement='top'>
                    <IconButton component='span' onClick={this.onLogoutClick} style={{marginLeft: '10px'}}>
                      <LogoutIcon />
                    </IconButton>
                  </Tooltip>
                </span>:
                <Button onClick={this.onLoginClick} color='primary' variant='contained'>
                  Sign In
                </Button>
              }
            </div>
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
            <Route
              exact
              path="/concepts/compare"
              component={ConceptsComparison}
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
            <Route exact path="/accounts/login" component={Login} />
          </Switch>
        </div>

      </div>
    );
  }
}

export default App;

