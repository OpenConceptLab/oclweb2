/*eslint no-process-env: 0*/
import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import ReactGA from 'react-ga';
import { get } from 'lodash';
import {
  isFHIRServer, isLoggedIn, setUpRecentHistory, getAppliedServerConfig, getSiteTitle,
  isDeprecatedBrowser
} from '../../common/utils';
import Search from '../search/Search';
import SourceHome from '../sources/SourceHome';
import CollectionHome from '../collections/CollectionHome';
import ConceptsComparison from '../concepts/ConceptsComparison';
import MappingsComparison from '../mappings/MappingsComparison';
import OrgHome from '../orgs/OrgHome';
import UserHome from '../users/UserHome';
import Login from '../users/Login';
import Signup from '../users/Signup';
import EmailVerification from '../users/EmailVerification';
import ForgotPasswordRequest from '../users/ForgotPasswordRequest';
import ForgotPasswordForm from '../users/ForgotPasswordForm';
import ImportHome from '../imports/ImportHome';
import NotFound from '../common/NotFound';
import ErrorBoundary from '../common/ErrorBoundary';
import AccessDenied from '../common/AccessDenied';
import Fhir from '../fhir/Fhir';
import ContainerHome from '../fhir/ContainerHome';
import OwnerHome from '../fhir/OwnerHome';
import ConceptMapHome from '../fhir/ConceptMapHome';
import Header from './Header';
import OperationsDrawer from '../common/OperationsDrawer';
import Footer from './Footer';
import RootView from './RootView';
import DocumentTitle from "./DocumentTitle"
import './App.scss';
import { hotjar } from 'react-hotjar';
import { OperationsContext } from './LayoutContext';
import DeprecatedBrowser from './DeprecatedBrowser';


const SITE_TITLE = getSiteTitle()

const AuthenticationRequiredRoute = ({component: Component, ...rest}) => (
  <Route
    {...rest}
    render={props => isLoggedIn() ? <Component {...props} /> : <AccessDenied />}
  />
)

