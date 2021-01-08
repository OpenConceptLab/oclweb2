import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get } from 'lodash';
import ConceptContainerVersionList from '../common/ConceptContainerVersionList';
import SourceHomeChildrenList from './SourceHomeChildrenList';
import AboutAccordian from '../common/AboutAccordian';
import NewResourceButton from '../common/NewResourceButton';
import ConceptFormDrawer from '../concepts/ConceptFormDrawer';

const SourceHomeTabs = props => {
  const {
    tab, onChange, source, versions, location, versionedObjectURL, currentVersion,
    aboutTab
  } = props;
  const about = get(source, 'extras.about')
  const [conceptForm, setConceptForm] = React.useState(false);

  const onNewClick = resource => {
    if(resource === 'concept')
      setConceptForm(true)
  }

  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header col-md-8 no-side-padding' value={tab} onChange={onChange} aria-label="source-home-tabs" classes={{indicator: 'hidden'}}>
        <Tab label="Concepts" />
        <Tab label="Mappings" />
        <Tab label="Versions" />
        {aboutTab && <Tab label="About" />}
      </Tabs>
      <div className='col-md-4 no-right-padding' style={{textAlign: 'right'}}>
        <NewResourceButton onClick={onNewClick} />
      </div>
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px', width: '100%'}}>
        {
          tab === 0 &&
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
          tab === 1 &&
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
          tab === 2 &&
          <ConceptContainerVersionList versions={versions} resource='source' />
        }
        {
          aboutTab && tab === 3 &&
          <AboutAccordian id={source.id} about={about} />
        }
      </div>
      <ConceptFormDrawer reloadOnSuccess={tab == 0} parentURL={versionedObjectURL} isOpen={conceptForm} onClose={() => setConceptForm(false) } />
    </div>
  );
}

export default SourceHomeTabs;
