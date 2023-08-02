import React from 'react';
import alertifyjs from 'alertifyjs';
import Split from 'react-split'
import { CircularProgress } from '@mui/material';
import { get, isObject, isBoolean, has, flatten, values, isArray, find, map } from 'lodash';
import APIService from '../../services/APIService';
import { toParentURI, currentUserHasAccess, recordGAAction, highlightTexts } from '../../common/utils'
import NotFound from '../common/NotFound';
import AccessDenied from '../common/AccessDenied';
import PermissionDenied from '../common/PermissionDenied';
import HierarchyTraversalList from './HierarchyTraversalList';
import ScopeHeader from './ScopeHeader'
import ConceptHomeDetails from './ConceptHomeDetails';
import '../common/Split.scss';
import { OperationsContext } from '../app/LayoutContext';

class ConceptHome extends React.Component {
  static contextType = OperationsContext
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
      concept: {},
      versions: [],
      mappings: [],
      reverseMappings: [],
      collections: [],
      source: {},
      mappedSources: [],
      openHierarchy: isBoolean(props.openHierarchy) ? props.openHierarchy : false,
      includeRetiredAssociations: false,
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

    this.highlightFromSearch()
  }

  getConceptURLFromPath() {
    const { location, match, scoped, parentURL, concept, parent } = this.props;
    if(scoped === 'collection')
      return `${parentURL}concepts/${encodeURIComponent(concept.id)}/${concept.version}/`
    if(parent && parent.source_type) {
      const version = get(match, 'params.version')
      let URL = parent.url
      if(version && version !== 'HEAD')
        URL += version + '/'
      else
        URL
      URL += `concepts/${encodeURIComponent(concept.id)}/`
      if(match?.params?.conceptVersion)
        URL += `${match.params.conceptVersion}/`

      return URL
    }

    if(scoped)
      return location.pathname

    let uri;
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
      const URL = encodeURI(url || this.getConceptURLFromPath())
      APIService.new()
        .overrideURL(URL)
        .get(null, null, {includeReferences: this.props.scoped === 'collection'})
        .then(response => {
          recordGAAction('Concept', 'split_view', `Concept - ${URL}`)
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
              const { setOperationItem, setOpenOperations } = this.context
              setOperationItem({...response.data, parentVersion: this.props.match.params.version})
              if(this.props._location?.pathname.includes('/$cascade'))
                setOpenOperations(true)
              this.getMappings()
              this.fetchParent()
              if(this.props.scoped !== 'collection') {
                this.getVersions()
                this.getCollectionVersions()
              }
              if(!this.props.scoped)
                this.getHierarchy()
            })
        })
    })
  }

  highlightFromSearch = () => this.props.searchMeta && setTimeout(() => highlightTexts([{...this.state.concept, search_meta: this.props.searchMeta}]), 100)

  fetchParent() {
    const { concept } = this.state

    if(get(concept, 'url'))
      APIService
      .new()
      .overrideURL(toParentURI(concept.url))
      .get(null, null, {includeSummary: true})
      .then(response => this.setState({source: response.data}, () => {
        const { setParentResource, setParentItem, parentItem } = this.context
        if(!parentItem) {
          setParentItem(this.state.source)
          setParentResource('source')
        }

        if(this.isVersionedObject())
          this.fetchParentMappedSources()
      }))
  }

  fetchParentMappedSources() {
    const { source } = this.state
    if(source?.url) {
      APIService.new().overrideURL(source.url).appendToUrl('mapped-sources/').get(null, null, {includeSummary: true}).then(response => this.setState({mappedSources: response.data}))
    }
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

  getMappings = directOnly => {
    this.setState({isLoadingMappings: true}, () => {
      let url = this.getConceptURLFromPath()
      if(this.props.scoped === 'collection' && this.props.parentURL)
        url = `${this.props.parentURL}concepts/${encodeURIComponent(this.state.concept.id)}/`

      APIService.new()
        .overrideURL(encodeURI(url))
        .appendToUrl('$cascade/')
        .get(
          null,
          null,
          {
            cascadeLevels: 1,
            method: 'sourceToConcepts',
            view: 'hierarchy',
            includeRetired: this.state.includeRetiredAssociations
          }
        )
        .then(response => this.setState(
          {
            mappings: get(response.data, 'entry.entries', []),
            isLoadingMappings: !directOnly
          },
          () => !directOnly && this.getInverseMappings()
        ))
    })
  }

  getInverseMappings = inverseOnly => {
    let url = this.getConceptURLFromPath()
    if(this.props.scoped === 'collection' && this.props.parentURL)
      url = `${this.props.parentURL}concepts/${encodeURIComponent(this.state.concept.id)}/`

    const _fetch = () => APIService.new()
      .overrideURL(encodeURI(url))
      .appendToUrl('$cascade/')
      .get(null, null, {cascadeLevels: 1, method: 'sourceToConcepts', view: 'hierarchy', reverse: true, includeRetired: this.state.includeRetiredAssociations})
      .then(response => {
        this.setState({reverseMappings: get(response.data, 'entry.entries', []), isLoadingMappings: false})
      })

    inverseOnly ? this.setState({isLoadingMappings: true}, _fetch) : _fetch()

  }

  onRemoveMapping = (mapping, isDirect) => {
    const prompt = alertifyjs.prompt()
    prompt.setContent('<form id="retireForm"> <p>Retire Reason</p> <textarea required id="comment" style="width: 100%;"></textarea> </form>')
    prompt.set('onok', () => {
      document.getElementById('retireForm').reportValidity();
      const comment = document.getElementById('comment').value
      if(!comment)
        return false
      this.retireMapping(mapping, comment, isDirect)
    })
    prompt.set('title', 'Retire Mapping')
    prompt.show()
  }

  onReactivateMapping = (mapping, isDirect) => {
    const prompt = alertifyjs.prompt()
    prompt.setContent('<form id="retireForm"> <p>Unretire Reason</p> <textarea required id="comment" style="width: 100%;"></textarea> </form>')
    prompt.set('onok', () => {
      document.getElementById('retireForm').reportValidity();
      const comment = document.getElementById('comment').value
      if(!comment)
        return false
      this.unretireMapping(mapping, comment, isDirect)
    })
    prompt.set('title', 'Unretire Mapping')
    prompt.show()
  }

  retireMapping = (mapping, comment, isDirect) => {
    recordGAAction('Mapping Inline', 'retired_mapping', 'Retried Mapping from Concept Details using Quick Actions')
    APIService.new().overrideURL(mapping.url).delete({comment: comment}).then(response => {
      if(get(response, 'status') === 204) {
        isDirect ? this.getMappings(true) : this.getInverseMappings(true)
        alertifyjs.success('Mapping Retired', 1)
      }
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  unretireMapping = (mapping, comment, isDirect) => {
    recordGAAction('Mapping Inline', 'unretired_mapping', 'Reactivated retired Mapping from Concept Details using Quick Actions')
    APIService.new().overrideURL(mapping.url).appendToUrl('reactivate/').put({comment: comment}).then(response => {
      if(get(response, 'status') === 204) {
        isDirect ? this.getMappings(true) : this.getInverseMappings(true)
        alertifyjs.success('Mapping UnRetired', 1)
      }
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  onCreateNewMapping = (payload, targetConcept, isDirect, successCallback) => {
    recordGAAction('Mapping Inline', 'create_mapping', 'Created Mapping from Concept Details using Quick Actions')
    const { concept, mappings, reverseMappings } = this.state
    const URL = `${concept.owner_url}sources/${concept.source}/mappings/`
    const targetSourceURL = toParentURI(targetConcept.url)
    const refetchMappedSources = !find(this.state.mappedSources, {url: targetSourceURL})
    APIService.new().overrideURL(URL).post(payload).then(response => {
      if(response.status === 201) {
        if(this.props.onCreateNewMapping)
          this.props.onCreateNewMapping(response.data?.map_type)
        if(refetchMappedSources)
          this.fetchParentMappedSources()
        alertifyjs.success('Success')
        let newMapping = {
          ...response.data,
          cascade_target_concept_code: targetConcept.id,
          cascade_target_concept_url: targetConcept.url,
          cascade_target_source_owner: targetConcept.owner,
          cascade_target_source_name: targetConcept.source,
          cascade_target_concept_name: targetConcept.display_name,
        }
        if(isDirect)
          this.setState({
            mappings: [
              ...mappings,
              newMapping,
              {...targetConcept, entries: []}
            ]
          })
        else
          this.setState({
            reverseMappings: [
              ...reverseMappings,
              newMapping,
              {...targetConcept, entries: []}
            ]
          })
        if(successCallback)
          successCallback()
      } else {
        const errors = flatten(values(response))
        if(isArray(errors) && errors.length)
          alertifyjs.error(errors[0])
        else
          alertifyjs.error('Something bad happened!')
      }
    })
  }

  onUpdateMappingsSorting = mappings => {
    Promise.all(map(mappings, mapping => APIService.new().overrideURL(mapping.url).put({id: mapping.id, sort_weight: mapping._sort_weight, comment: 'Updated Sort Weight'}))).then(() => {
      alertifyjs.success('Mappings successfully updated.')
      this.getMappings(true)
    })
  }

  onClearSortWeight = mapping => {
    APIService.new().overrideURL(mapping.url).put({id: mapping.id, sort_weight: null, comment: 'Cleared Sort Weight'}).then(() => {
      alertifyjs.success('Mappings successfully updated.')
      this.getMappings(true)
    })
  }

  onAssignSortWeight = (mapping, sort_weight) => {
    APIService.new().overrideURL(mapping.url).put({id: mapping.id, sort_weight: sort_weight, comment: 'Assigned Sort Weight'}).then(() => {
      alertifyjs.success('Mappings successfully updated.')
      this.getMappings(true)
    })
  }

  onIncludeRetiredAssociationsToggle = includeRetired => this.setState({includeRetiredAssociations: includeRetired}, this.getMappings)

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
    return this.props.global || !this.props.match.params.conceptVersion || this.state.concept?.type === 'Concept'
  }

  onConceptClick = concept => {
    this.setState({isUpdatingFromHierarchy: true, isLoading: true}, () => {
      window.location.hash = concept.url
      APIService
        .new()
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

  getContentMarginTop = () => `${get(document.querySelector('header.resource-header.home-header'), 'offsetHeight') || 100}px`;

  render() {
    const {
      concept, versions, mappings, isLoadingMappings, isLoading,
      notFound, accessDenied, permissionDenied, hierarchy, openHierarchy, newChildren,
      isLoadingHierarchy, collections, isLoadingCollections, source, reverseMappings, mappedSources
    } = this.state;
    const currentURL = this.getConceptURLFromPath()
    const isVersionedObject = this.isVersionedObject()
    const hasError = notFound || accessDenied || permissionDenied;
    const detailsMargin = this.getContentMarginTop()
    const hasAccess = currentUserHasAccess()
    const canAct = Boolean(hasAccess && isVersionedObject && this.props.scoped != 'collection')
    const canSort = canAct
    const conceptDetails = (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        { isLoading && <CircularProgress color='primary' /> }
        { notFound && <NotFound /> }
        { accessDenied && <AccessDenied /> }
        { permissionDenied && <PermissionDenied /> }
        {
          !isLoading && !hasError &&
          <React.Fragment>
            <ScopeHeader
              isVersionedObject={isVersionedObject}
              scoped={this.props.scoped}
              global={this.props.global}
              onClose={this.props.onClose}
              concept={concept}
              mappings={mappings}
              versionedObjectURL={this.getVersionedObjectURLFromPath()}
              header={has(this.props, 'header') ? this.props.header : true}
              showActions={this.props.showActions}
              currentURL={currentURL}
            />
            <div className='col-xs-12' style={{position: 'relative', marginTop: detailsMargin, marginBottom: detailsMargin}}>
              <ConceptHomeDetails
                scoped={this.props.scoped}
                singleColumn={this.props.singleColumn}
                source={source}
                mappedSources={mappedSources}
                concept={{...concept, mappings: mappings, collections: collections, reverseMappings: reverseMappings}}
                isLoadingMappings={isLoadingMappings}
                isLoadingCollections={isLoadingCollections}
                versions={versions}
                sourceVersion={get(this.props.match, 'params.version')}
                parent={this.props.parent}
                onIncludeRetiredAssociationsToggle={this.onIncludeRetiredAssociationsToggle}
                onCreateNewMapping={canAct ? this.onCreateNewMapping : false}
                onUpdateMappingsSorting={canSort ? this.onUpdateMappingsSorting : false}
                onClearSortWeight={canSort ? this.onClearSortWeight : false}
                onAssignSortWeight={canSort ? this.onAssignSortWeight : false}
                onRemoveMapping={canAct ? this.onRemoveMapping : false}
                onReactivateMapping={canAct ? this.onReactivateMapping : false}
                sourceVersionSummary={this.props.sourceVersionSummary}
              />
            </div>
          </React.Fragment>
        }
      </div>
    )
    return (
      <div id='resource-item-container' className='col-xs-12 home-container no-side-padding' style={this.props.scoped ? {background: '#f1f1f1'} : {}}>
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
