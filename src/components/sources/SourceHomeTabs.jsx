import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get, reject, includes, map } from 'lodash';
import { GREEN } from '../../common/constants';
import { currentUserHasAccess } from '../../common/utils';
import ConceptContainerVersionList from '../common/ConceptContainerVersionList';
import SourceHomeChildrenList from './SourceHomeChildrenList';
import About from '../common/About';
import NewResourceButton from '../common/NewResourceButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import ConfigSelect from '../common/ConfigSelect';
import ConceptForm from '../concepts/ConceptForm';
import MappingForm from '../mappings/MappingForm';
import SourceVersionForm from './SourceVersionForm';

const SourceHomeTabs = props => {
  const {
    tab, source, versions, location, versionedObjectURL, currentVersion,
    aboutTab, onVersionUpdate, selectedConfig, customConfigs, onConfigChange, showConfigSelection,
    onTabChange, isOCLDefaultConfigSelected
  } = props;
  const tabConfigs = aboutTab ? selectedConfig.config.tabs : reject(selectedConfig.config.tabs, {type: 'about'});
  const selectedTabConfig = tabConfigs[tab];
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
  const currentResourceURL = isVersionedObject ? source.url : source.version_url
  const getTABHref = tabConfig => {
    let href = '';
    if(tabConfig.type === 'about')
      href = `#${currentResourceURL}about`
    else if(tabConfig.type === 'versions')
      href = `#${currentResourceURL}versions`
    else if(tabConfig.href)
      href = `#${currentResourceURL}${tabConfig.href}`
    else {
      const urlAttr = tabConfig.type + '_url'
      href = `#${source[urlAttr]}`
    }
    return href + location.search
  }

  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header col-md-8 no-side-padding' value={tab} onChange={onTabChange} aria-label="source-home-tabs" classes={{indicator: 'hidden'}}>
        {
          map(
            tabConfigs,
            config => {
              if(isOCLDefaultConfigSelected)
                return (<Tab key={config.label} label={config.label} component="a" href={getTABHref(config)}/>)
              else
                return (<Tab key={config.label} label={config.label} />)
            }
          )
        }
      </Tabs>
      {
        hasAccess && isVersionedObject &&
        <div className='col-md-4 no-right-padding' style={{textAlign: 'right'}}>
          {
            showConfigSelection &&
            <span style={{marginRight: '10px'}}>
              <ConfigSelect
                selected={selectedConfig}
                configs={customConfigs}
                onChange={onConfigChange}
                color={GREEN}
                resourceURL={source.url}
              />
            </span>
          }
          <NewResourceButton resources={['concept', 'mapping', 'version']} onClick={onNewClick} />
        </div>
      }
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px', width: '100%'}}>
        {
          selectedTabConfig.type === 'about' &&
          <About id={source.id} about={about} />
        }
        {
          selectedTabConfig.type === 'versions' &&
          <ConceptContainerVersionList versions={versions} resource='source' canEdit={hasAccess} onUpdate={onVersionUpdate} />
        }
        {
          includes(['concepts', 'mappings'], selectedTabConfig.type) &&
          <SourceHomeChildrenList
            source={source}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource={selectedTabConfig.type}
            onCreateSimilarClick={onCreateSimilarClick}
            onCreateMappingClick={onCreateMappingFromSelectedConceptsClick}
            viewFilters={selectedTabConfig.filters}
            viewFields={selectedTabConfig.fields}
            fixedFilters={{limit: selectedTabConfig.page_size, isTable: selectedTabConfig.layout !== 'list' }}
            configQueryParams={selectedTabConfig.query_params}
          />
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
