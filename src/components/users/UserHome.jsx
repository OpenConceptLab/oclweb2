import React from 'react';
import { isEmpty } from 'lodash';
import APIService from '../../services/APIService';
import UserHomeDetails from './UserHomeDetails';
import UserHomeTabs from './UserHomeTabs';

class UserHome extends React.Component {
  constructor(props) {
    super(props);
    this.url = this.getURLFromPath(props);
    this.state = {
      isLoading: true,
      user: {},
      sources: [],
      collections: [],
      orgs: [],
      isLoadingSources: false,
      isLoadingCollections: true,
      isLoadingOrgs: false,
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
        response => this.setState({ isLoading: false, user: response.data }, this.fetchTabContent)
      ))
  }

  fetchTabContent() {
    if(this.state.tab === 0) {
      this.getSources()
      this.getCollections()
    } else
    this.getOrgs()
  }

  getOrgs() {
    if(!isEmpty(this.state.orgs))
      return

    this.setState({isLoadingOrgs: true}, () =>
      APIService.new()
                .overrideURL(this.url + 'orgs/')
                .get()
                .then(response => this.setState({orgs: response.data, isLoadingOrgs: false}))
    )
  }

  getSources() {
    if(!isEmpty(this.state.sources))
      return

    this.setState({isLoadingSources: true}, () =>
      APIService.new()
                .overrideURL(this.url + 'sources/')
                .get()
                .then(response => this.setState({sources: response.data, isLoadingSources: false}))
    )
  }

  getCollections() {
    if(!isEmpty(this.state.collections))
      return

    this.setState({isLoadingCollections: true}, () =>
      APIService.new()
                .overrideURL(this.url + 'collections/')
                .get()
                .then(response => this.setState({collections: response.data, isLoadingCollections: false}))
    )
  }

  onTabChange = (event, value) => {
    this.setState({tab: value}, this.fetchTabContent)
  }

  render() {
    const {user, isLoading} = this.state;
    return (
      <div className="col-md-12">
        <div className="col-md-3 no-right-padding">
          <UserHomeDetails user={user} isLoading={isLoading} />
        </div>
        <div className='col-md-9 no-left-padding' style={{marginTop: '15px'}}>
          <UserHomeTabs {...this.state} onChange={this.onTabChange} />
        </div>
      </div>
    )
  }
}

export default UserHome;
