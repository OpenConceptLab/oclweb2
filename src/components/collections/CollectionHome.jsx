import React from 'react';
import { CircularProgress } from '@mui/material';
import { includes, isEmpty, get, findIndex, isEqual, find, isObject, isNumber } from 'lodash';
import APIService from '../../services/APIService';
import CollectionHomeHeader from './CollectionHomeHeader';
import CollectionHomeTabs from './CollectionHomeTabs';
import NotFound from '../common/NotFound';
import AccessDenied from '../common/AccessDenied';
import PermissionDenied from '../common/PermissionDenied';
import { COLLECTION_DEFAULT_CONFIG } from "../../common/defaultConfigs"
import ConceptHome from '../concepts/ConceptHome';
import MappingHome from '../mappings/MappingHome';
import ResponsiveDrawer from '../common/ResponsiveDrawer';
import Breadcrumbs from '../sources/Breadcrumbs';
import { paramsToURI, paramsToParentURI } from '../../common/utils';
import { OperationsContext } from '../app/LayoutContext';

const TABS = ['details', 'concepts', 'mappings', 'references', 'versions', 'summary', 'about']

class CollectionHome extends React.Component {
  static contextType = OperationsContext
  constructor(props) {
    super(props);
    this.state = {
      width: false,
      notFound: false,
      accessDenied: false,
      permissionDenied: false,
      isLoading: true,
      isLoadingExpansions: true,
      collection: {},
      expansion: {},
      versions: [],
      expansions: [],
      tab: this.getDefaultTabIndex(),
      selectedConfig: null,
      customConfigs: [],
      selected: null,
      filtersOpen: false,
      collectionVersionSummary: {}
    }
  }

  setPaths = () => {
    const { params } = this.props.match
    this.collectionPath = paramsToParentURI(params, true)
    this.collectionVersionPath = (params.version && params.version !== 'summary') ? this.collectionPath + params.version + '/' : this.collectionPath + 'HEAD/'
    this.currentPath = paramsToURI(params)
    this.isConceptSelected = Boolean(params.concept)
    this.isMappingSelected = Boolean(params.mapping)
    this.isChildSelected = this.isConceptSelected || this.isMappingSelected
    this.isHEAD = !params.version || params.version === 'HEAD'
    if(this.isChildSelected) {
      this.isVersionedChild = Boolean(params.conceptVersion || params.mappingVersion)
      this.fetchChildFromURL()
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
    let tab = this.getDefaultTabIndex()
    if(tab === 0)
      tab = this.getDefaultTabIndexFromConfig()
    this.setState({tab: tab});
  }

  getDefaultTabIndex() {
    const { location } = this.props;

    if(location.pathname.indexOf('/about') > -1 && this.shouldShowAboutTab())
      return 5;
    if(location.pathname.indexOf('/summary') > -1)
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
    this.setPaths()
    this.refreshDataByURL(true)
    this.interval = setInterval(this.setContainerWidth, 100)
  }

  componentWillUnmount() {
    if(this.interval)
      clearInterval(this.interval)
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.pathname !== this.props.location.pathname) {
      this.setPaths()
      this.refreshDataByURL(false)
      this.onTabChange(null, this.getDefaultTabIndex())
    }
  }

  getVersionedObjectURLFromPath() {
    const { location } = this.props;

    return location.pathname.split('/').slice(0, 5).join('/') + '/';
  }

  currentTabConfig = () => get(this.state.selectedConfig, `config.tabs.${this.state.tab}`)

  isSummaryTabSelected = () => get(this.currentTabConfig(), 'type') === 'summary';

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
    if(match.params.expansion)
      return location.pathname.split('/').slice(0, 8).join('/') + '/';

