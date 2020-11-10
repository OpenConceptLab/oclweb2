import React from 'react';
import { CircularProgress } from '@material-ui/core';
import APIService from '../../services/APIService';
import ConceptHomeHeader from './ConceptHomeHeader';
import ConceptHomeTabs from './ConceptHomeTabs';

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
                .get(null, null, {includeInverseMappings: true})
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
            <ConceptHomeTabs tab={tab} onChange={this.onTabChange} concept={concept} />
          </div>
        }
      </div>
    )
  }
}

export default ConceptHome;
