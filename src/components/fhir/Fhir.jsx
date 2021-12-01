import React from 'react';
import { cloneDeep, reject } from 'lodash';
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
      config: this.getTabConfig()
    }
  }

  getTabConfig = () => {
    let config = cloneDeep(FHIR_DEFAULT_CONFIG)
    if(this.serverConfig) {
      const { info } = this.serverConfig
      const { noConceptMap, noCodeSystem, noValueSet } = info;
      if(noConceptMap)
        config.config.tabs = reject(config.config.tabs, {type: 'ConceptMap'})
      if(noCodeSystem)
        config.config.tabs = reject(config.config.tabs, {type: 'CodeSystem'})
      if(noValueSet)
        config.config.tabs = reject(config.config.tabs, {type: 'ValueSet'})
    }

    return config
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
    const { org, pageSize, paginationParams, searchMode } = info;
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
            paginationParams={paginationParams}
            searchMode={searchMode}
          />
        }
      </div>

    )
  }
}

export default Fhir;
