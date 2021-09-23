import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { includes, isEmpty, get, findIndex, isEqual, find, isObject } from 'lodash';
import APIService from '../../services/APIService';
import CollectionHomeHeader from './CollectionHomeHeader';
import CollectionHomeTabs from './CollectionHomeTabs';
import NotFound from '../common/NotFound';
import AccessDenied from '../common/AccessDenied';
import PermissionDenied from '../common/PermissionDenied';
import { COLLECTION_DEFAULT_CONFIG } from "../../common/defaultConfigs"

const TABS = ['details', 'concepts', 'mappings', 'references', 'versions', 'about']


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
      versions: [],
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
    const { location } = this.props;

    if(location.pathname.indexOf('/about') > -1 && this.shouldShowAboutTab())
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
              .get(null, null, {verbose: true, includeSummary: true})
              .then(response => {
                this.setState({versions: response.data, isLoadingVersions: false})
              })
    })
  }

  onTabChange = (event, value) => {
    this.setState({tab: value}, () => {
      if(isEmpty(this.state.versions))
        this.getVersions()
    })
  }

  refreshDataByURL() {
    this.setState({isLoading: true, notFound: false, accessDenied: false, permissionDenied: false}, () => {
      APIService.new()
                .overrideURL(this.getURLFromPath())
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
                      selectedConfig: defaultCustomConfig || COLLECTION_DEFAULT_CONFIG,
                      customConfigs: customConfigs,
                    }, () => {
                      if(isEmpty(this.state.versions))
                        this.getVersions()
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
      notFound, accessDenied, permissionDenied, isLoadingVersions
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
            />
            <CollectionHomeTabs
              tab={tab}
              onTabChange={this.onTabChange}
              collection={collection}
              versions={versions}
              match={this.props.match}
              location={this.props.location}
              versionedObjectURL={versionedObjectURL}
              currentVersion={this.getCurrentVersion()}
              aboutTab={showAboutTab}
              onVersionUpdate={this.onVersionUpdate}
              customConfigs={[...customConfigs, COLLECTION_DEFAULT_CONFIG]}
              onConfigChange={this.onConfigChange}
              selectedConfig={selectedConfig}
              showConfigSelection={this.customConfigFeatureApplicable()}
              isOCLDefaultConfigSelected={isEqual(selectedConfig, COLLECTION_DEFAULT_CONFIG)}
              isLoadingVersions={isLoadingVersions}
            />
          </div>
        }
      </div>
    )
  }
}

export default CollectionHome;
