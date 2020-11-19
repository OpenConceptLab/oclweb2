import React from 'react';
import { CircularProgress } from '@material-ui/core';
import APIService from '../../services/APIService';
import ConceptHomeHeader from './ConceptHomeHeader';
import ConceptHomeTabs from './ConceptHomeTabs';
import { includes } from 'lodash';

const TABS = ['history'];

class ConceptHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      concept: {},
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

    if(location.pathname.indexOf('/mappings') > -1)
      return 1;
    if(location.pathname.indexOf('/history') > -1)
      return 2;

    return 0;
  }

  getConceptURLFromPath() {
    const { location, match } = this.props;
    if(location.pathname.indexOf('/history') > -1)
      return location.pathname.split('/history')[0] + '/'
    if(location.pathname.indexOf('/mappings') > -1)
      return location.pathname.split('/mappings')[0] + '/'
    if(match.params.conceptVersion)
      return location.pathname.split('/').slice(0, 8).join('/') + '/';
    return this.getVersionedObjectURLFromPath();
  }

  getVersionedObjectURLFromPath() {
    const { location } = this.props;

    return location.pathname.split('/').slice(0, 7).join('/') + '/';
  }

  refreshDataByURL() {
    this.setState({isLoading: true}, () => {
      APIService.new()
                .overrideURL(this.getConceptURLFromPath())
                .get(null, null, {includeInverseMappings: true})
                .then(response => {
                  this.setState({isLoading: false, concept: response.data}, () => {
                    if(this.state.tab === 2)
                      this.getVersions()
                  })
                })

    })
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
      if(value === 2)
        this.getVersions()
    })
  }

  isVersionedObject() {
    const version = this.props.match.params.conceptVersion;
    if(version)
      return includes(TABS, version)
    return true
  }

  render() {
    const { concept, versions, isLoading, tab } = this.state;
    const currentURL = this.getConceptURLFromPath()
    return (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        {
          isLoading ?
          <CircularProgress color='primary' /> :
          <div className='col-md-12 home-container no-side-padding'>
            <ConceptHomeHeader
              concept={concept}
              isVersionedObject={this.isVersionedObject()}
              versionedObjectURL={this.getVersionedObjectURLFromPath()}
              currentURL={currentURL}
            />
            <ConceptHomeTabs tab={tab} onChange={this.onTabChange} concept={concept} versions={versions} currentURL={currentURL} />
          </div>
        }
      </div>
    )
  }
}

export default ConceptHome;
