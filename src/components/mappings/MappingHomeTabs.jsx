import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import MappingHomeDetails from './MappingHomeDetails';
import VersionList from '../common/VersionList';

const MappingHomeTabs = props => {
  const { tab, mapping, versions, isVersionedObject } = props;
  const resourceRelativeURL = isVersionedObject ? mapping.url : mapping.version_url;
  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header' value={tab} aria-label="mapping-home-tabs"  classes={{indicator: 'hidden'}}>
        <Tab label="Details" component="a" href={`#${resourceRelativeURL}details/`} />
        <Tab label="History" component="a" href={`#${resourceRelativeURL}history/`} />
      </Tabs>
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px'}}>
        { tab === 0 && <MappingHomeDetails mapping={mapping} /> }
        { tab === 1 && <VersionList versions={versions} resource='mapping' /> }
      </div>
    </div>
  );
}

export default MappingHomeTabs;
