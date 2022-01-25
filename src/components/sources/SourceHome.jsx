import React from 'react';
import { CircularProgress } from '@mui/material';
import { includes, isEmpty, get, findIndex, isEqual, find, isObject, omit, forEach } from 'lodash';
import APIService from '../../services/APIService';
import SourceHomeHeader from './SourceHomeHeader';
import SourceHomeTabs from './SourceHomeTabs';
import NotFound from '../common/NotFound';
import AccessDenied from '../common/AccessDenied';
import PermissionDenied from '../common/PermissionDenied';
import ConceptHome from '../concepts/ConceptHome';
import MappingHome from '../mappings/MappingHome';
import ResponsiveDrawer from '../common/ResponsiveDrawer';
import '../common/Split.scss';
import { SOURCE_DEFAULT_CONFIG } from "../../common/defaultConfigs"

const TABS = ['details', 'concepts', 'mappings', 'versions', 'about']

class SourceHome extends React.Component {
  constructor(props) {
    super(props);
    const queryParams = new URLSearchParams(get(this.props, 'location.search'))
    this.state = {
      width: false,
      notFound: false,
      accessDenied: false,
      permissionDenied: false,
      isLoading: true,
      isLoadingVersions: true,
      source: {},
      versions: [],
      tab: this.getDefaultTabIndex(),
      selectedConfig: null,
      customConfigs: [],
      splitView: queryParams.get('isSplit') === 'true',
      selected: null,
    }
  }

  customConfigFeatureApplicable() {
    return this.props.location.search.indexOf('configs=true') > -1;
  }

  getDefaultTabIndexFromConfig() {
    const index = findIndex(this.state.selectedConfig.config.tabs, {"default": true});
    return index > -1 ? index : 0;
  }

  setTab() {
    this.setState({tab: this.getDefaultTabIndexFromConfig()});
  }

  getDefaultTabIndex() {
    const { location } = this.props;

    if(location.pathname.indexOf('/about') > -1 && this.shouldShowAboutTab())
      return 3;
    if(location.pathname.indexOf('/versions') > -1)
      return 2;
    if(location.pathname.indexOf('/mappings') > -1)
      return 1;
    if(location.pathname.indexOf('/concepts') > -1)
      return 0;

    return 0;
  }

