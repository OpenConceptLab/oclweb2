import React from 'react';
import APIService from '../../services/APIService';
import UserHomeDetails from './UserHomeDetails';
import UserHomeTabs from './UserHomeTabs';

class UserHome extends React.Component {
  constructor(props) {
    super(props);
    this.url = this.getURLFromPath(props);
    this.state = {
      user: {},
      tab: this.getDefaultTabIndex()
    }
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
      () => APIService.new().overrideURL(this.url).get().then(
        response => this.setState({ user: response.data })
      ))
  }

  onTabChange = (event, value) => {
    this.setState({tab: value})
  }

  render() {
    const { user } = this.state;
    return (
      <div className="col-md-12">
        <div className="col-md-3 no-right-padding">
          <UserHomeDetails user={user} />
        </div>
        <div className='col-md-9 no-left-padding'>
          <UserHomeTabs {...this.state} {...this.props} onChange={this.onTabChange} />
        </div>
      </div>
    )
  }
}

export default UserHome;
