import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import MappingHomeDetails from './MappingHomeDetails';
import VersionList from '../common/VersionList';

const MappingHomeTabs = props => {
  const { tab, onChange, mapping, versions } = props;
  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header' value={tab} onChange={onChange} aria-label="concept-home-tabs" indicatorColor='none'>
        <Tab label="Details" />
        <Tab label="History" />
      </Tabs>
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px'}}>
        { tab === 0 && <MappingHomeDetails mapping={mapping} /> }
        { tab === 1 && <VersionList versions={versions} resource='mapping' /> }
      </div>
    </div>
  );
}

export default MappingHomeTabs;