  componentDidMount() {
    this.refreshDataByURL()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.pathname !== this.props.location.pathname) {
      this.refreshDataByURL()
      this.onTabChange(null, this.getDefaultTabIndex())
    }
  }

  getVersionedObjectURLFromPath() {
    const { location } = this.props;

    return location.pathname.split('/').slice(0, 5).join('/') + '/';
  }

  getURLFromPath() {
    const { location, match } = this.props;
    if(location.pathname.indexOf('/versions') > -1)
      return location.pathname.split('/versions')[0] + '/'
    if(location.pathname.indexOf('/mappings') > -1)
      return location.pathname.split('/mappings')[0] + '/'
    if(location.pathname.indexOf('/concepts') > -1)
      return location.pathname.split('/concepts')[0] + '/'
    if(location.pathname.indexOf('/about') > -1)
      return location.pathname.split('/about')[0] + '/'
    if(location.pathname.indexOf('/details') > -1)
      return location.pathname.split('/details')[0] + '/'
    if(match.params.version)
      return location.pathname.split('/').slice(0, 6).join('/') + '/';

    return this.getVersionedObjectURLFromPath();
  }

  getVersions() {
    this.setState({isLoadingVersions: true}, () => {
      APIService.new()
                .overrideURL(this.getVersionedObjectURLFromPath() + 'versions/')
                .get(null, null, {verbose: true})
                .then(response => {
                  this.setState({versions: response.data, isLoadingVersions: false}, () => {
                    if(this.isVersionTabSelected())
                      this.fetchVersionsSummary()
                  })
                })
    })
  }

  setHEADSummary() {
    if(this.state.source.summary) {
      const newState = {...this.state}
      const head = find(newState.versions, {id: 'HEAD'})
      if(head) {
        head.summary = this.state.source.summary
        this.setState(newState)
      }

    }
  }

  fetchVersionsSummary() {
    forEach(this.state.versions, version => {
      if(version.id === 'HEAD') {
        this.fetchSummary()
      }
      else
        APIService.new().overrideURL(version.version_url).appendToUrl('summary/').get().then(response => {
          const newState = {...this.state}
          const _version = find(newState.versions, {uuid: version.uuid})
          _version.summary = omit(response.data, ['id', 'uuid'])
          this.setState(newState)
        })
    })
  }

  onTabChange = (event, value) => {
    this.setState({tab: value, selected: null, splitView: false}, () => {
      if(isEmpty(this.state.versions))
        this.getVersions()
      if(this.isVersionTabSelected())
        this.fetchVersionsSummary()
    })
  }

  refreshDataByURL() {
    this.setState({isLoading: true, notFound: false, accessDenied: false, permissionDenied: false}, () => {
      APIService.new()
                .overrideURL(this.getURLFromPath())
                .get(null, null, {includeClientConfigs: true})
                .then(response => {
                  if(get(response, 'detail') === "Not found.")
                    this.setState({isLoading: false, notFound: true, source: {}, accessDenied: false, permissionDenied: false})
                  else if(get(response, 'detail') === "Authentication credentials were not provided.")
                    this.setState({isLoading: false, notFound: false, source: {}, accessDenied: true, permissionDenied: false})
                  else if(get(response, 'detail') === "You do not have permission to perform this action.")
                    this.setState({isLoading: false, notFound: false, source: {}, accessDenied: false, permissionDenied: true})
                  else if(!isObject(response))
                    this.setState({isLoading: false}, () => {throw response})
                  else {
                    const source = response.data;
                    const customConfigs = get(source, 'client_configs', [])
                    const defaultCustomConfig = find(customConfigs, {is_default: true});
                    this.setState({
                      isLoading: false,
                      source: source,
                      selectedConfig: defaultCustomConfig || SOURCE_DEFAULT_CONFIG,
                      customConfigs: customConfigs,
                    }, () => {
                      const tab = this.getDefaultTabIndex()
                      if(tab === 0)
                        this.setTab()
                      this.getVersions()
                    })
                  }
                })

    })
  }

  fetchSummary() {
    APIService.new()
              .overrideURL(this.getURLFromPath())
              .appendToUrl('summary/')
              .get()
              .then(response => this.setState({
                source: {...this.state.source, summary: omit(response.data, ['id', 'uuid'])}
              }, this.setHEADSummary))
  }

  onConfigChange = config => this.setState({selectedConfig: config}, () => {
    const tab = this.getDefaultTabIndex()
    if(tab === 0)
      this.setTab()
  })

  isVersionedObject() {
    const version = this.props.match.params.version;
    if(version)
      return includes(TABS, version)
    return true
  }

  getCurrentVersion() {
    let version = this.props.match.params.version;

    if(!includes(TABS, version))
      return version
  }

  shouldShowAboutTab() {
    return !isEmpty(get(this, 'state.source.text'));
  }

  onVersionUpdate = updatedVersion => {
    const newState = {...this.state}
    const oldVersion = find(newState.versions, {uuid: updatedVersion.uuid})
    const index = findIndex(newState.versions, {uuid: updatedVersion.uuid})
    if(!updatedVersion.summary)
      updatedVersion.summary = oldVersion.summary

    newState.versions.splice(index, 1, updatedVersion)
    this.setState(newState)
  }

  onResourceSelect = selected => this.setState({selected: selected})

  toggleSplitView = () => this.setState({splitView: !this.state.splitView})

  currentTabConfig = () => get(this.state.selectedConfig, `config.tabs.${this.state.tab}`)

  isVersionTabSelected = () => get(this.currentTabConfig(), 'type') === 'versions';

  getContainerWidth = () => {
    const { splitView, selected, width } = this.state;
    if(selected && splitView) {
      if(width)
        return `calc(100% - ${width - 15}px)`
      return '50%'
    }
    return '100%'
  }

  render() {
    const {
      source, versions, isLoading, tab, selectedConfig, customConfigs,
      notFound, accessDenied, permissionDenied, isLoadingVersions, splitView, selected
    } = this.state;
    const currentURL = this.getURLFromPath()
    const versionedObjectURL = this.getVersionedObjectURLFromPath()
    const showAboutTab = this.shouldShowAboutTab();
    const hasError = notFound || accessDenied || permissionDenied;
    const isMappingSelected = Boolean(selected && get(selected, 'map_type'))
    const isConceptSelected = Boolean(selected && !isMappingSelected)
    return (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        { isLoading && <CircularProgress color='primary' /> }
        { notFound && <NotFound /> }
        { accessDenied && <AccessDenied /> }
        { permissionDenied && <PermissionDenied /> }
        {
          !isLoading && !hasError &&
          <div className='col-xs-12 home-container no-side-padding' style={{width: this.getContainerWidth()}}>
            <SourceHomeHeader
              source={source}
              isVersionedObject={this.isVersionedObject()}
              versionedObjectURL={versionedObjectURL}
              currentURL={currentURL}
              config={selectedConfig}
            />
            <SourceHomeTabs
              tab={tab}
              onTabChange={this.onTabChange}
              source={source}
              versions={versions}
              location={this.props.location}
              match={this.props.match}
              versionedObjectURL={versionedObjectURL}
              currentVersion={this.getCurrentVersion()}
              aboutTab={showAboutTab}
              onVersionUpdate={this.onVersionUpdate}
              customConfigs={[...customConfigs, SOURCE_DEFAULT_CONFIG]}
              onConfigChange={this.onConfigChange}
              selectedConfig={selectedConfig}
              showConfigSelection={this.customConfigFeatureApplicable()}
              isOCLDefaultConfigSelected={isEqual(selectedConfig, SOURCE_DEFAULT_CONFIG)}
              isLoadingVersions={isLoadingVersions}
              splitView={splitView}
              onSelect={this.onResourceSelect}
              onSplitViewToggle={this.toggleSplitView}
            />
          </div>
        }
        {
          splitView && (isMappingSelected || isConceptSelected) &&
          <ResponsiveDrawer
            width="50%"
            variant='persistent'
            isOpen
            onClose={() => this.setState({splitView: false})}
            onWidthChange={newWidth => this.setState({width: newWidth})}
            formComponent={
              <div className='col-xs-12 no-side-padding' style={{backgroundColor: '#fafbfc'}}>
                {
                  isMappingSelected ?
                  <MappingHome
                    singleColumn
                    scoped
                    mapping={selected}
                            location={{pathname: selected.version_url || selected.url}}
                            match={{params: {mappingVersion: null}}}
                            onClose={() => this.setState({selected: null})}
                            header={false}
                            noRedirect
                  /> :
                  <ConceptHome
                    singleColumn
                    scoped
                    concept={selected}
                            location={{pathname: selected.version_url || selected.url}}
                            match={{params: {conceptVersion: null}}}
                            onClose={() => this.setState({selected: null})}
                            openHierarchy={false}
                            header={false}
                            noRedirect
                  />
                }
              </div>
            }
          />
        }
      </div>
    )
  }
}

export default SourceHome;