    return this.getVersionedObjectURLFromPath();
  }

  getResourceURLs() {
    const { match } = this.props
    const collectionURL = this.collectionPath

    let urls = {collection: collectionURL, version: null, expansion: null}
    if(match.params.version && !includes(['references', 'versions', 'expansions', 'concepts', 'mappings', 'about', 'details', 'summary'], match.params.version)) {
      urls.version = collectionURL + match.params.version + '/'

      if(match.params.expansion && !includes(['references', 'versions', 'expansions', 'concepts', 'mappings', 'about', 'details'], match.params.expansion))
        urls.expansion= collectionURL + match.params.version + '/' + 'expansions/' + match.params.expansion + '/'
    }

    return urls
  }

  getVersions() {
    APIService
      .new()
      .overrideURL(this.collectionPath + 'versions/')
      .get(null, null, {limit: 1000, brief: true})
      .then(response => this.setState({versions: response.data}))
  }

  getExpansions() {
    this.setState({isLoadingExpansions: true}, () => {
      APIService.new().overrideURL(this.collectionVersionPath).appendToUrl('expansions/').get().then(response => {
        this.setState({expansions: response.data, isLoadingExpansions: false})
      })

    })
  }

  onTabChange = (event, value) => {
    this.setState({tab: value, selected: null, width: false}, () => {
      if(isEmpty(this.state.versions))
        this.getVersions()
      if(this.isSummaryTabSelected())
        this.fetchSelectedCollectionVersionSummary()
    })
  }

  fetchSelectedCollectionVersionSummary = () => {
    this.setState({collectionVersionSummary: {}}, () => {
      const { collection } = this.state
      APIService.new().overrideURL(collection.version_url || collection.url).appendToUrl('summary/').get(null, null, {verbose: true}).then(response => this.setState({collectionVersionSummary: response.data}))
    })
  }

  fetchExpansion(expansionURL) {
    if(expansionURL) {
      APIService.new().overrideURL(expansionURL).get().then(response => {
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

  refreshDataByURL(fetchSummary) {
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
              selectedConfig: defaultCustomConfig || COLLECTION_DEFAULT_CONFIG,
              customConfigs: customConfigs,
            }, () => {
              const expansionURL = this.URLs.expansion || collection.expansion_url
              if(expansionURL)
                this.fetchExpansion(expansionURL)
              this.setTab()
              this.getVersions()
              this.getExpansions()

              const { setParentResource, setParentItem } = this.context
              setParentItem(this.state.collection)
              setParentResource('collection')
              if(fetchSummary && this.isSummaryTabSelected())
                this.fetchSelectedCollectionVersionSummary()
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

  fetchChildFromURL = () => {
    if(this.isChildSelected)
      APIService.new().overrideURL(this.currentPath).get().then(response => this.setState({selected: response.data}))
  }

  onResourceSelect = selected => this.setState({selected: selected, width: selected ? this.state.width : false}, () => {
    const { setOperationItem } = this.context
    setOperationItem({...selected, parentVersion: this.props.match.params.version})
  })

  getContainerWidth = () => {
    const { selected, width, filtersOpen } = this.state;
    let totalWidth = 100
    if(selected) {
      const resourceDom = document.getElementById('resource-item-container')
      let itemWidth = 0
      if(resourceDom)
        itemWidth = resourceDom.getBoundingClientRect()?.width || 0
      if(width)
        totalWidth = `calc(${totalWidth}% - ${itemWidth - 10}px)`
      else
        totalWidth -= filtersOpen ? 46 : 40.5
    }
    if(isNumber(totalWidth))
      totalWidth = `${totalWidth}%`
    return totalWidth
  }

  setContainerWidth = () => {
    const el = document.getElementById('coll-container')
    if(el) {
      const width = this.getContainerWidth()
      el.style.width = width
    }
  }

  getBreadcrumbParams = () => {
    let params = {...this.props.match.params}
    const { selected } = this.state
    if(selected) {
      if(selected.map_type)
        params = {...params, mapping: selected.id, mappingVersion: selected.version}
      else
        params = {...params, concept: selected.id, conceptVersion: selected.version}
    }

    return params
  }

  onFilterDrawerToggle = () => this.setState({filtersOpen: !this.state.filtersOpen})

  render() {
    const { openOperations } = this.context;
    const {
      collection, versions, isLoading, tab, selectedConfig, customConfigs,
      notFound, accessDenied, permissionDenied, expansion, expansions, selected,
      isLoadingExpansions, filtersOpen
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
            <div className='col-xs-12 no-side-padding' style={filtersOpen ? {marginLeft: '12%', width: '88%'} : {}}>
              <div className='col-xs-12 no-side-padding' style={{zIndex: 1201, position: 'fixed', width: filtersOpen ? '88%' : '100%'}}>
                <Breadcrumbs
                  params={this.getBreadcrumbParams()}
                  container={collection}
                  isVersionedObject={this.isVersionedObject()}
                  versionedObjectURL={versionedObjectURL}
                  currentURL={currentURL}
                  config={selectedConfig}
                  versions={versions}
                  selectedResource={selected}
                  onSplitViewClose={() => this.setState({selected: null, width: false})}
                  expansions={expansions}
                  isLoadingExpansions={isLoadingExpansions}
                  expansion={expansion}
                />
              </div>

              <div id='coll-container' className='col-md-12 home-container no-side-padding' style={{width: this.getContainerWidth(), marginTop: '60px'}}>
                <CollectionHomeHeader
                  collection={collection}
                  isVersionedObject={this.isVersionedObject()}
                  versionedObjectURL={versionedObjectURL}
                  config={selectedConfig}
                  tab={tab}
                />
                <CollectionHomeTabs
                  tab={tab}
                  onTabChange={this.onTabChange}
                  collection={collection}
                  expansion={expansion}
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
                  isLoadingExpansions={isLoadingExpansions}
                  onSelect={this.onResourceSelect}
                  onFilterDrawerToggle={this.onFilterDrawerToggle}
                  collectionVersionSummary={this.state.collectionVersionSummary}
                />
              </div>
            </div>
        }
        {
          (isMappingSelected || isConceptSelected) &&
            <ResponsiveDrawer
              width={openOperations ? "29.5%" : "39.5%"}
              paperStyle={{background: '#f1f1f1', right: openOperations ? '350px' : 0}}
              variant='persistent'
              isOpen
              onClose={() => this.setState({selected: null, width: false})}
              onWidthChange={newWidth => this.setState({width: newWidth})}
              formComponent={
                <div className='col-xs-12 no-side-padding' style={{backgroundColor: '#f1f1f1', marginTop: '60px'}}>
                  {
                    isMappingSelected ?
                      <MappingHome
                        singleColumn
                        scoped='collection'
                        parent={collection}
                        parentURL={get(expansion, 'url') || collection.url || collection.version_url}
                        mapping={selected}
                        searchMeta={selected.meta}
                        _location={this.props.location}
                        _match={this.props.match}
                        location={{pathname: selected.version_url || selected.url}}
                        match={{params: {mappingVersion: selected.version, version: this.props.match.params.version}}}
                        header={false}
                        noRedirect
                      /> :
                    <ConceptHome
                      singleColumn
                      scoped='collection'
                      parent={collection}
                      parentURL={get(expansion, 'url') || collection.url || collection.version_url}
                      concept={selected}
                      searchMeta={selected.meta}
                      _location={this.props.location}
                      _match={this.props.match}
                      location={{pathname: selected.version_url || selected.url}}
                      match={{params: {conceptVersion: selected.version, version: this.props.match.params.version}}}
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

export default CollectionHome;
