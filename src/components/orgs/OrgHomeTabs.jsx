import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get } from 'lodash';
import AboutAccordian from '../common/AboutAccordian';
import OrgHomeDetails from './OrgHomeDetails';
import OrgHomeChildrenList from './OrgHomeChildrenList';

const OrgHomeTabs = props => {
  const { tab, onChange, org, location, url, members } = props;
  const about = get(org, 'extras.about')

  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header' value={tab} onChange={onChange} aria-label="concept-home-tabs" indicatorColor='none'>
        <Tab label="Details" />
        <Tab label="Sources" />
        <Tab label="Collections" />
        <Tab label="About" />
      </Tabs>
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px'}}>
        {
          tab === 0 &&
          <OrgHomeDetails org={org} members={members} />
        }
        {
          tab === 1 &&
          <OrgHomeChildrenList
            org={org}
            location={location}
            url={url}
            resource='sources'
          />
        }
        {
          tab === 2 &&
          <OrgHomeChildrenList
            org={org}
            location={location}
            url={url}
            resource='collections'
          />
        }
        {
          tab === 3 &&
          <AboutAccordian id={org.id} about={about} />
        }
      </div>
    </div>
  );
}

export default OrgHomeTabs;
