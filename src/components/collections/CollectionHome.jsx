import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { includes } from 'lodash';
import APIService from '../../services/APIService';
import CollectionHomeHeader from './CollectionHomeHeader';
import CollectionHomeTabs from './CollectionHomeTabs';

const TABS = ['concepts', 'mappings', 'history', 'about']

class CollectionHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      collection: {},
      versions: [],
      tab: this.getDefaultTabIndex()
    }
  }

  getDefaultTabIndex() {
    const { location } = this.props;

    if(location.pathname.indexOf('/about') > -1)
      return 4;
    if(location.pathname.indexOf('/history') > -1)
      return 3;
    if(location.pathname.indexOf('/mappings') > -1)
      return 2;
    if(location.pathname.indexOf('/concepts') > -1)
      return 1;

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
    if(location.pathname.indexOf('/history') > -1)
      return location.pathname.split('/history')[0] + '/'
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
    APIService.new()
              .overrideURL(this.getVersionedObjectURLFromPath() + 'versions/')
              .get(null, null, {verbose: true})
              .then(response => {
                this.setState({versions: response.data})
              })
  }

  onTabChange = (event, value) => {
    this.setState({tab: value}, () => {
      if(includes([1, 2, 3], value))
        this.getVersions()
    })
  }

  refreshDataByURL() {
    this.setState({isLoading: true}, () => {
      APIService.new()
                .overrideURL(this.getURLFromPath())
                .get()
                .then(response => {
                  this.setState({isLoading: false, collection: response.data}, () => {
                    if(includes([1, 2, 3], this.state.tab))
                      this.getVersions()
                  })
                })

    })
  }

  isVersionedObject() {
    const version = this.props.match.params.version;
    if(version)
      return includes(TABS, version)
    return true
  }

  getCurrentVersion() {
    let version = this.props.match.params.version;

    if(!includes(['mappings', 'concepts', 'history', 'about'], version))
      return version
  }

  render() {
    const { collection, versions, isLoading, tab } = this.state;
    const currentURL = this.getURLFromPath()
    const versionedObjectURL = this.getVersionedObjectURLFromPath()
    return (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        {
          isLoading ?
          <CircularProgress color='primary' /> :
          <div className='col-md-12 home-container no-side-padding'>
            <CollectionHomeHeader
              collection={collection}
              isVersionedObject={this.isVersionedObject()}
              versionedObjectURL={versionedObjectURL}
              currentURL={currentURL}
            />
            <CollectionHomeTabs
              tab={tab}
              onChange={this.onTabChange}
              collection={collection}
              versions={versions}
              location={this.props.location}
              versionedObjectURL={versionedObjectURL}
              currentVersion={this.getCurrentVersion()}
            />
          </div>
        }
      </div>
    )
  }
}

export default CollectionHome;
