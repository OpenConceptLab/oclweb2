import React from 'react';
import { CircularProgress } from '@mui/material';
import { includes, isEmpty, get, findIndex, isEqual, find, isObject, omit, forEach, isNumber } from 'lodash';
import APIService from '../../services/APIService';
import SourceHomeHeader from './SourceHomeHeader';
import Breadcrumbs from './Breadcrumbs';
import SourceHomeTabs from './SourceHomeTabs';
import NotFound from '../common/NotFound';
import AccessDenied from '../common/AccessDenied';
import PermissionDenied from '../common/PermissionDenied';
import ConceptHome from '../concepts/ConceptHome';
import MappingHome from '../mappings/MappingHome';
import ResponsiveDrawer from '../common/ResponsiveDrawer';
import { SOURCE_DEFAULT_CONFIG } from "../../common/defaultConfigs"
import { paramsToURI, paramsToParentURI } from '../../common/utils';
import { OperationsContext } from '../app/LayoutContext';

const TABS = ['details', 'concepts', 'mappings', 'versions', 'summary', 'about']

class SourceHome extends React.Component {
  static contextType = OperationsContext
  constructor(props) {
    super(props);
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
      selected: null,
      hierarchy: false,
      filtersOpen: false,
      sourceVersionSummary: {},
    }
  }

  setPaths = () => {
    const { params } = this.props.match
    this.currentPath = paramsToURI(params)
    this.versionedPath = paramsToURI(params, true)
    this.isConceptSelected = Boolean(params.concept)
    this.isMappingSelected = Boolean(params.mapping)
    this.isChildSelected = this.isConceptSelected || this.isMappingSelected
    this.isHEAD = !params.version || params.version === 'HEAD'
    if(this.isChildSelected) {
      this.sourcePath = paramsToParentURI(params, true)
      this.sourceVersionPath = paramsToParentURI(params)
      this.isVersionedChild = Boolean(params.conceptVersion || params.mappingVersion)
      this.fetchChildFromURL()
    } else {
      this.sourcePath = this.versionedPath
      this.sourceVersionPath = this.currentPath
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
      return 4;
    if(location.pathname.indexOf('/summary') > -1)
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
    this.setPaths()
    this.refreshDataByURL()
    this.interval = setInterval(this.setContainerWidth, 100)
  }

  componentWillUnmount() {
    if(this.interval)
      clearInterval(this.interval)
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.pathname !== this.props.location.pathname) {
      this.setPaths()
      this.refreshDataByURL()
      this.onTabChange(null, this.getDefaultTabIndex())
    }
  }

  getVersions() {
    this.setState({isLoadingVersions: true}, () => {
      APIService
        .new()
        .overrideURL(this.sourcePath + 'versions/')
        .get(null, null, {verbose: true, limit: 1000})
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
    if(this.state.tab === value)
      return
    this.setState({tab: value, selected: null, width: false}, () => {
      if(isEmpty(this.state.versions))
        this.getVersions()
      if(this.isVersionTabSelected())
        this.fetchVersionsSummary()
      if(this.isSummaryTabSelected())
        this.fetchSelectedSourceVersionSummary()
    })
  }

  fetchSelectedSourceVersionSummary = () => {
    this.setState({sourceVersionSummary: {}}, () => {
      const { source } = this.state
      APIService.new().overrideURL(source.version_url || source.url).appendToUrl('summary/').get(null, null, {verbose: true}).then(response => this.setState({sourceVersionSummary: response.data}))
    })
  }

  refreshDataByURL() {
    this.setState({isLoading: true, notFound: false, accessDenied: false, permissionDenied: false}, () => {
      APIService.new()
        .overrideURL(this.sourceVersionPath)
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
              this.setTab()
              this.getVersions()
              const { setParentResource, setParentItem } = this.context
              setParentItem(this.state.source)
              setParentResource('source')
              this.fetchSelectedSourceVersionSummary()
            })
          }
        })

    })
  }

  fetchSummary() {
    APIService.new()
      .overrideURL(this.sourcePath)
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

  fetchChildFromURL = () => {
    if(this.isChildSelected)
      APIService.new().overrideURL(this.currentPath).get().then(response => this.setState({selected: response.data}))
  }

  onResourceSelect = selected => this.setState({selected: selected, width: selected ? this.state.width : false}, () => {
    const { setOperationItem } = this.context
    setOperationItem({...selected, parentVersion: this.props.match.params.version})
  })

  currentTabConfig = () => get(this.state.selectedConfig, `config.tabs.${this.state.tab}`)

  isVersionTabSelected = () => get(this.currentTabConfig(), 'type') === 'versions';

  isSummaryTabSelected = () => get(this.currentTabConfig(), 'type') === 'summary';

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
    const el = document.getElementById('source-container')
    if(el) {
      const width = this.getContainerWidth()
      el.style.width = width
    }
  }

  getBreadcrumbParams = () => {
    let params = {...this.props.match.params}
    const { selected } = this.state
    if(selected) {
      const isVersionedObject = selected.uuid === selected.versioned_object_id.toString() || selected.is_latest_version
      if(selected.map_type)
        params = {...params, mapping: selected.id, mappingVersion: isVersionedObject ? null : selected.version}
      else
        params = {...params, concept: selected.id, conceptVersion: isVersionedObject ? null : selected.version}
    }

    return params
  }

  onFilterDrawerToggle = () => this.setState({filtersOpen: !this.state.filtersOpen})

  render() {
    const { openOperations } = this.context;
    const {
      source, versions, isLoading, tab, selectedConfig, customConfigs,
      notFound, accessDenied, permissionDenied, isLoadingVersions, selected, hierarchy, filtersOpen
    } = this.state;
    const showAboutTab = this.shouldShowAboutTab();
    const hasError = notFound || accessDenied || permissionDenied;
    const isMappingSelected = Boolean(selected && get(selected, 'map_type'))
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
                  container={source}
                  isVersionedObject={this.isVersionedObject()}
                  versionedObjectURL={this.sourcePath}
                  currentURL={this.sourceVersionPath}
                  config={selectedConfig}
                  versions={versions}
                  selectedResource={selected}
                  onSplitViewClose={() => this.setState({selected: null, width: false})}
                />
              </div>
              <div id='source-container' className='col-xs-12 home-container no-side-padding' style={{width: this.getContainerWidth(), marginTop: '60px'}}>
                <SourceHomeHeader
                  source={source}
                  isVersionedObject={this.isVersionedObject()}
                  versionedObjectURL={this.sourcePath}
                  currentURL={this.sourceVersionPath}
                  config={selectedConfig}
                  versions={versions}
                />
                <SourceHomeTabs
                  tab={tab}
                  onTabChange={this.onTabChange}
                  source={source}
                  versions={versions}
                  location={this.props.location}
                  match={this.props.match}
                  versionedObjectURL={this.sourcePath}
                  currentVersion={this.getCurrentVersion()}
                  aboutTab={showAboutTab}
                  onVersionUpdate={this.onVersionUpdate}
                  customConfigs={[...customConfigs, SOURCE_DEFAULT_CONFIG]}
                  onConfigChange={this.onConfigChange}
                  selectedConfig={selectedConfig}
                  showConfigSelection={this.customConfigFeatureApplicable()}
                  isOCLDefaultConfigSelected={isEqual(selectedConfig, SOURCE_DEFAULT_CONFIG)}
                  isLoadingVersions={isLoadingVersions}
                  onSelect={this.onResourceSelect}
                  hierarchy={hierarchy}
                  onHierarchyToggle={get(source, 'hierarchy_root_url') ? () => this.setState({hierarchy: !hierarchy}) : false}
                  onFilterDrawerToggle={this.onFilterDrawerToggle}
                  sourceVersionSummary={this.state.sourceVersionSummary}
                />
              </div>
            </div>
        }
        {
          selected &&
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
                        scoped
                        mapping={selected}
                        _location={this.props.location}
                        _match={this.props.match}
                        location={{pathname: selected.versioned_object_id.toString() === selected.uuid ? selected.url : selected.version_url}}
                        match={{params: {mappingVersion: selected.versioned_object_id.toString() === selected.uuid ? null : selected.version, version: this.props.match.params.version}}}
                        header={false}
                        source={source}
                        noRedirect
                        sourceVersionSummary={this.state.sourceVersionSummary}
                      /> :
                    <ConceptHome
                      singleColumn
                      scoped
                      concept={selected}
                      parent={source}
                      _location={this.props.location}
                      _match={this.props.match}
                      location={{pathname: selected.versioned_object_id.toString() === selected.uuid ? selected.url : selected.version_url}}
                      match={{params: {conceptVersion: selected.versioned_object_id.toString() === selected.uuid ? null : selected.version, version: this.props.match.params.version}}}
                      openHierarchy={false}
                      header={false}
                      noRedirect
                      sourceVersionSummary={this.state.sourceVersionSummary}
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
