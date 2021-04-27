import React from 'react';
import { getAppliedServerConfig } from '../../common/utils';
import OrgHomeHeader from '../orgs/OrgHomeHeader';
import FhirTabs from './FhirTabs';
import HeaderAttribute from '../common/HeaderAttribute';

const HAPI_DEFAULT_CONFIG = {
  name: 'FHIR Default',
  web_default: true,
  is_default: false,
  config: {
    tabs: [
      { type: "CodeSystem", label: "Code Systems", "default": true, layout: 'table' },
      { type: "ValueSet", label: "Value Sets", layout: 'table' },
    ]
  }
}

const DEFAULT_CONFIG = {
  name: 'FHIR Default',
  web_default: true,
  is_default: false,
  config: {
    tabs: [
      { type: "CodeSystem", label: "Code Systems", "default": true, layout: 'table' },
    ]
  }
}

class Fhir extends React.Component {
  constructor(props) {
    super(props);
    this.serverConfig = getAppliedServerConfig()
    this.state = {
      tab: window.location.hash.match('/ValueSet') ? 1 : 0,
      config: this.serverConfig.hapi ? HAPI_DEFAULT_CONFIG : DEFAULT_CONFIG
    }
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
