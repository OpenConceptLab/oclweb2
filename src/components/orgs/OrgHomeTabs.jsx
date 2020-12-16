import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get } from 'lodash';
import AboutAccordian from '../common/AboutAccordian';
import OrgHomeChildrenList from './OrgHomeChildrenList';

const OrgHomeTabs = props => {
  const { tab, org, location, url, pins, onTabChange, onPinCreate, onPinDelete} = props;
  const about = get(org, 'extras.about')

  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header' value={tab} onChange={onTabChange} aria-label="concept-home-tabs" classes={{indicator: 'hidden'}}>
        <Tab label="Sources" />
        <Tab label="Collections" />
        <Tab label="Members" />
        <Tab label="About" />
      </Tabs>
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px'}}>
        {
          tab === 0 &&
          <OrgHomeChildrenList
            org={org}
            location={location}
            url={url}
            pins={pins}
            onPinCreate={onPinCreate}
            onPinDelete={onPinDelete}
            resource='sources'
          />
        }
        {
          tab === 1 &&
          <OrgHomeChildrenList
            org={org}
            location={location}
            url={url}
            pins={pins}
            onPinCreate={onPinCreate}
            onPinDelete={onPinDelete}
            resource='collections'
          />
        }
        {
          tab === 2 &&
          <OrgHomeChildrenList
            org={org}
            location={location}
            url={url}
            resource='users'
            urlPath='members'
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
