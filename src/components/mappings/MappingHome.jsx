import React from 'react';
import { CircularProgress } from '@mui/material';
import { get, isObject, has } from 'lodash';
import APIService from '../../services/APIService';
import ScopeHeader from './ScopeHeader'
import MappingHomeHeader from './MappingHomeHeader';
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
      mapping: {},
      versions: [],
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
    const { location, match } = this.props;
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
      APIService.new()
                .overrideURL(this.getMappingURLFromPath())
                .get()
                .then(response => {
                  if(get(response, 'detail') === "Not found.")
                    this.setState({isLoading: false, mapping: {}, notFound: true, accessDenied: false, permissionDenied: false})
                  else if(get(response, 'detail') === "Authentication credentials were not provided.")
                    this.setState({isLoading: false, notFound: false, mapping: {}, accessDenied: true, permissionDenied: false})
                  else if(get(response, 'detail') === "You do not have permission to perform this action.")
                    this.setState({isLoading: false, notFound: false, mapping: {}, accessDenied: false, permissionDenied: true})
                  else if(!isObject(response))
                    this.setState({isLoading: false}, () => {throw response})
                  else
                    this.setState({isLoading: false, mapping: response.data}, this.getVersions)
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

  isVersionedObject() {
    return !this.props.match.params.mappingVersion;
  }

  render() {
    const {
      mapping, versions, isLoading, notFound, accessDenied, permissionDenied
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
          <div className='col-md-12 home-container no-side-padding'>
            {
              this.props.scoped ?
              <ScopeHeader {...headerParams} onClose={this.props.onClose} /> :
              <MappingHomeHeader {...headerParams} />
            }
            <div className='col-md-12'>
              <MappingHomeDetails
                scoped={this.props.scoped}
                singleColumn={this.props.singleColumn}
                mapping={mapping}
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
