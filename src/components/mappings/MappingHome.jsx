import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { includes, get, isObject } from 'lodash';
import APIService from '../../services/APIService';
import MappingHomeHeader from './MappingHomeHeader';
import MappingHomeTabs from './MappingHomeTabs';
import NotFound from '../common/NotFound';

const TABS = ['details', 'history'];

class MappingHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notFound: false,
      isLoading: true,
      mapping: {},
      versions: [],
      tab: this.getDefaultTabIndex(),
    }
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

  getDefaultTabIndex() {
    const { location } = this.props;

    if(location.pathname.indexOf('/history') > -1)
      return 1;

    return 0;
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
    this.setState({isLoading: true, notFound: false}, () => {
      APIService.new()
                .overrideURL(this.getMappingURLFromPath())
                .get()
                .then(response => {
                  if(get(response, 'detail') === "Not found.")
                    this.setState({isLoading: false, mapping: {}, notFound: true})
                  else if(!isObject(response))
                    this.setState({isLoading: false}, () => {throw response})
                  else
                    this.setState({isLoading: false, mapping: response.data}, () => {
                      if(this.state.tab === 1)
                        this.getVersions()
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

  onTabChange = (event, value) => {
    this.setState({tab: value}, () => {
      if(value === 1)
        this.getVersions()
    })
  }

  isVersionedObject() {
    const version = this.props.match.params.mappingVersion;
    if(version)
      return includes(TABS, version)
    return true
  }

  render() {
    const { mapping, versions, isLoading, tab, notFound } = this.state;
    const currentURL = this.getMappingURLFromPath()
    const isVersionedObject = this.isVersionedObject()
    return (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        {
          isLoading ?
          <CircularProgress color='primary' /> :
          (
            notFound ?
            <NotFound /> :
            <div className='col-md-12 home-container no-side-padding'>
              <MappingHomeHeader
                mapping={mapping}
                isVersionedObject={isVersionedObject}
                versionedObjectURL={this.getVersionedObjectURLFromPath()}
                currentURL={currentURL}
              />
              <MappingHomeTabs
                tab={tab}
                onChange={this.onTabChange}
                mapping={mapping}
                versions={versions}
                isVersionedObject={isVersionedObject}
              />
            </div>
          )
        }
      </div>
    )
  }
}

export default MappingHome;
