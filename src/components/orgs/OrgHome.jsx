import React from 'react';
import { CircularProgress } from '@material-ui/core';
import APIService from '../../services/APIService';
import OrgHomeHeader from './OrgHomeHeader';
import OrgHomeTabs from './OrgHomeTabs';

class OrgHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      org: {},
      tab: this.getDefaultTabIndex()
    }
  }

  getDefaultTabIndex() {
    const { location } = this.props;

    if(location.pathname.indexOf('/about') > -1)
      return 3;
    if(location.pathname.indexOf('/members') > -1)
      return 2;
    if(location.pathname.indexOf('/collections') > -1)
      return 1;
    if(location.pathname.indexOf('/sources') > -1)
      return 0;

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

  getURLFromPath() {
    const { location } = this.props;

    return location.pathname.split('/').slice(0, 3).join('/') + '/';
  }

  refreshDataByURL() {
    this.setState(
      {isLoading: true},
      () => APIService.new()
                      .overrideURL(this.getURLFromPath())
                      .get()
                      .then(response => this.setState({isLoading: false, org: response.data})))
  }

  onTabChange = (event, value) => {
    this.setState({tab: value})
  }

  render() {
    const { org, isLoading, tab } = this.state;
    const url = this.getURLFromPath()
    return (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        {
          isLoading ?
          <CircularProgress color='primary' /> :
          <div className='col-md-12 home-container no-side-padding'>
            <OrgHomeHeader org={org} url={url} />
            <OrgHomeTabs
              tab={tab}
              onChange={this.onTabChange}
              org={org}
              location={this.props.location}
              url={url}
            />
          </div>
        }
      </div>
    )
  }
}

export default OrgHome;
