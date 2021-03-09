import React from 'react';
import { reject, get } from 'lodash';
import APIService from '../../services/APIService';
import {
  defaultCreatePin, defaultDeletePin, getCurrentUserUsername, isAdminUser
} from '../../common/utils';
import Pins from '../common/Pins';
import UserHomeDetails from './UserHomeDetails';
import UserHomeTabs from './UserHomeTabs';
import NotFound from '../common/NotFound';

class UserHome extends React.Component {
  constructor(props) {
    super(props);
    this.url = this.getURLFromPath(props);
    this.state = {
      notFound: false,
      user: {},
      pins: [],
      tab: this.getDefaultTabIndex()
    }
  }

  getUsername() {
    return get(this.props, 'match.params.user')
  }

  getPinsService(pinId) {
    const service = this.getUserService()
    if(service) {
      if(pinId)
        return service.pins(pinId)
      return service.pins()
    }
  }

  getUserService() {
    const username = this.getUsername()
    if(username)
      return APIService.users(username)
  }

  getURLFromPath(props) {
    props = props || this.props;
    const { location } = props;

    return location.pathname.split('/').slice(0, 3).join('/') + '/';
  }

  getDefaultTabIndex() {
    const { location } = this.props;

    if(location.pathname.indexOf('/organizations') > -1)
      return 2;
    if(location.pathname.indexOf('/orgs') > -1)
      return 2;
    if(location.pathname.indexOf('/collections') > -1)
      return 1;
    return 0;
  }

  componentDidMount() {
    this.refreshDataByURL()
    this.getUserPins()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.pathname !== this.props.location.pathname) {
      this.url = this.getURLFromPath()
      this.refreshDataByURL()
      this.getUserPins()
      this.onTabChange(null, this.getDefaultTabIndex())
    }
  }

  refreshDataByURL() {
    const service = this.getUserService()
    if(service) {
      this.setState(
        { isLoading: true, notFound: false },
        () => service
          .get(null, null, {verbose: true})
          .then(response => {
            if(get(response, 'detail') === "Not found.")
              this.setState({isLoading: false, notFound: true, user: {}})
            else
              this.setState({ user: response.data, isLoading: false })
          }))
    }
  }

  onTabChange = (event, value) => {
    this.setState({tab: value})
  }

  getUserPins() {
    const service = this.getPinsService()
    if(service)
      service.get().then(response => this.setState({pins: response.data}))
  }

  createPin = (resourceType, resourceId) => {
    const service = this.getPinsService()
    defaultCreatePin(resourceType, resourceId, service, createdPin => {
      this.setState({pins: [...this.state.pins, createdPin]})
    })
  }

  deletePin = pinId => {
    const service = this.getPinsService(pinId)
    defaultDeletePin(service, () => {
      this.setState({pins: reject(this.state.pins, {id: pinId})})
    })
  }

  updatePinOrder = (pinId, newOrder) => {
    const service = this.getPinsService(pinId)
    service.put({order: newOrder}).then(() => {})
  }

  canActOnPins() {
    return isAdminUser() || (getCurrentUserUsername() === this.getUsername())
  }

  render() {
    const { user, pins, notFound } = this.state;
    const canActOnPins = this.canActOnPins()
    return (
      <React.Fragment>
        {
          notFound ?
          <NotFound /> :
          <div className="col-md-12">
            {
              user &&
              <div className="col-md-2 no-right-padding" style={{width: '20%'}}>
                <UserHomeDetails user={user} />
              </div>
            }
            <div className='col-md-10 no-side-padding' style={{width: '80%'}}>
              <Pins
                pins={pins}
                onDelete={this.deletePin}
                canDelete={canActOnPins}
                onOrderUpdate={this.updatePinOrder}
              />
              <UserHomeTabs
                {...this.state}
                {...this.props}
                onTabChange={this.onTabChange}
                onPinCreate={this.createPin}
                onPinDelete={this.deletePin}
                showPin={canActOnPins}
              />
            </div>
          </div>
        }
      </React.Fragment>
    )
  }
}

export default UserHome;
