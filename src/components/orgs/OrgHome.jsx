import React from 'react';
import alertifyjs from 'alertifyjs';
import { CircularProgress } from '@mui/material';
import { reject, get, values, find, findIndex, isObject, isEqual, merge } from 'lodash';
import APIService from '../../services/APIService';
import { isCurrentUserMemberOf, isAdminUser } from '../../common/utils';
import HomeHeader from './HomeHeader';
import HomeTabContent from './HomeTabContent';
import NotFound from '../common/NotFound';
import AccessDenied from '../common/AccessDenied';
import PermissionDenied from '../common/PermissionDenied';
import { ORG_DEFAULT_CONFIG } from "../../common/defaultConfigs"

class OrgHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notFound: false,
      accessDenied: false,
      permissionDenied: false,
      isLoading: true,
      org: {},
      pins: [],
      tab: this.getDefaultTabIndex(),
      selectedConfig: null,
      customConfigs: [],
      members: [],
    }
  }

  customConfigFeatureApplicable() {
    return this.props.location.search.indexOf('configs=true') > -1;
  }

  getDefaultTabIndex() {
    const { location } = this.props;

    if(location.pathname.indexOf('/about') > -1)
      return 0;
    if(location.pathname.indexOf('/overview') > -1)
      return 0;
    if(location.pathname.indexOf('/members') > -1)
      return 3;
    if(location.pathname.indexOf('/collections') > -1)
      return 2;
    if(location.pathname.indexOf('/sources') > -1)
      return 1;

    return 0;
  }

  getDefaultTabIndexFromConfig() {
    if(this.isOCLDefaultConfigSelected())
      return this.getDefaultTabIndex()

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

  getAppliedViewConfig = () => {
    const { selectedConfig, org } = this.state
    const headerConfig = this.isOCLDefaultConfigSelected() ? merge(selectedConfig.config.header, org.overview) : merge(org.overview, selectedConfig.config.header)
    return {...selectedConfig, config: {...selectedConfig.config, header: headerConfig}}
  }

  refreshDataByURL() {
    const service = this.getOrgService()
    const customConfigFeatureApplicable = this.customConfigFeatureApplicable();
    if(service) {
      this.setState(
        {isLoading: true, notFound: false, accessDenied: false, permissionDenied: false},
        () => service
          .get(null, null, {includeClientConfigs: customConfigFeatureApplicable, includeOverview: true})
          .then(response => {
            if(get(response, 'detail') === "Not found.")
              this.setState({isLoading: false, notFound: true, org: {}, accessDenied: false, permissionDenied: false})
            else if(get(response, 'detail') === "Authentication credentials were not provided.")
              this.setState({isLoading: false, notFound: false, org: {}, accessDenied: true, permissionDenied: false})
            else if(get(response, 'detail') === "You do not have permission to perform this action.")
              this.setState({isLoading: false, notFound: false, org: {}, accessDenied: false, permissionDenied: true})
            else if(!isObject(response))
              this.setState({isLoading: false}, () => {throw response})
            else {
              const org = response.data;
              const customConfigs = get(response.data, 'client_configs', [])
              const defaultCustomConfig = find(customConfigs, {is_default: true});
              this.setState({
                isLoading: false,
                org: org,
                selectedConfig: defaultCustomConfig || ORG_DEFAULT_CONFIG,
                customConfigs: customConfigs,
              }, () => {
                this.getMembersSummary()
                this.setTab()
              })
            }
          }))
    }
  }

  onConfigChange = config => this.setState({selectedConfig: config})

  onTabChange = (event, value) => this.setState({tab: value})

  getPins() {
    const service = this.getPinsService()
    if(service)
      service.get().then(response => this.setState({pins: response.data}))
  }

  getMembersSummary() {
    this.getOrgService().appendToUrl('members').get(null, null, {summary: true}).then(response => this.setState({members: response.data}))
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
            alertifyjs.error(values(response.error).join('.<br />'))
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

  isOCLDefaultConfigSelected = () => isEqual(this.state.selectedConfig, ORG_DEFAULT_CONFIG);

  render() {
    const {
      org, isLoading, tab, pins, customConfigs,
      notFound, accessDenied, permissionDenied, members
    } = this.state;
    const selectedConfig = this.getAppliedViewConfig()
    const url = this.getURLFromPath()
    const isCurrentUserMemberOfOrg = isCurrentUserMemberOf(this.getOrgId()) || isAdminUser();
    const hasError = notFound || accessDenied || permissionDenied;
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
              tab !== null &&
              <React.Fragment>
                <HomeHeader
                  org={org}
                  url={url}
                  config={selectedConfig}
                  tab={tab}
                  onTabChange={this.onTabChange}
                  location={this.props.location}
                  match={this.props.match}
                  pins={pins}
                  onPinCreate={this.createPin}
                  onPinDelete={this.deletePin}
                  customConfigs={[...customConfigs, ORG_DEFAULT_CONFIG]}
                  onConfigChange={this.onConfigChange}
                  isOCLDefaultConfigSelected={this.isOCLDefaultConfigSelected()}
                  aboutTab
                  showConfigSelection={this.customConfigFeatureApplicable()}
                />
                <HomeTabContent
                  org={org}
                  url={url}
                  selectedConfig={selectedConfig}
                  tab={tab}
                  onTabChange={this.onTabChange}
                  location={this.props.location}
                  match={this.props.match}
                  pins={pins}
                  onPinCreate={this.createPin}
                  onPinDelete={this.deletePin}
                  showPin={isCurrentUserMemberOfOrg}
                  onPinOrderUpdate={this.updatePinOrder}
                  customConfigs={[...customConfigs, ORG_DEFAULT_CONFIG]}
                  onConfigChange={this.onConfigChange}
                  aboutTab
                  showConfigSelection={this.customConfigFeatureApplicable()}
                  members={members}
                />
              </React.Fragment>
            }
          </div>
        }
      </div>
    )
  }
}

export default OrgHome;
