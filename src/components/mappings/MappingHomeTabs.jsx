import React from 'react';
import { Tabs, Tab } from '@mui/material';
import MappingHomeDetails from './MappingHomeDetails';
import VersionList from '../common/VersionList';

const MappingHomeTabs = props => {
  const { tab, mapping, versions, isVersionedObject, noRedirect, onTabChange } = props;
  const resourceRelativeURL = isVersionedObject ? mapping.url : mapping.version_url;
  const detailsRedirectionProps = noRedirect ? {} : {component: "a", href: `#${resourceRelativeURL}details/`}
  const historyRedirectionProps = noRedirect ? {} : {component: "a", href: `#${resourceRelativeURL}history/`}
  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header col-md-8 no-side-padding' value={tab} aria-label="mapping-home-tabs"  classes={{indicator: 'hidden'}} onChange={onTabChange}>
        <Tab label="Details" {...detailsRedirectionProps} />
        <Tab label="History" {...historyRedirectionProps} />
      </Tabs>
      <div className='sub-tab-container' style={{display: 'flex', height: 'auto', width: '100%', minHeight: '100vh'}}>
        { tab === 0 && <MappingHomeDetails mapping={mapping} /> }
        { tab === 1 && <VersionList versions={versions} resource='mapping' /> }
      </div>
    </div>
  );
}

export default MappingHomeTabs;
