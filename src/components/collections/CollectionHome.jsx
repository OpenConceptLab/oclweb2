import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { includes, isEmpty, get, findIndex, isEqual, find, isObject } from 'lodash';
import APIService from '../../services/APIService';
import CollectionHomeHeader from './CollectionHomeHeader';
import CollectionHomeTabs from './CollectionHomeTabs';
import NotFound from '../common/NotFound';
import AccessDenied from '../common/AccessDenied';
import PermissionDenied from '../common/PermissionDenied';

const TABS = ['details', 'concepts', 'mappings', 'references', 'versions', 'expansions', 'about']
const DEFAULT_CONFIG = {
  name: 'OCL Default (Collection)',
  web_default: true,
  is_default: false,
  config: {
    tabs: [
      {type: "concepts", label: "Concepts", page_size: 25, "default": true, layout: 'table'},
      {type: "mappings", label: "Mappings", page_size: 25, layout: 'table'},
      {type: "references", label: "References", page_size: 25, layout: 'table'},
      {type: "versions", label: "Versions", page_size: 25, layout: 'table'},
      {type: "expansions", label: "Expansions", page_size: 25, layout: 'table'},
      {type: "about", label: "About"},
    ]
  }
}

class CollectionHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notFound: false,
      accessDenied: false,
      permissionDenied: false,
      isLoading: true,
      isLoadingVersions: true,
      collection: {},
      expansion: {},
      versions: [],
      expansions: [],
      isLoadingExpansions: true,
      tab: this.getDefaultTabIndex(),
      selectedConfig: null,
      customConfigs: [],
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
    const { location, match } = this.props;

    if(location.pathname.indexOf('/about') > -1 && this.shouldShowAboutTab())
      return 5;
    if(location.pathname.indexOf('/expansions') > -1 && !match.params.expansion)
      return 4;
    if(location.pathname.indexOf('/versions') > -1)
      return 3;
    if(location.pathname.indexOf('/references') > -1)
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
    if(location.pathname.indexOf('/references') > -1)
      return location.pathname.split('/references')[0] + '/'
    if(location.pathname.indexOf('/versions') > -1)
      return location.pathname.split('/versions')[0] + '/'
    if(location.pathname.indexOf('/expansions') > -1 && !match.params.expansion)
      return location.pathname.split('/expansions')[0] + '/'
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
    if(match.params.expansion)
      return location.pathname.split('/').slice(0, 8).join('/') + '/';

    return this.getVersionedObjectURLFromPath();
  }

  getResourceURLs() {
    const { match, location } = this.props
    const collectionURL = location.pathname.split('/').slice(0, 5).join('/') + '/'
    let urls = {collection: collectionURL, version: null, expansion: null}
    if(match.params.version && !includes(['references', 'versions', 'expansions', 'concepts', 'mappings', 'about', 'details'], match.params.version)) {
      urls.version = collectionURL + match.params.version + '/'

      if(match.params.expansion && !includes(['references', 'versions', 'expansions', 'concepts', 'mappings', 'about', 'details'], match.params.expansion))
        urls.expansion= collectionURL + match.params.version + '/' + 'expansions/' + match.params.expansion + '/'
    }

    return urls
  }

  getVersions() {
    this.setState({isLoadingVersions: true}, () => {
    APIService.new()
              .overrideURL(this.getVersionedObjectURLFromPath() + 'versions/')
              .get(null, null, {verbose: true, includeSummary: true})
              .then(response => {
                this.setState({versions: response.data, isLoadingVersions: false})
              })
    })
  }

  getExpansions() {
    this.setState({isLoadingExpansions: true}, () => {
      const { collection } = this.state;
      let url = collection.version_url || collection.url

      if(collection.version === 'HEAD')
        url += 'HEAD/'
      APIService.new()
                .overrideURL(url)
      .appendToUrl('expansions/')
                .get(null, null, {verbose: true, includeSummary: true})
                .then(response => {
                  this.setState({expansions: response.data, isLoadingVersions: false})
                })
    })
  }

  onTabChange = (event, value) => {
    this.setState({tab: value}, () => {
      if(isEmpty(this.state.versions))
        this.getVersions()
    })
  }

  fetchExpansion() {
    if(this.URLs.expansion) {
      APIService.new().overrideURL(this.URLs.expansion).get().then(response => {
        if(get(response, 'detail') === "Not found.")
          this.setState({isLoading: false, notFound: true, collection: {}, accessDenied: false, permissionDenied: false})
        else if(get(response, 'detail') === "Authentication credentials were not provided.")
          this.setState({isLoading: false, notFound: false, collection: {}, accessDenied: true, permissionDenied: false})
        else if(get(response, 'detail') === "You do not have permission to perform this action.")
          this.setState({isLoading: false, notFound: false, collection: {}, accessDenied: false, permissionDenied: true})
        else if(!isObject(response))
          this.setState({isLoading: false}, () => {throw response})
        else {
          this.setState({expansion: response.data})
        }
      })
    }
  }

  refreshDataByURL() {
    this.setState({isLoading: true, notFound: false, accessDenied: false, permissionDenied: false, expansion: {}}, () => {
      this.URLs = this.getResourceURLs()
      const url = this.URLs.version ? this.URLs.version : this.URLs.collection
      APIService.new()
                .overrideURL(url)
                .get(null, null, {includeSummary: true, includeClientConfigs: true})
                .then(response => {
                  if(get(response, 'detail') === "Not found.")
                    this.setState({isLoading: false, notFound: true, collection: {}, accessDenied: false, permissionDenied: false})
                  else if(get(response, 'detail') === "Authentication credentials were not provided.")
                    this.setState({isLoading: false, notFound: false, collection: {}, accessDenied: true, permissionDenied: false})
                  else if(get(response, 'detail') === "You do not have permission to perform this action.")
                    this.setState({isLoading: false, notFound: false, collection: {}, accessDenied: false, permissionDenied: true})
                  else if(!isObject(response))
                    this.setState({isLoading: false}, () => {throw response})
                  else {
                    const collection = response.data;
                    const customConfigs = get(collection, 'client_configs', [])
                    const defaultCustomConfig = find(customConfigs, {is_default: true});
                    this.setState({
                      isLoading: false,
                      collection: collection,
                      selectedConfig: defaultCustomConfig || DEFAULT_CONFIG,
                      customConfigs: customConfigs,
                    }, () => {
                      if(this.URLs.expansion)
                        this.fetchExpansion()
                      if(isEmpty(this.state.versions))
                        this.getVersions()
                      if(isEmpty(this.state.expansions))
                        this.getExpansions()
                    })
                  }
                })

    })
  }

  onConfigChange = config => this.setState({selectedConfig: config})

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
    return !isEmpty(get(this, 'state.collection.text'));
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

  render() {
    const {
      collection, versions, isLoading, tab, selectedConfig, customConfigs,
      notFound, accessDenied, permissionDenied, isLoadingVersions, expansions, expansion,
    } = this.state;
    const currentURL = this.getURLFromPath()
    const versionedObjectURL = this.getVersionedObjectURLFromPath()
    const showAboutTab = this.shouldShowAboutTab();
    const hasError = notFound || accessDenied || permissionDenied;
    return (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        { isLoading && <CircularProgress color='primary' /> }
        { notFound && <NotFound /> }
        { accessDenied && <AccessDenied /> }
        { permissionDenied && <PermissionDenied /> }
        {
          !isLoading && !hasError &&
          <div className='col-md-12 home-container no-side-padding'>
            <CollectionHomeHeader
              collection={collection}
              isVersionedObject={this.isVersionedObject()}
              versionedObjectURL={versionedObjectURL}
              currentURL={currentURL}
              config={selectedConfig}
              expansion={expansion}
            />
            <CollectionHomeTabs
              tab={tab}
              onTabChange={this.onTabChange}
              collection={collection}
              expansion={expansion}
              versions={versions}
              expansions={expansions}
              match={this.props.match}
              location={this.props.location}
              versionedObjectURL={versionedObjectURL}
              currentVersion={this.getCurrentVersion()}
              aboutTab={showAboutTab}
              onVersionUpdate={this.onVersionUpdate}
              customConfigs={[...customConfigs, DEFAULT_CONFIG]}
              onConfigChange={this.onConfigChange}
              selectedConfig={selectedConfig}
              showConfigSelection={this.customConfigFeatureApplicable()}
              isOCLDefaultConfigSelected={isEqual(selectedConfig, DEFAULT_CONFIG)}
              isLoadingVersions={isLoadingVersions}
            />
          </div>
        }
      </div>
    )
  }
}

export default CollectionHome;
