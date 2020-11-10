import React from 'react';
import { CircularProgress, Tabs, Tab } from '@material-ui/core';
import APIService from '../../services/APIService';
import ConceptHomeHeader from './ConceptHomeHeader';

class ConceptHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      concept: {},
      tab: 0,
    }
  }

  componentDidMount() {
    this.refreshDataByURL()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.location.pathname !== this.props.location.pathname)
      this.refreshDataByURL()
  }

  refreshDataByURL() {
    this.setState({isLoading: true}, () => {
      APIService.new()
                .overrideURL(this.props.location.pathname)
                .get()
                .then(response => {
                  this.setState({isLoading: false, concept: response.data})
                })

    })
  }

  onTabChange = (event, value) => {
    this.setState({tab: value})
  }

  render() {
    const { concept, isLoading, tab } = this.state;
    return (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        {
          isLoading ?
          <CircularProgress color='primary' /> :
          <div className='col-md-12 home-container no-side-padding'>
            <ConceptHomeHeader concept={concept} />
            <div className='col-md-12 sub-tab'>
              <Tabs indicatorColor='none' className='sub-tab-header' value={tab} onChange={this.onTabChange} aria-label="concept-home-tabs">
                <Tab label="Details" />
                <Tab label="Mappings" />
                <Tab label="History" />
              </Tabs>
              <div className='sub-tab-container'>
                {tab === 0 && <span>Details</span>}
                {tab === 1 && <span>Mappings</span>}
                {tab === 2 && <span>History</span>}
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default ConceptHome;
