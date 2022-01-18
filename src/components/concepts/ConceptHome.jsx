import React from 'react';
import Split from 'react-split'
import { CircularProgress } from '@mui/material';
import { get, isObject, isBoolean, has } from 'lodash';
import APIService from '../../services/APIService';
import { toParentURI } from '../../common/utils'
import NotFound from '../common/NotFound';
import AccessDenied from '../common/AccessDenied';
import PermissionDenied from '../common/PermissionDenied';
import HierarchyTraversalList from './HierarchyTraversalList';
import ConceptHomeHeader from './ConceptHomeHeader';
import ScopeHeader from './ScopeHeader'
import ConceptHomeDetails from './ConceptHomeDetails';
import '../common/Split.scss';

class ConceptHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isUpdatingFromHierarchy: false,
      isLoadingHierarchy: false,
      newChildren: [],
      hierarchy: false,
      notFound: false,
      accessDenied: false,
      permissionDenied: false,
      isLoading: true,
      isLoadingMappings: false,
      isLoadingCollections: false,
      isLoadingParents: false,
      isLoadingChildren: false,
      parentConcepts: null,
      concept: {},
      versions: [],
      mappings: [],
      collections: [],
      parents: [],
      childConcepts: [],
      source: {},
      openHierarchy: isBoolean(props.openHierarchy) ? props.openHierarchy : false,
    }
  }

  toggleHierarchy = () => this.setState({openHierarchy: !this.state.openHierarchy})

  componentDidMount() {
    this.refreshDataByURL()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.pathname !== this.props.location.pathname && !this.state.isUpdatingFromHierarchy) {
      this.refreshDataByURL()
    }
  }

  getConceptURLFromPath() {
    let uri;
    const { location, match } = this.props;
    if(location.pathname.indexOf('/details') > -1)
      uri = location.pathname.split('/details')[0] + '/'
    else if(location.pathname.indexOf('/history') > -1)
      uri = location.pathname.split('/history')[0] + '/'
    else if(location.pathname.indexOf('/mappings') > -1)
      uri = location.pathname.split('/mappings')[0] + '/'
    else if(match.params.conceptVersion)
      uri = location.pathname.split('/').slice(0, 8).join('/') + '/';
    else
      return this.getVersionedObjectURLFromPath();

    return uri
  }

  getVersionedObjectURLFromPath() {
    return this.props.location.pathname.split('/').slice(0, 7).join('/') + '/';
  }

  refreshDataByURL(url) {
    this.setState({isLoading: true, notFound: false, accessDenied: false, permissionDenied: false, hierarchy: false, newChildren: []}, () => {
      APIService.new()
                .overrideURL(encodeURI(url || this.getConceptURLFromPath()))
                .get(null, null, {includeHierarchyPath: true, includeParentConceptURLs: true})
                .then(response => {
                  if(get(response, 'detail') === "Not found.")
                    this.setState({isLoading: false, concept: {}, notFound: true, accessDenied: false, permissionDenied: false})
                  else if(get(response, 'detail') === "Authentication credentials were not provided.")
                    this.setState({isLoading: false, notFound: false, concept: {}, accessDenied: true, permissionDenied: false})
                  else if(get(response, 'detail') === "You do not have permission to perform this action.")
                    this.setState({isLoading: false, notFound: false, concept: {}, accessDenied: false, permissionDenied: true})
                  else if(!isObject(response))
                    this.setState({isLoading: false}, () => {throw response})
                  else
                    this.setState({isLoading: false, concept: response.data}, () => {
                      this.getHierarchy()
                      this.getVersions()
                      this.getMappings()
                      this.getParents()
                      this.getChildren()
                      this.getCollectionVersions()
                      this.fetchParent()
                    })
                })

    })
  }

  fetchParent() {
    const { concept } = this.state

    if(concept)
      APIService.new().overrideURL(toParentURI(concept.url)).get().then(response => this.setState({source: response.data}))
  }

  getHierarchy = () => this.setState({isLoadingHierarchy: true}, () => {
    const { hierarchy } = this.state
    const offset = hierarchy ? hierarchy.offset + 100 : 0
    const limit = get(hierarchy, 'limit', 100)
    const queryParams = {limit: limit, offset: offset}
    APIService
      .new()
      .overrideURL(toParentURI(this.getConceptURLFromPath()))
      .appendToUrl('/hierarchy/')
      .get(null, null, queryParams)
      .then(response => {
        if(!hierarchy)
          this.setState({isLoadingHierarchy: false, hierarchy: response.data, newChildren: []})
        else
          this.setState({
            isLoadingHierarchy: false,
            newChildren: response.data.children,
            hierarchy: {
              ...hierarchy,
              offset: response.data.offset,
              limit: response.data.limit
            }
          })
      })
  })

  fetchConceptChildren = (url, callback) => APIService.new()
                                                      .overrideURL(url)
                                                      .appendToUrl(`children/?includeChildConcepts=true`)
                                                      .get()
                                                      .then(response => callback(response.data))

  getVersions() {
    APIService.new()
              .overrideURL(encodeURI(this.getVersionedObjectURLFromPath()) + 'versions/')
              .get(null, null, {includeCollectionVersions: true, includeSourceVersions: true})
              .then(response => {
                this.setState({versions: response.data})
              })
  }

  getMappings() {
    this.setState({isLoadingMappings: true}, () => {
      APIService.new()
                .overrideURL(encodeURI(this.getConceptURLFromPath()) + 'mappings/?includeInverseMappings=true&limit=1000')
                .get()
                .then(response => {
                  this.setState({mappings: response.data, isLoadingMappings: false})
                })
    })
  }

  getParents() {
    this.setState({isLoadingParents: true}, () => {
      APIService.new()
                .overrideURL(encodeURI(this.getConceptURLFromPath()) + 'parents/?limit=100')
                .get()
                .then(response => {
                  this.setState({parentConcepts: response.data, isLoadingParents: false})
                })
    })
  }

  getChildren() {
    this.setState({isLoadingChildren: true}, () => {
      APIService.new()
                .overrideURL(encodeURI(this.getConceptURLFromPath()) + 'children/?limit=100')
                .get()
                .then(response => {
                  this.setState({childConcepts: response.data, isLoadingChildren: false})
                })
    })
  }

  getCollectionVersions() {
    this.setState({isLoadingCollections: true}, () => {
      APIService.new()
                .overrideURL(encodeURI(this.getConceptURLFromPath()) + 'collection-versions/?limit=100')
                .get()
                .then(response => {
                  this.setState({collections: response.data, isLoadingCollections: false})
                })
    })
  }

  isVersionedObject() {
    return !this.props.match.params.conceptVersion;
  }

  onConceptClick = concept => {
    this.setState({isUpdatingFromHierarchy: true, isLoading: true}, () => {
      window.location.hash = concept.url
      APIService.new()
                                    .overrideURL(encodeURI(concept.url))
                                    .get().then(response => {
                                      this.setState(
                                        {
                                          isLoading: false,
                                          concept: response.data,
                                          isUpdatingFromHierarchy: false
                                        },
                                        () => {
                                          this.getVersions()
                                          window.scrollTo(0, 0)
                                        }
                                      )
                                    })
    })
  }

  render() {
    const {
      concept, versions, mappings, isLoadingMappings, isLoading,
      notFound, accessDenied, permissionDenied, hierarchy, openHierarchy, newChildren,
      isLoadingHierarchy, collections, isLoadingCollections, source, isLoadingChildren, isLoadingParents,
      childConcepts, parentConcepts
    } = this.state;
    const currentURL = this.getConceptURLFromPath()
    const isVersionedObject = this.isVersionedObject()
    const hasError = notFound || accessDenied || permissionDenied;
    const conceptDetails = (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        { isLoading && <CircularProgress color='primary' /> }
        { notFound && <NotFound /> }
        { accessDenied && <AccessDenied /> }
        { permissionDenied && <PermissionDenied /> }
        {
          !isLoading && !hasError &&
          <React.Fragment>
            {
              this.props.scoped ?
              <ScopeHeader
                onClose={this.props.onClose}
                concept={concept}
                mappings={mappings}
                isVersionedObject={isVersionedObject}
                versionedObjectURL={this.getVersionedObjectURLFromPath()}
                currentURL={currentURL}
                hierarchy={openHierarchy}
                onHierarchyClick={this.toggleHierarchy}
                header={has(this.props, 'header') ? this.props.header : true}
              /> :
              <ConceptHomeHeader
                concept={concept}
                mappings={mappings}
                isVersionedObject={isVersionedObject}
                versionedObjectURL={this.getVersionedObjectURLFromPath()}
                currentURL={currentURL}
                hierarchy={openHierarchy}
                onHierarchyClick={this.toggleHierarchy}
                header={has(this.props, 'header') ? this.props.header : true}
              />
            }
            <div className='col-md-12'>
            <ConceptHomeDetails
              singleColumn={this.props.singleColumn}
              source={source}
              concept={{...concept, mappings: mappings, collections: collections}}
              parentConcepts={parentConcepts}
              childConcepts={childConcepts}
              isLoadingMappings={isLoadingMappings}
              isLoadingCollections={isLoadingCollections}
              isLoadingChildren={isLoadingChildren}
              isLoadingParents={isLoadingParents}
              versions={versions}
            />
            </div>
          </React.Fragment>
        }
      </div>
    )
    return (
      <div className='col-md-12 home-container no-side-padding' style={this.props.scoped ? {background: '#fafbfc'} : {}}>
        {
          openHierarchy ?
          <Split className='split' sizes={[25, 75]} minSize={50}>
            <div>
              {
                hierarchy ?
                <HierarchyTraversalList
                  data={hierarchy}
                  fetchChildren={this.fetchConceptChildren}
                  currentNodeURL={concept.url}
                  hierarchyPath={[...(concept.hierarchy_path || []), concept.url]}
                  onLoadMore={this.getHierarchy}
                  newChildren={newChildren}
                  isLoadingChildren={isLoadingHierarchy}
                  onClick={this.onConceptClick}
                /> :
                <div style={{display: 'flex', justifyContent: 'center', marginTop: '50px'}}>
                  <CircularProgress />
                </div>
              }
            </div>
            { conceptDetails }
          </Split> :
          conceptDetails
        }
      </div>
    )
  }
}

export default ConceptHome;
