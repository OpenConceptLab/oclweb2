import React from 'react';
import { CircularProgress } from '@mui/material';
import { get, isObject, has } from 'lodash';
import APIService from '../../services/APIService';
import { recordGAAction } from '../../common/utils'
import ScopeHeader from './ScopeHeader'
import MappingHomeDetails from './MappingHomeDetails';
import NotFound from '../common/NotFound';
import AccessDenied from '../common/AccessDenied';
import PermissionDenied from '../common/PermissionDenied';

class MappingHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notFound: false,
      accessDenied: false,
      permissionDenied: false,
      isLoading: true,
      isLoadingCollections: false,
      mapping: {},
      versions: [],
      collections: [],
    }
  }

  componentDidMount() {
    this.refreshDataByURL()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.pathname !== this.props.location.pathname) {
      this.refreshDataByURL()
    }
  }

  getMappingURLFromPath() {
    const { location, match, scoped, parentURL, mapping } = this.props;
    if(scoped === 'collection')
      return `${parentURL}mappings/${mapping.id}/${mapping.version}/`
    if(scoped)
      return location.pathname
    if(location.pathname.indexOf('/details') > -1)
      return location.pathname.split('/details')[0] + '/'
    if(location.pathname.indexOf('/history') > -1)
      return location.pathname.split('/history')[0] + '/'
    if(match.params.mappingVersion)
      return location.pathname.split('/').slice(0, 8).join('/') + '/';
    return this.getVersionedObjectURLFromPath();
  }

  getVersionedObjectURLFromPath() {
    const { location } = this.props;

    return location.pathname.split('/').slice(0, 7).join('/') + '/';
  }

  refreshDataByURL() {
    this.setState({isLoading: true, notFound: false, accessDenied: false, permissionDenied: false}, () => {
      const URL = this.getMappingURLFromPath()
      APIService.new()
        .overrideURL(URL)
        .get(null, null, {includeReferences: this.props.scoped === 'collection'})
        .then(response => {
          recordGAAction('Mapping', 'split_view', `Mapping - ${URL}`)
          if(get(response, 'detail') === "Not found.")
            this.setState({isLoading: false, mapping: {}, notFound: true, accessDenied: false, permissionDenied: false})
          else if(get(response, 'detail') === "Authentication credentials were not provided.")
            this.setState({isLoading: false, notFound: false, mapping: {}, accessDenied: true, permissionDenied: false})
          else if(get(response, 'detail') === "You do not have permission to perform this action.")
            this.setState({isLoading: false, notFound: false, mapping: {}, accessDenied: false, permissionDenied: true})
          else if(!isObject(response))
            this.setState({isLoading: false}, () => {throw response})
          else
            this.setState({isLoading: false, mapping: response.data}, () => {
              if(this.props.scoped !== 'collection') {
                this.getVersions()
                this.getCollectionVersions()
              }
            })
        })

    })
  }

  getVersions() {
    APIService.new()
              .overrideURL(this.getVersionedObjectURLFromPath() + 'versions/')
              .get(null, null, {includeCollectionVersions: true, includeSourceVersions: true})
              .then(response => {
                this.setState({versions: response.data})
              })
  }

  getCollectionVersions() {
    this.setState({isLoadingCollections: true}, () => {
      APIService.new()
                .overrideURL(this.getMappingURLFromPath() + 'collection-versions/?limit=100')
                .get()
                .then(response => {
                  this.setState({collections: response.data, isLoadingCollections: false})
                })
    })
  }

  isVersionedObject() {
    return this.props.global || !this.props.match.params.mappingVersion || this.state.mapping?.type === 'Mapping';
  }

  getContentMarginTop = () => `${get(document.querySelector('header.resource-header.home-header'), 'offsetHeight') || 95}px`;

  render() {
    const {
      mapping, versions, isLoading, notFound, accessDenied, permissionDenied, collections, isLoadingCollections
    } = this.state;
    const currentURL = this.getMappingURLFromPath()
    const isVersionedObject = this.isVersionedObject()
    const hasError = notFound || accessDenied || permissionDenied;
    const headerParams = {
      mapping: mapping,
      isVersionedObject: isVersionedObject,
      versionedObjectURL: this.getVersionedObjectURLFromPath(),
      currentURL: currentURL,
      header: has(this.props, 'header') ? this.props.header : true
    }
    return (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        { isLoading && <CircularProgress color='primary' /> }
        { notFound && <NotFound /> }
        { accessDenied && <AccessDenied /> }
        { permissionDenied && <PermissionDenied /> }
        {
          !isLoading && !hasError &&
            <div id='resource-item-container' className='col-xs-12 home-container no-side-padding'>
              <ScopeHeader
                {...headerParams}
                onClose={this.props.onClose}
                global={this.props.global}
                scoped={this.props.scoped}
                showActions={this.props.showActions}
              />
            <div className='col-xs-12' style={{position: 'relative', marginTop: this.getContentMarginTop()}}>
              <MappingHomeDetails
                scoped={this.props.scoped}
                singleColumn={this.props.singleColumn}
                isLoadingCollections={isLoadingCollections}
                mapping={{...mapping, collections: collections}}
                versions={versions}
              />
            </div>
          </div>
        }
      </div>
    )
  }
}

export default MappingHome;
