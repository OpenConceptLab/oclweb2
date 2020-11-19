import React from 'react';
import { CircularProgress } from '@material-ui/core';
import APIService from '../../services/APIService';
import SourceHomeHeader from './SourceHomeHeader';
import SourceHomeTabs from './SourceHomeTabs';

class SourceHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      source: {},
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
              .get()
              .then(response => {
                this.setState({versions: response.data})
              })
  }

  onTabChange = (event, value) => {
    this.setState({tab: value}, () => {
      if(value === 3)
        this.getVersions()
    })
  }

  refreshDataByURL() {
    this.setState({isLoading: true}, () => {
      APIService.new()
                .overrideURL(this.getURLFromPath())
                .get()
                .then(response => {
                  this.setState({isLoading: false, source: response.data}, () => {
                    if(this.state.tab === 1)
                      this.getVersions()
                  })
                })

    })
  }

  isVersionedObject() {
    return !this.props.match.params.version
  }

  render() {
    const { source, versions, isLoading, tab } = this.state;
    const currentURL = this.getURLFromPath()
    return (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        {
          isLoading ?
          <CircularProgress color='primary' /> :
          <div className='col-md-12 home-container no-side-padding'>
            <SourceHomeHeader
              source={source}
              isVersionedObject={this.isVersionedObject()}
              versionedObjectURL={this.getVersionedObjectURLFromPath()}
              currentURL={currentURL}
            />
            <SourceHomeTabs tab={tab} onChange={this.onTabChange} source={source} versions={versions} />
          </div>
        }
      </div>
    )
  }
}

export default SourceHome;
