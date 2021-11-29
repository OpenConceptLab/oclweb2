import React from 'react';
import { getAppliedServerConfig } from '../../common/utils';
import OrgHomeHeader from '../orgs/OrgHomeHeader';
import FhirTabs from './FhirTabs';
import HeaderAttribute from '../common/HeaderAttribute';
import { FHIR_DEFAULT_CONFIG } from "../../common/defaultConfigs"

class Fhir extends React.Component {
  constructor(props) {
    super(props);
    this.serverConfig = getAppliedServerConfig()
    this.state = {
      tab: this.getDefaultTab(),
      config: FHIR_DEFAULT_CONFIG
    }
  }

  getDefaultTab = () => {
    if(window.location.hash.match('/ValueSet'))
      return 1
    if(window.location.hash.match('/ConceptMap'))
      return 2
    return 0
  }

  onTabChange = (event, value) => this.setState({tab: value})

  render() {
    const { tab, config } = this.state;
    const { info, url, hapi } = this.serverConfig;
    const { org, pageSize } = info;
    return (
      <div className='col-md-12 home-container no-side-padding'>
        <OrgHomeHeader
          fhir
          org={org}
          url='/fhir'
          extraComponents={
            <React.Fragment>
              <HeaderAttribute label="Base URL" type='url' value={url} gridClass="col-md-12" />
              <HeaderAttribute label="Server" value={info.type} gridClass="col-md-12" />
            </React.Fragment>
          }
        />
        {
          tab !== null &&
          <FhirTabs
            tab={tab}
            onTabChange={this.onTabChange}
            org={org}
            location={this.props.location}
            match={this.props.match}
            url={info.baseURI}
            selectedConfig={config}
            limit={pageSize}
            hapi={hapi}
          />
        }
      </div>

    )
  }
}

export default Fhir;
