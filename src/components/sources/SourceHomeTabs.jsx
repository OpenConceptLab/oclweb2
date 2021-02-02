import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get } from 'lodash';
import { currentUserHasAccess } from '../../common/utils';
import ConceptContainerVersionList from '../common/ConceptContainerVersionList';
import SourceHomeChildrenList from './SourceHomeChildrenList';
import AboutAccordian from '../common/AboutAccordian';
import NewResourceButton from '../common/NewResourceButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import ConceptForm from '../concepts/ConceptForm';
import MappingForm from '../mappings/MappingForm';
import SourceVersionForm from './SourceVersionForm';

const SourceHomeTabs = props => {
  const {
    tab, onChange, source, versions, location, versionedObjectURL, currentVersion,
    aboutTab, onVersionUpdate
  } = props;
  const isVersionedObject = !currentVersion || currentVersion === 'HEAD';
  const hasAccess = currentUserHasAccess()
  const about = get(source, 'text')
  const [selectedChild, setSelectedChild] = React.useState(null);
  const [selectedConcepts, setSelectedConcepts] = React.useState([]);
  const [conceptForm, setConceptForm] = React.useState(false);
  const [mappingForm, setMappingForm] = React.useState(false);
  const [versionForm, setVersionForm] = React.useState(false);
  const onNewClick = resource => {
    if(resource === 'concept')
      setConceptForm(true)
    if(resource === 'mapping')
      setMappingForm(true)
    if(resource === 'version')
      setVersionForm(true)
  }

  const onCreateSimilarClick = instance => {
    setSelectedChild(instance)
    if(instance) {
      if(instance.map_type)
        setMappingForm(true)
      else if(instance.concept_class)
        setConceptForm(true)
    }
  }

  const onCreateMappingFromSelectedConceptsClick = concepts => {
    setSelectedConcepts(concepts)
    setMappingForm(true)
  }

  const closeDrawer = callback => {
    setSelectedChild(null)
    callback();
  }
  const closeMappingForm = () => closeDrawer(() => setMappingForm(false))
  const closeConceptForm = () => closeDrawer(() => setConceptForm(false))
  const closeVersionForm = () => closeDrawer(() => setVersionForm(false))

  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header col-md-8 no-side-padding' value={tab} onChange={onChange} aria-label="source-home-tabs" classes={{indicator: 'hidden'}}>
        <Tab label="Concepts" />
        <Tab label="Mappings" />
        <Tab label="Versions" />
        {aboutTab && <Tab label="About" />}
      </Tabs>
      {
        hasAccess && isVersionedObject &&
        <div className='col-md-4 no-right-padding' style={{textAlign: 'right'}}>
          <NewResourceButton resources={['concept', 'mapping', 'version']} onClick={onNewClick} />
        </div>
      }
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
            onCreateSimilarClick={onCreateSimilarClick}
            onCreateMappingClick={onCreateMappingFromSelectedConceptsClick}
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
            onCreateSimilarClick={onCreateSimilarClick}
          />
        }
        {
          tab === 2 &&
          <ConceptContainerVersionList versions={versions} resource='source' canEdit={hasAccess} onUpdate={onVersionUpdate} />
        }
        {
          aboutTab && tab === 3 &&
          <AboutAccordian id={source.id} about={about} />
        }
      </div>
      <CommonFormDrawer
        isOpen={conceptForm}
        onClose={closeConceptForm}
        formComponent={
          <ConceptForm copyFrom={selectedChild} onCancel={closeConceptForm} reloadOnSuccess={tab==0} parentURL={versionedObjectURL} />
        }
      />
      <CommonFormDrawer
        isOpen={mappingForm}
        onClose={closeMappingForm}
        formComponent={
          <MappingForm copyFrom={selectedChild} onCancel={closeMappingForm} reloadOnSuccess={tab==1} parentURL={versionedObjectURL} selectedConcepts={selectedConcepts} />
        }
      />
      <CommonFormDrawer
        isOpen={versionForm}
        onClose={closeVersionForm}
        formComponent={
          <SourceVersionForm onCancel={closeVersionForm} reloadOnSuccess={tab==2} parentURL={versionedObjectURL} version={source} />
        }
      />
    </div>
  );
}

export default SourceHomeTabs;