const App = props => {
  // For recent history
  setUpRecentHistory(props.history);
  const { openOperations, menuOpen, setMenuOpen } = React.useContext(OperationsContext);
  const setupGA = () => {
    /*eslint no-undef: 0*/
    ReactGA.initialize(window.GA_ACCOUNT_ID || process.env.GA_ACCOUNT_ID);
    ReactGA.pageview(window.location.pathname + window.location.hash);
  }
  const setupHotJar = () => {
    /*eslint no-undef: 0*/
    const HID = window.HOTJAR_ID || process.env.HOTJAR_ID
    if(HID)
      hotjar.initialize(HID, 6);
  }

  const addLogoutListenerForAllTabs = () => window.addEventListener(
    "storage",
    event => {
      if(event.key === 'token' && !event.newValue) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if(!get(localStorage, 'server'))
          window.location = '/';
      }
    });

  React.useEffect(() => {
    addLogoutListenerForAllTabs()
    setupGA()
    setupHotJar()
  }, [])

  const isFHIR = isFHIRServer();
  const setSiteTitle = () => document.getElementsByTagName('title')[0].text = SITE_TITLE;
  const serverConfig = getAppliedServerConfig()
  const siteConfiguration = get(serverConfig, 'info.site')
  const hideLeftNav = get(siteConfiguration, 'noLeftMenu', false)
  const getClasses = () => {
    let _classes = 'content'
    if(hideLeftNav)
      _classes += ' no-menu'
    else if(menuOpen)
      _classes += ' menu-open'

    if(openOperations)
      _classes += ' with-operations'

    return _classes
  }

  setSiteTitle()

  const [deprecatedBrowser, setDeprecatedBrowser] = React.useState(true)

  return (
    <div>
      {
        isDeprecatedBrowser() && deprecatedBrowser &&
          <DeprecatedBrowser open onClose={() => setDeprecatedBrowser(false)} />
      }
      <DocumentTitle/>
      <Header {...props} onOpen={setMenuOpen} />
      <ErrorBoundary>
        {
          openOperations &&
            <OperationsDrawer />
        }
        <main className={getClasses()}>
          <Switch>
            <Route exact path="/" component={isFHIR ? Fhir : RootView} />
            <Route path="/search" component={isFHIR ? Fhir : Search} />
            <AuthenticationRequiredRoute path="/imports" component={ImportHome} />

            { /* Concept Home */ }
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept/:conceptVersion([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept/:conceptVersion([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept/:conceptVersion([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept/:conceptVersion([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept"
              component={SourceHome}
            />

            { /* Mapping Home */ }
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping([a-zA-Z0-9\-\.\_\@]+)/:mappingVersion([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping([a-zA-Z0-9\-\.\_\@]+)/:mappingVersion([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping([a-zA-Z0-9\-\.\_\@]+)/:mappingVersion([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping([a-zA-Z0-9\-\.\_\@]+)/:mappingVersion([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />

            { /* Source Home */ }
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/concepts"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/concepts"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/concepts"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/concepts"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/mappings"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/mappings"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/mappings"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/mappings"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/versions"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/versions"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/about"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/about"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/versions"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/versions"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/about"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/about"
              component={SourceHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/sources/:source([a-zA-Z0-9\-\.\_\@]+)"
              component={SourceHome}
            />

            { /* Collection Home */ }
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept/:conceptVersion"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping/:mappingVersion"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept/:conceptVersion"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping/:mappingVersion"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/mappings"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/concepts"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/references"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/mappings"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/concepts"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/references"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept/:conceptVersion"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping/:mappingVersion"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)/concepts"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)/mappings"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept/:conceptVersion"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping/:mappingVersion"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)/concepts"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)/mappings"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)/expansions/:expansion([a-zA-Z0-9\-\.\_\@]+)"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept/:conceptVersion"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping/:mappingVersion"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/concepts/:concept/:conceptVersion"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/mappings/:mapping/:mappingVersion"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/mappings"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/concepts"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/references"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/about"
              component={CollectionHome}
            />
            <Route
              exact
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/versions"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/about"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/versions"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/mappings"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/concepts"
              component={CollectionHome}
            />
            <Route
              exact
              path="/users/:user/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/references"
              component={CollectionHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)"
              component={CollectionHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)/:version([a-zA-Z0-9\-\.\_\@]+)"
              component={CollectionHome}
            />
            <Route
              path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)"
              component={CollectionHome}
            />
            <Route
              path="/users/:user([a-zA-Z0-9\-\.\_\@]+)/collections/:collection([a-zA-Z0-9\-\.\_\@]+)"
              component={CollectionHome}
            />

            {/* Comparison */}
            <Route
              exact
              path="/concepts/compare"
              component={ConceptsComparison}
            />
            <Route
              exact
              path="/mappings/compare"
              component={MappingsComparison}
            />

            {/* Organization Home */}
            <Route path="/orgs/:org([a-zA-Z0-9\-\.\_\@]+)" component={OrgHome} />

            {/* User Home */}
            <Route path="/users/:user([a-zA-Z0-9\-\.\_\@]+)" component={UserHome} />
            <Route exact path="/accounts/login" component={Login} />
            <Route exact path="/accounts/signup" component={Signup} />
            <Route exact path="/accounts/password/reset" component={ForgotPasswordRequest} />
            <Route exact path="/accounts/:user([a-zA-Z0-9\-\.\_\@]+)/password/reset/:token([a-zA-Z0-9\-\.\_\@]+)" component={ForgotPasswordForm} />
            <Route exact path="/accounts/:user([a-zA-Z0-9\-\.\_\@]+)/verify/:token([a-zA-Z0-9\-\.\_\@]+)" component={EmailVerification} />

            {/* FHIR */}
            <Route path="/fhir/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/CodeSystem/:id([a-zA-Z0-9\-\.\_\@]+)/code" component={ContainerHome} />
            <Route path="/fhir/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/CodeSystem/:id([a-zA-Z0-9\-\.\_\@]+)/about" component={ContainerHome} />
            <Route path="/fhir/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/CodeSystem/:id([a-zA-Z0-9\-\.\_\@]+)/versions" component={ContainerHome} />
            <Route path="/fhir/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/CodeSystem/:id([a-zA-Z0-9\-\.\_\@]+)" component={ContainerHome} />
            <Route path="/fhir/users/:user([a-zA-Z0-9\-\.\_\@]+)/CodeSystem/:id([a-zA-Z0-9\-\.\_\@]+)/code" component={ContainerHome} />
            <Route path="/fhir/users/:user([a-zA-Z0-9\-\.\_\@]+)/CodeSystem/:id([a-zA-Z0-9\-\.\_\@]+)/about" component={ContainerHome} />
            <Route path="/fhir/users/:user([a-zA-Z0-9\-\.\_\@]+)/CodeSystem/:id([a-zA-Z0-9\-\.\_\@]+)/versions" component={ContainerHome} />
            <Route path="/fhir/users/:user([a-zA-Z0-9\-\.\_\@]+)/CodeSystem/:id([a-zA-Z0-9\-\.\_\@]+)" component={ContainerHome} />
            <Route path="/fhir/CodeSystem/:id([a-zA-Z0-9\-\.\_\@]+)/versions" component={ContainerHome} />
            <Route path="/fhir/CodeSystem/:id([a-zA-Z0-9\-\.\_\@]+)/about" component={ContainerHome} />
            <Route path="/fhir/CodeSystem/:id([a-zA-Z0-9\-\.\_\@]+)/code" component={ContainerHome} />
            <Route path="/fhir/CodeSystem/:id([a-zA-Z0-9\-\.\_\@]+)" component={ContainerHome} />

            <Route path="/fhir/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/ValueSet/:id([a-zA-Z0-9\-\.\_\@]+)/code" component={ContainerHome} />
            <Route path="/fhir/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/ValueSet/:id([a-zA-Z0-9\-\.\_\@]+)/about" component={ContainerHome} />
            <Route path="/fhir/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/ValueSet/:id([a-zA-Z0-9\-\.\_\@]+)/versions" component={ContainerHome} />
            <Route path="/fhir/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/ValueSet/:id([a-zA-Z0-9\-\.\_\@]+)" component={ContainerHome} />
            <Route path="/fhir/users/:user([a-zA-Z0-9\-\.\_\@]+)/ValueSet/:id([a-zA-Z0-9\-\.\_\@]+)/code" component={ContainerHome} />
            <Route path="/fhir/users/:user([a-zA-Z0-9\-\.\_\@]+)/ValueSet/:id([a-zA-Z0-9\-\.\_\@]+)/about" component={ContainerHome} />
            <Route path="/fhir/users/:user([a-zA-Z0-9\-\.\_\@]+)/ValueSet/:id([a-zA-Z0-9\-\.\_\@]+)/versions" component={ContainerHome} />
            <Route path="/fhir/users/:user([a-zA-Z0-9\-\.\_\@]+)/ValueSet/:id([a-zA-Z0-9\-\.\_\@]+)" component={ContainerHome} />
            <Route path="/fhir/ValueSet/:id([a-zA-Z0-9\-\.\_\@]+)/versions" component={ContainerHome} />
            <Route path="/fhir/ValueSet/:id([a-zA-Z0-9\-\.\_\@]+)/about" component={ContainerHome} />
            <Route path="/fhir/ValueSet/:id([a-zA-Z0-9\-\.\_\@]+)/code" component={ContainerHome} />
            <Route path="/fhir/ValueSet/:id([a-zA-Z0-9\-\.\_\@]+)" component={ContainerHome} />

            <Route path="/fhir/orgs/:org([a-zA-Z0-9\-\.\_\@]+)/ConceptMap/:id([a-zA-Z0-9\-\.\_\@]+)" component={ConceptMapHome} />
            <Route path="/fhir/users/:user([a-zA-Z0-9\-\.\_\@]+)/ConceptMap/:id([a-zA-Z0-9\-\.\_\@]+)" component={ConceptMapHome} />
            <Route path="/fhir/ConceptMap/:id([a-zA-Z0-9\-\.\_\@]+)" component={ConceptMapHome} />


            <Route path="/fhir/users/:user([a-zA-Z0-9\-\.\_]+)" component={OwnerHome} />
            <Route path="/fhir/orgs/:org([a-zA-Z0-9\-\.\_]+)" component={OwnerHome} />
            <Route path="/fhir" component={Fhir} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </ErrorBoundary>
      <Footer {...props} />
    </div>
);
}

export default withRouter(App);

