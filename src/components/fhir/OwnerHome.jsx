import React from 'react';
import {
  Person as UserIcon,
  AccountBalance as OrgIcon,
  ChevronRight as SeparatorIcon,
} from '@mui/icons-material';
import { getAppliedServerConfig } from '../../common/utils';
import FhirTabs from './FhirTabs';
import OwnerButton from '../common/OwnerButton';
import { FHIR_DEFAULT_CONFIG } from "../../common/defaultConfigs"

class OwnerHome extends React.Component {
  constructor(props) {
    super(props);
    this.serverConfig = getAppliedServerConfig()
    let owner;
    let ownerType;
    if(props.match.params.org) {
      ownerType = 'org'
      owner = props.match.params.org
    } else {
      ownerType = 'user'
      owner = props.match.params.user
    }
    this.state = {
      owner: {ownerType: ownerType, owner: owner, id: owner,},
      tab: this.getDefaultTab(),
      config: FHIR_DEFAULT_CONFIG
    }
  }

  getIcon() {
    if(this.state.owner.ownerType === 'org')
      return <OrgIcon className='default-svg' />
    return <UserIcon className='default-svg' />
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
    const { tab, config, owner } = this.state;
    const { info, hapi } = this.serverConfig;
    const { org, pageSize } = info;
    return (
      <div className='col-md-12 home-container no-side-padding'>
        <header className='home-header col-md-12'>
          <div className='col-md-12 no-side-padding container' style={{padding: '10px'}}>
            <div className='col-md-12'>
              <div className='col-md-12 no-side-padding flex-vertical-center'>
                <OwnerButton owner={org.id} uri='#/' />
                <span className='separator'><SeparatorIcon /></span>
                <OwnerButton {...owner} uri={window.location.hash} />
              </div>
            </div>
          </div>
        </header>
        {
          tab !== null &&
          <FhirTabs
            nested
            tab={tab}
            onTabChange={this.onTabChange}
            org={owner}
            location={this.props.location}
            match={this.props.match}
            url={`/${owner.ownerType}s/${owner.id}/`}
            selectedConfig={config}
            limit={pageSize}
            hapi={hapi}
          />
        }
      </div>

    )
  }
}

export default OwnerHome;
