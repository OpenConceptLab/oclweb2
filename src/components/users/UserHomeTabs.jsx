import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import UserHomeConceptContainerResources from './UserHomeConceptContainerResources';
import UserHomeOrgs from './UserHomeOrgs';

const UserHomeTabs = props => {
  const {
    tab, onChange, orgs, sources, collections, isLoadingSources, isLoadingCollections,
    isLoadingOrgs,
  } = props;

  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header' value={tab} onChange={onChange} aria-label="concept-home-tabs" indicatorColor='none'>
        <Tab label="User Repositories" />
        <Tab label="Organization Membership" />
      </Tabs>
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px'}}>
        {
          tab === 0 &&
          <UserHomeConceptContainerResources
            sources={sources}
            isLoadingSources={isLoadingSources}
            collections={collections}
            isLoadingCollections={isLoadingCollections}
          />
        }
        {
          tab === 1 &&
          <UserHomeOrgs orgs={orgs} isLoadingOrgs={isLoadingOrgs} />
        }
      </div>
    </div>
  )
}

export default UserHomeTabs;
