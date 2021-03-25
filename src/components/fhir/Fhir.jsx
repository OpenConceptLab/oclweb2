import React from 'react';
import { getAppliedServerConfig } from '../../common/utils';
import OrgHomeHeader from '../orgs/OrgHomeHeader';
import HeaderAttribute from '../common/HeaderAttribute';

class Fhir extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.serverConfig = getAppliedServerConfig()
  }

  render() {
    return (
      <div className='col-md-12 home-container no-side-padding'>
        <OrgHomeHeader
          fhir
          org={this.serverConfig.info.org}
          url='/fhir'
          extraComponents={
            <HeaderAttribute label="Base URL" value={this.serverConfig.url} gridClass="col-md-12" />
          }
        />
      </div>

    )
  }
}

export default Fhir;
