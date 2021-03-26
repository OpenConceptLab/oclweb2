import React from 'react';
import { getAppliedServerConfig } from '../../common/utils';
import OrgHomeHeader from '../orgs/OrgHomeHeader';
import FhirTabs from './FhirTabs';
import HeaderAttribute from '../common/HeaderAttribute';

const DEFAULT_CONFIG = {
  name: 'FHIR Default',
  web_default: true,
  is_default: false,
  config: {
    tabs: [
      {
        type: "CodeSystem", label: "Code Systems", page_size: 25,
        "default": true, layout: 'table'
      },
    ]
  }
}

class Fhir extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 0,
    }
    this.serverConfig = getAppliedServerConfig()
  }

  onTabChange = (event, value) => this.setState({tab: value})

  render() {
    const { tab } = this.state;
    const { info, url } = this.serverConfig;
    const { org } = info;
    return (
      <div className='col-md-12 home-container no-side-padding'>
        <OrgHomeHeader
          fhir
          org={org}
          url={info.baseURI}
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
            selectedConfig={DEFAULT_CONFIG}
          />
        }
      </div>

    )
  }
}

export default Fhir;
