import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get } from 'lodash';
import ConceptContainerVersionList from '../common/ConceptContainerVersionList';
import SourceHomeDetails from './SourceHomeDetails';
import SourceHomeChildrenList from './SourceHomeChildrenList';
import AboutAccordian from '../common/AboutAccordian';

const SourceHomeTabs = props => {
  const {
    tab, onChange, source, versions, location, versionedObjectURL, currentVersion,
  } = props;
  const about = get(source, 'extras.about')

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
          <SourceHomeDetails source={source} />
        }
        {
          tab === 1 &&
          <SourceHomeChildrenList
            source={source}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource='concepts'
          />
        }
        {
          tab === 2 &&
          <SourceHomeChildrenList
            source={source}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource='mappings'
          />
        }
        {
          tab === 3 &&
          <ConceptContainerVersionList versions={versions} resource='source' />
        }
        {
          tab === 4 &&
          <AboutAccordian id={source.id} about={about} />
        }
      </div>
    </div>
  );
}

export default SourceHomeTabs;
