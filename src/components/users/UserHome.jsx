import React from 'react';
import { reject, get } from 'lodash';
import APIService from '../../services/APIService';
import Pins from '../common/Pins';
import UserHomeDetails from './UserHomeDetails';
import UserHomeTabs from './UserHomeTabs';

class UserHome extends React.Component {
  constructor(props) {
    super(props);
    this.url = this.getURLFromPath(props);
    this.state = {
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
      return 1;
    if(location.pathname.indexOf('/orgs') > -1)
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
        { isLoading: true },
        () => service
          .get(null, null, {verbose: true})
          .then(response => this.setState({ user: response.data })))
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

  render() {
    const { user, pins } = this.state;
    return (
      <div className="col-md-12">
        <div className="col-md-3 no-right-padding">
          <UserHomeDetails user={user} />
        </div>
        <div className='col-md-9 no-left-padding'>
          <Pins pins={pins} onDelete={this.deletePin} />
          <UserHomeTabs
            {...this.state}
            {...this.props}
            onTabChange={this.onTabChange}
            onPinCreate={this.createPin}
            onPinDelete={this.deletePin}
          />
        </div>
      </div>
    )
  }
}

export default UserHome;
