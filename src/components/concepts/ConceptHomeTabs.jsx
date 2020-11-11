import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import ConceptHomeDetails from './ConceptHomeDetails';
import ConceptHomeMappings from './ConceptHomeMappings';

const ConceptHomeTabs = props => {
  const { tab, onChange, concept } = props;
  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header' value={tab} onChange={onChange} aria-label="concept-home-tabs" indicatorColor='none'>
        <Tab label="Details" />
        <Tab label="Mappings" />
        <Tab label="History" />
      </Tabs>
      <div className='sub-tab-container' style={{display: 'flex'}}>
        { tab === 0 && <ConceptHomeDetails concept={concept} /> }
        { tab === 1 && <ConceptHomeMappings concept={concept} /> }
        { tab === 2 && <span>History</span> }
      </div>
    </div>
  );
}

export default ConceptHomeTabs;
