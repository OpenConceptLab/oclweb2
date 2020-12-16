import React from 'react';
import APIService from '../../services/APIService';
import UserHomeDetails from './UserHomeDetails';
import UserHomeTabs from './UserHomeTabs';
import UserPins from './UserPins';

class UserHome extends React.Component {
  constructor(props) {
    super(props);
    this.url = this.getURLFromPath(props);
    this.state = {
      user: {},
      pins: [],
      lastDeletedPinId: null,
      tab: this.getDefaultTabIndex()
    }
  }

  onPinDelete = pinId => {
    if(pinId)
      this.setState({lastDeletedPinId: pinId})
  }

  onPinChange = pins => {
    this.setState({pins: pins})
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
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.pathname !== this.props.location.pathname) {
      this.url = this.getURLFromPath()
      this.refreshDataByURL()
      this.onTabChange(null, this.getDefaultTabIndex())
    }
  }

  refreshDataByURL() {
    this.setState(
      { isLoading: true },
      () => APIService.new().overrideURL(this.url).get(null, null, {verbose: true}).then(
        response => this.setState({ user: response.data })
      ))
  }

  onTabChange = (event, value) => {
    this.setState({tab: value})
  }

  render() {
    const { user, pins } = this.state;
    return (
      <div className="col-md-12">
        <div className="col-md-3 no-right-padding">
          <UserHomeDetails user={user} />
        </div>
        <div className='col-md-9 no-left-padding'>
          <UserPins pins={pins} onDelete={this.onPinDelete} />
          <UserHomeTabs
            {...this.state}
            {...this.props}
            onChange={this.onTabChange}
            onPinChange={this.onPinChange}
          />
        </div>
      </div>
    )
  }
}

export default UserHome;
