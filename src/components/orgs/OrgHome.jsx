import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { reject, get, isEmpty } from 'lodash';
import APIService from '../../services/APIService';
import { isCurrentUserMemberOf, isAdminUser } from '../../common/utils';
import Pins from '../common/Pins';
import OrgHomeHeader from './OrgHomeHeader';
import OrgHomeTabs from './OrgHomeTabs';

class OrgHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      org: {},
      pins: [],
      tab: this.getDefaultTabIndex()
    }
  }

  getDefaultTabIndex() {
    const { location } = this.props;

    if(location.pathname.indexOf('/about') > -1 && this.shouldShowAboutTab())
      return 3;
    if(location.pathname.indexOf('/members') > -1)
      return 2;
    if(location.pathname.indexOf('/collections') > -1)
      return 1;
    if(location.pathname.indexOf('/sources') > -1)
      return 0;

    return 0;
  }

  getOrgId() {
    return get(this.props, 'match.params.org')
  }

  getPinsService(pinId) {
    const service = this.getOrgService()
    if(service) {
      if(pinId)
        return service.pins(pinId)
      return service.pins()
    }
  }

  getOrgService() {
    const orgId = this.getOrgId()
    if(orgId)
      return APIService.orgs(orgId)
  }

  componentDidMount() {
    this.refreshDataByURL()
    this.getPins()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.pathname !== this.props.location.pathname) {
      this.refreshDataByURL()
      this.getPins()
      this.onTabChange(null, this.getDefaultTabIndex())
    }
  }

  getURLFromPath() {
    const { location } = this.props;

    return location.pathname.split('/').slice(0, 3).join('/') + '/';
  }

  refreshDataByURL() {
    const service = this.getOrgService()
    if(service) {
      this.setState(
        {isLoading: true},
        () => service
          .get()
          .then(response => this.setState({isLoading: false, org: response.data})))
    }
  }

  onTabChange = (event, value) => {
    this.setState({tab: value})
  }

  getPins() {
    const service = this.getPinsService()
    if(service)
      service.get().then(response => this.setState({pins: response.data}))
  }

  createPin = (resourceType, resourceId) => {
    const service = this.getPinsService()
    if(service) {
      service
        .post({resource_type: resourceType, resource_id: resourceId})
        .then(response => {
          if(get(response, 'status') === 201) {
            this.setState({pins: [...this.state.pins, response.data]})
          }
        })
    }
  }

  deletePin = pinId => {
    const service = this.getPinsService(pinId)
    if(service) {
      service
        .delete()
        .then(response => {
          if(get(response, 'status') === 204)
            this.setState({pins: reject(this.state.pins, {id: pinId})})
        })
    }
  }

  updatePinOrder = (pinId, newOrder) => {
    const service = this.getPinsService(pinId)
    service.put({order: newOrder}).then(() => {})
  }

  shouldShowAboutTab() {
    return !isEmpty(get(this, 'state.org.extras.about'));
  }

  render() {
    const { org, isLoading, tab, pins } = this.state;
    const url = this.getURLFromPath()
    const isCurrentUserMemberOfOrg = isCurrentUserMemberOf(this.getOrgId()) || isAdminUser();
    const showAboutTab = this.shouldShowAboutTab()
    return (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        {
          isLoading ?
          <CircularProgress color='primary' /> :
          <div className='col-md-12 home-container no-side-padding'>
            <OrgHomeHeader org={org} url={url} />
            <Pins
              pins={pins}
              onDelete={this.deletePin}
              canDelete={isCurrentUserMemberOfOrg}
              onOrderUpdate={this.updatePinOrder}
            />
            <OrgHomeTabs
              tab={tab}
              onTabChange={this.onTabChange}
              org={org}
              location={this.props.location}
              url={url}
              pins={pins}
              onPinCreate={this.createPin}
              onPinDelete={this.deletePin}
              showPin={isCurrentUserMemberOfOrg}
              aboutTab={showAboutTab}
            />
          </div>
        }
      </div>
    )
  }
}

export default OrgHome;
