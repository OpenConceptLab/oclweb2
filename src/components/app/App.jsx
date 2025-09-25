/*eslint no-process-env: 0*/
import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { get, isEmpty } from 'lodash';
import {
  isFHIRServer, isLoggedIn, setUpRecentHistory, getAppliedServerConfig, getSiteTitle,
  isDeprecatedBrowser, recordGAPageView, canViewOperationsPanel, isRedirectingToLoginViaReferrer,
  isSSOEnabled, getLoginURL, isMapperURL, isV3URL
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
import OIDLoginCallback from '../users/OIDLoginCallback';
import APIService from '../../services/APIService';
import OpenMRSDeprecationDialog from '../common/OpenMRSDeprecationDialog';
import SigninRedirect from './SigninRedirect'
import SignupRedirect from './SignupRedirect'
import CheckAuth from './CheckAuth'


const SITE_TITLE = getSiteTitle()

const AuthenticationRequiredRoute = ({component: Component, ...rest}) => (
  <Route
    {...rest}
    render={props => isLoggedIn() ? <Component {...props} /> : isRedirectingToLoginViaReferrer(props.location) ? <CheckAuth /> : <AccessDenied />}
  />
)

const App = props => {
  const { openOperations, menuOpen, setMenuOpen, setOpenOperations, setToggles } = React.useContext(OperationsContext);
  const [openOpenMRSDeprecationDialog, setOpenOpenMRSDeprecationDialog] = React.useState(false)
  const operationsPanelAccess = canViewOperationsPanel()

  // For recent history
  setUpRecentHistory(props.history);

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

  const myStateRef = React.useRef(openOperations);
  const setMyState = data => {
    myStateRef.current = data;
    setOpenOperations(data);
  };

  const _listenKey = event => {
    const isCtrlO = event.keyCode === 79 && event.ctrlKey;
    if (isCtrlO) {
      setMyState(!myStateRef.current)
    }
  };

  const fetchToggles = async () => {
    return new Promise(resolve => {
      APIService.toggles().get().then(response => {
        if (!isEmpty(response.data))
          setToggles(response.data)
        resolve();
      });
    });
  }

  const setUpOpenMRSDeprecationDialog = () => {
    const isRedirectedFromDM = window.location.href.includes('?origin=openmrs')
    setOpenOpenMRSDeprecationDialog(isRedirectedFromDM)
  }

  const forceLoginUser = () => {
    if(!isSSOEnabled()) {
      window.location.href = getLoginURL(window.location.origin + '/#' + pathname)
    }

    const { search, hash, pathname } = props.location
    const queryParams = new URLSearchParams(search)
    const referrer = queryParams.get('referrer')
    if(isLoggedIn()) {
      window.location.hash = '#'  + pathname
    } else if(referrer && (isMapperURL(referrer) || isV3URL(referrer)) && !isLoggedIn()) {
      const parts = hash.split('?')
      let params = new URLSearchParams(parts[1])
      if(params.get('auth') === 'true') {
        window.location.href = getLoginURL(window.location.origin + '/#' + pathname)
      }
    }
  }

  React.useEffect(() => {
    forceLoginUser()
    setUpOpenMRSDeprecationDialog()
    if(!isFHIRServer())
      fetchToggles()
    addLogoutListenerForAllTabs()
    recordGAPageView()
    setupHotJar()
    operationsPanelAccess && document.body.addEventListener("keydown", _listenKey)
    return () => operationsPanelAccess && document.body.removeEventListener("keydown", _listenKey)
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
        openOpenMRSDeprecationDialog &&
          <OpenMRSDeprecationDialog isOpen={openOpenMRSDeprecationDialog} />
      }
      {
        isDeprecatedBrowser() && deprecatedBrowser &&
          <DeprecatedBrowser open onClose={() => setDeprecatedBrowser(false)} />
      }
      <DocumentTitle/>
      <Header {...props} onOpen={setMenuOpen}>
        <ErrorBoundary>
          {
            openOperations && <OperationsDrawer />
          }
          <main className={getClasses()}>
            <Switch>
              <Route exact path="/oidc/login" component={OIDLoginCallback} />
              <Route exact path="/" component={isFHIR ? Fhir : RootView} />
              <Route path="/signin" component={SigninRedirect} />
              <Route path="/signup" component={SignupRedirect} />
              <Route path="/search" component={isFHIR ? Fhir : Search} />
              <AuthenticationRequiredRoute path="/imports" component={ImportHome} />

              { /* Concept Home */ }
              <Route
                path="/users/:user/sources/:source/concepts/:concept/:conceptVersion/$cascade"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/concepts/:concept/:conceptVersion/$cascade"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/concepts/:concept/:conceptVersion"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/concepts/:concept/:conceptVersion"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/concepts/:concept/$cascade"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/concepts/:concept/$cascade"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/concepts/:concept"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/concepts/:concept"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/:version/concepts/:concept"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/:version/concepts/:concept"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/:version/concepts/:concept/$cascade"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/:version/concepts/:concept/$cascade"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/:version/concepts/:concept/:conceptVersion"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/:version/concepts/:concept/:conceptVersion"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/:version/concepts/:concept/:conceptVersion/$cascade"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/:version/concepts/:concept/:conceptVersion/$cascade"
                component={SourceHome}
              />

              { /* Mapping Home */ }
              <Route
                path="/users/:user/sources/:source/mappings/:mapping/:mappingVersion"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/mappings/:mapping/:mappingVersion"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/:version/mappings/:mapping/:mappingVersion"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/:version/mappings/:mapping/:mappingVersion"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/mappings/:mapping"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/mappings/:mapping"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/:version/mappings/:mapping"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/:version/mappings/:mapping"
                component={SourceHome}
              />

              { /* Source Home */ }
              <Route
                path="/orgs/:org/sources/:source/:version/concepts"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/:version/concepts"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/concepts"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/concepts"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/:version/mappings"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/:version/mappings"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/mappings"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/mappings"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/:version/summary"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/:version/versions"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/:version/summary"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/:version/versions"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/about"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/about"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/versions"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/summary"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/versions"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/summary"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/:version"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/:version"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source/:version/about"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source/:version/about"
                component={SourceHome}
              />
              <Route
                path="/orgs/:org/sources/:source"
                component={SourceHome}
              />
              <Route
                path="/users/:user/sources/:source"
                component={SourceHome}
              />

              { /* Collection Home */ }
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/concepts/:concept"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/concepts/:concept/:conceptVersion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/mappings/:mapping"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/mappings/:mapping/:mappingVersion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/concepts/:concept"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/concepts/:concept/:conceptVersion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/mappings/:mapping"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/mappings/:mapping/:mappingVersion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/mappings"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/concepts"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/references"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/mappings"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/concepts"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/references"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/expansions/:expansion/concepts/:concept/:conceptVersion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/expansions/:expansion/mappings/:mapping/:mappingVersion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/expansions/:expansion/concepts/:concept"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/expansions/:expansion/mappings/:mapping"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/expansions/:expansion/concepts"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/expansions/:expansion/mappings"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/expansions/:expansion/concepts/:concept/:conceptVersion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/expansions/:expansion/mappings/:mapping/:mappingVersion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/expansions/:expansion/concepts/:concept"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/expansions/:expansion/mappings/:mapping"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/expansions/:expansion/concepts"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/expansions/:expansion/mappings"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/:version/expansions/:expansion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/:version/expansions/:expansion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/concepts/:concept"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/concepts/:concept/:conceptVersion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/mappings/:mapping"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/mappings/:mapping/:mappingVersion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/concepts/:concept"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/concepts/:concept/:conceptVersion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/mappings/:mapping"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/mappings/:mapping/:mappingVersion"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/mappings"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/concepts"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/references"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/about"
                component={CollectionHome}
              />
              <Route
                exact
                path="/orgs/:org/collections/:collection/versions"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/about"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/versions"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/mappings"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/concepts"
                component={CollectionHome}
              />
              <Route
                exact
                path="/users/:user/collections/:collection/references"
                component={CollectionHome}
              />
              <Route
                path="/users/:user/collections/:collection/:version"
                component={CollectionHome}
              />
              <Route
                path="/orgs/:org/collections/:collection/:version"
                component={CollectionHome}
              />
              <Route
                path="/orgs/:org/collections/:collection"
                component={CollectionHome}
              />
              <Route
                path="/users/:user/collections/:collection"
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
              <Route path="/orgs/:org" component={OrgHome} />

              {/* User Home */}
              <AuthenticationRequiredRoute path="/users/:user" component={UserHome} />
              <Route exact path="/accounts/login" component={Login} />
              <Route exact path="/accounts/signup" component={Signup} />
              <Route exact path="/accounts/password/reset" component={ForgotPasswordRequest} />
              <Route exact path="/accounts/:user/password/reset/:token" component={ForgotPasswordForm} />
              <Route exact path="/accounts/:user/verify/:token" component={EmailVerification} />

              {/* FHIR */}
              <Route path="/fhir/orgs/:org/CodeSystem/:id/code" component={ContainerHome} />
              <Route path="/fhir/orgs/:org/CodeSystem/:id/about" component={ContainerHome} />
              <Route path="/fhir/orgs/:org/CodeSystem/:id/versions" component={ContainerHome} />
              <Route path="/fhir/orgs/:org/CodeSystem/:id" component={ContainerHome} />
              <Route path="/fhir/users/:user/CodeSystem/:id/code" component={ContainerHome} />
              <Route path="/fhir/users/:user/CodeSystem/:id/about" component={ContainerHome} />
              <Route path="/fhir/users/:user/CodeSystem/:id/versions" component={ContainerHome} />
              <Route path="/fhir/users/:user/CodeSystem/:id" component={ContainerHome} />
              <Route path="/fhir/CodeSystem/:id/versions" component={ContainerHome} />
              <Route path="/fhir/CodeSystem/:id/about" component={ContainerHome} />
              <Route path="/fhir/CodeSystem/:id/code" component={ContainerHome} />
              <Route path="/fhir/CodeSystem/:id" component={ContainerHome} />

              <Route path="/fhir/orgs/:org/ValueSet/:id/code" component={ContainerHome} />
              <Route path="/fhir/orgs/:org/ValueSet/:id/about" component={ContainerHome} />
              <Route path="/fhir/orgs/:org/ValueSet/:id/versions" component={ContainerHome} />
              <Route path="/fhir/orgs/:org/ValueSet/:id" component={ContainerHome} />
              <Route path="/fhir/users/:user/ValueSet/:id/code" component={ContainerHome} />
              <Route path="/fhir/users/:user/ValueSet/:id/about" component={ContainerHome} />
              <Route path="/fhir/users/:user/ValueSet/:id/versions" component={ContainerHome} />
              <Route path="/fhir/users/:user/ValueSet/:id" component={ContainerHome} />
              <Route path="/fhir/ValueSet/:id/versions" component={ContainerHome} />
              <Route path="/fhir/ValueSet/:id/about" component={ContainerHome} />
              <Route path="/fhir/ValueSet/:id/code" component={ContainerHome} />
              <Route path="/fhir/ValueSet/:id" component={ContainerHome} />

              <Route path="/fhir/orgs/:org/ConceptMap/:id" component={ConceptMapHome} />
              <Route path="/fhir/users/:user/ConceptMap/:id" component={ConceptMapHome} />
              <Route path="/fhir/ConceptMap/:id" component={ConceptMapHome} />


              <Route path="/fhir/users/:user" component={OwnerHome} />
              <Route path="/fhir/orgs/:org" component={OwnerHome} />
              <Route path="/fhir" component={Fhir} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </ErrorBoundary>
        <Footer {...props} />
      </Header>
    </div>
);
}

export default withRouter(App);

