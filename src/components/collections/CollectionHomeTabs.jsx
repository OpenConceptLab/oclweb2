import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get } from 'lodash';
import ConceptContainerVersionList from '../common/ConceptContainerVersionList';
import CollectionHomeDetails from './CollectionHomeDetails';
import CollectionHomeChildrenList from './CollectionHomeChildrenList';
import AboutAccordian from '../common/AboutAccordian';

const CollectionHomeTabs = props => {
  const {
    tab, onChange, collection, versions, location, versionedObjectURL, currentVersion,
  } = props;
  const about = get(collection, 'extras.about')

  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header' value={tab} onChange={onChange} aria-label="concept-home-tabs" indicatorColor='none'>
        <Tab label="Details" />
        <Tab label="Concepts" />
        <Tab label="Mappings" />
        <Tab label="Versions" />
        <Tab label="About" />
      </Tabs>
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px'}}>
        {
          tab === 0 &&
          <CollectionHomeDetails collection={collection} />
        }
        {
          tab === 1 &&
          <CollectionHomeChildrenList
            collection={collection}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource='concepts'
          />
        }
        {
          tab === 2 &&
          <CollectionHomeChildrenList
            collection={collection}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource='mappings'
          />
        }
        {
          tab === 3 &&
          <ConceptContainerVersionList versions={versions} resource='collection' />
        }
        {
          tab === 4 &&
          <AboutAccordian id={collection.id} about={about} />
        }
      </div>
    </div>
  );
}

export default CollectionHomeTabs;
