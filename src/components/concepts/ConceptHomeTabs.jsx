import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { isLoggedIn } from '../../common/utils';
import ConceptHomeDetails from './ConceptHomeDetails';
import ConceptHomeMappings from './ConceptHomeMappings';
import VersionList from '../common/VersionList';
import AddToCollection from '../common/AddToCollection';

const ConceptHomeTabs = props => {
  const { tab, concept, versions, currentURL, isVersionedObject } = props;
  const resourceRelativeURL = isVersionedObject ? concept.url : concept.version_url;
  const isAuthenticated = isLoggedIn();
  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header col-md-8 no-side-padding' value={tab} aria-label="concept-home-tabs"  classes={{indicator: 'hidden'}}>
        <Tab label="Details" component="a" href={`#${resourceRelativeURL}details/`} />
        <Tab label="Mappings" component="a" href={`#${resourceRelativeURL}mappings/`} />
        <Tab label="History" component="a" href={`#${resourceRelativeURL}history/`} />
      </Tabs>
      {
        isAuthenticated &&
        <div className='col-md-4 no-right-padding' style={{textAlign: 'right'}}>
          <AddToCollection
            variant='outlined' color='primary' size='small' references={[{...concept, url: resourceRelativeURL}]}
          />
        </div>
      }
      <div className='sub-tab-container' style={{display: 'flex', height: 'auto', width: '100%'}}>
        { tab === 0 && <ConceptHomeDetails concept={concept} currentURL={currentURL} /> }
        { tab === 1 && <ConceptHomeMappings concept={concept} /> }
        { tab === 2 && <VersionList versions={versions} resource='concept' /> }
      </div>
    </div>
  );
}

export default ConceptHomeTabs;
