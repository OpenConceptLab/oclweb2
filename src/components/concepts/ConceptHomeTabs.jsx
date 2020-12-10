import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import ConceptHomeDetails from './ConceptHomeDetails';
import ConceptHomeMappings from './ConceptHomeMappings';
import VersionList from '../common/VersionList';

const ConceptHomeTabs = props => {
  const { tab, onChange, concept, versions, currentURL } = props;
  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header' value={tab} onChange={onChange} aria-label="concept-home-tabs"  classes={{indicator: 'hidden'}}>
        <Tab label="Details" />
        <Tab label="Mappings" />
        <Tab label="History" />
      </Tabs>
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px'}}>
        { tab === 0 && <ConceptHomeDetails concept={concept} currentURL={currentURL} /> }
        { tab === 1 && <ConceptHomeMappings concept={concept} /> }
        { tab === 2 && <VersionList versions={versions} resource='concept' /> }
      </div>
    </div>
  );
}

export default ConceptHomeTabs;
