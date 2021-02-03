import React from 'react';
import alertifyjs from 'alertifyjs';
import { CircularProgress } from '@material-ui/core';
import { reject, get, values, find, findIndex, isEqual, isEmpty } from 'lodash';
import APIService from '../../services/APIService';
import { isCurrentUserMemberOf, isAdminUser } from '../../common/utils';
import Pins from '../common/Pins';
import OrgHomeHeader from './OrgHomeHeader';
import OrgHomeTabs from './OrgHomeTabs';
const DEFAULT_CONFIG = {
  name: 'OCL Default',
  web_default: true,
  is_default: false,
  page_size: 25,
  layout: 'table',
  config: {
    tabs: [
      {type: "sources", label: "Sources", page_size: 25, "default": true},
      {type: "collections", label: "Collections", page_size: 25},
      {type: "users", label: "Members", page_size: 25},
      {type: "about", label: "About"},
    ]
  }
}

class OrgHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      org: {},
      pins: [],
      tab: null,
      selectedConfig: null,
      customConfigs: [],
      isCustomConfigSelected: false,
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

  getDefaultTabIndexFromConfig() {
    const index = findIndex(this.state.selectedConfig.config.tabs, {"default": true});
    return index > -1 ? index : 0;
  }

  setTab() {
    this.setState({tab: this.getDefaultTabIndexFromConfig()});
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
          .get(null, null, {includeClientConfigs: true})
          .then(response => {
            const org = response.data;
            const customConfigs = get(response.data, 'client_configs', [])
            const defaultCustomConfig = find(customConfigs, {is_default: true});
            this.setState({
              isLoading: false,
              org: org,
              selectedConfig: defaultCustomConfig || DEFAULT_CONFIG,
              customConfigs: customConfigs,
              isCustomConfigSelected: Boolean(defaultCustomConfig),
            }, this.setTab)
          }))
    }
  }

  onConfigChange = config => {
    this.setState({
      selectedConfig: config,
      isCustomConfigSelected: !isEqual(config, DEFAULT_CONFIG)
    })
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
          if(get(response, 'status') === 201)
            this.setState({pins: [...this.state.pins, response.data]})
          else if (get(response, 'error'))
            alertifyjs.error(values(response.error).join('\n'))
          else
            alertifyjs.error('Something bad happened')
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

  updatePinOrder = (pinId, newOrder) => this.getPinsService(pinId)
                                            .put({order: newOrder})
                                            .then(() => {})

  shouldShowAboutTab() {
    return !isEmpty(get(this, 'state.org.text'));
  }

  render() {
    const { org, isLoading, tab, pins, selectedConfig, customConfigs } = this.state;
    const showAboutTab = this.shouldShowAboutTab();
    const url = this.getURLFromPath()
    const isCurrentUserMemberOfOrg = isCurrentUserMemberOf(this.getOrgId()) || isAdminUser();
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
            {
              tab !== null &&
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
                customConfigs={[...customConfigs, DEFAULT_CONFIG]}
                onConfigChange={this.onConfigChange}
                selectedConfig={selectedConfig}
                aboutTab={showAboutTab}
              />
            }
          </div>
        }
      </div>
    )
  }
}

export default OrgHome;
