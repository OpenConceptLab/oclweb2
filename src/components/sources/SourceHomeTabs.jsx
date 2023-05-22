import React from 'react';
import { Tabs, Tab } from '@mui/material';
import { get, reject, includes, map, pickBy, isString, isObject } from 'lodash';
import { GREEN, TABLE_LAYOUT_ID, LIST_LAYOUT_ID } from '../../common/constants';
import { currentUserHasAccess } from '../../common/utils';
import ConceptContainerVersionList from '../common/ConceptContainerVersionList';
import SourceHomeChildrenList from './SourceHomeChildrenList';
import About from '../common/About';
import CustomText from '../common/CustomText';
import NewResourceButton from '../common/NewResourceButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import ConfigSelect from '../common/ConfigSelect';
import DynamicConfigResourceIcon from '../common/DynamicConfigResourceIcon'
import ConceptForm from '../concepts/ConceptForm';
import MappingForm from '../mappings/MappingForm';
import SourceVersionForm from './SourceVersionForm';
import SourceSummary from './SourceSummary';

const SourceHomeTabs = props => {
  const {
    tab, source, versions, match, location, versionedObjectURL, currentVersion,
    aboutTab, onVersionUpdate, selectedConfig, customConfigs, onConfigChange, showConfigSelection,
    onTabChange, isOCLDefaultConfigSelected, isLoadingVersions, onSelect, hierarchy, onHierarchyToggle,
    onFilterDrawerToggle, sourceVersionSummary
  } = props;
  const tabConfigs = (aboutTab ? get(selectedConfig, 'config.tabs') : reject((get(selectedConfig, 'config.tabs') || {}), {type: 'about'})) || {};
  const selectedTabConfig = tabConfigs[tab];
  const isVersionedObject = !currentVersion || currentVersion === 'HEAD';
  const hasAccess = currentUserHasAccess()
  const about = get(source, 'text')
  const [selectedChild, setSelectedChild] = React.useState(null);
  const [selectedConcepts, setSelectedConcepts] = React.useState([]);
  const [conceptForm, setConceptForm] = React.useState(false);
  const [mappingForm, setMappingForm] = React.useState(false);
  const [versionForm, setVersionForm] = React.useState(false);
  const [configFormWidth, setConfigFormWidth] = React.useState(false);
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
    else if(tabConfig.type === 'summary')
      href = `#${currentResourceURL}summary`
    else if(tabConfig.href)
      href = `#${currentResourceURL}${tabConfig.href}`
    else {
      const urlAttr = tabConfig.type + '_url'
      href = `#${source[urlAttr]}`
    }
    return href + location.search
  }

  const getSortParams = () => {
    if(selectedTabConfig) {
      if(selectedTabConfig.sortAsc)
        return {sortAsc: selectedTabConfig.sortAsc}
      if(selectedTabConfig.sortDesc)
        return {sortDesc: selectedTabConfig.sortDesc}
      if(selectedTabConfig.sort)
        return {sort: selectedTabConfig.sort}
    }
  }

  const width = configFormWidth ? "calc(100% - " + (configFormWidth - 15) + "px)" : '100%';
  const isInvalidTabConfig = !includes(['concepts', 'mappings', 'about', 'versions', 'text', 'summary'], get(selectedTabConfig, 'type')) && !get(selectedTabConfig, 'uri');

  return (
    <div className='col-xs-12 sub-tab' style={{width: width}}>
      <Tabs className='sub-tab-header col-xs-11 no-side-padding' value={tab} onChange={onTabChange} aria-label="source-home-tabs" classes={{indicator: 'hidden'}}>
        {
          map(
            tabConfigs,
            config => {
              const label = (
                <span className='flex-vertical-center'>
                  <DynamicConfigResourceIcon icon={config.icon} resource={config.type} index={tabConfigs.indexOf(config)} style={{width: '0.7em'}} />
                  <span style={{marginLeft: '4px'}}>{config.label}</span>
                </span>
              );
              if(isOCLDefaultConfigSelected)
                return (<Tab key={config.label} label={label} component="a" href={getTABHref(config)} style={{textTransform: 'capitalize'}} />)

              return (<Tab key={config.label} label={label} style={{textTransform: 'capitalize'}} />)
            }
          )
        }
      </Tabs>
      {
        hasAccess && isVersionedObject &&
        <div className='col-xs-1 no-right-padding flex-vertical-center' style={{justifyContent: 'flex-end'}}>
          {
            showConfigSelection &&
            <span style={{marginRight: '10px'}}>
              <ConfigSelect
                selected={selectedConfig}
                configs={customConfigs}
                onChange={onConfigChange}
                color={GREEN}
                resourceURL={source.url}
                onWidthChange={setConfigFormWidth}
                resource='sources'
              />
            </span>
          }
          <NewResourceButton resources={['concept', 'mapping', 'version']} onClick={onNewClick} />
        </div>
      }
      <div className='sub-tab-container' style={{display: 'flex', height: 'auto', width: '100%', padding: '10px 0'}}>
        {
          isInvalidTabConfig &&
          <div>Invalid Tab Configuration</div>
        }
        {
          !isInvalidTabConfig && selectedTabConfig.type === 'about' &&
          <About id={source.id} about={about} />
        }
        {
          !isInvalidTabConfig && selectedTabConfig.type === 'versions' &&
          <ConceptContainerVersionList versions={versions} resource='source' canEdit={hasAccess} onUpdate={onVersionUpdate} isLoading={isLoadingVersions} />
        }
        {
          !isInvalidTabConfig && selectedTabConfig.type === 'summary' &&
            <SourceSummary summary={sourceVersionSummary} source={source} includeMappedSources />
        }
        {
          !isInvalidTabConfig && selectedTabConfig.type === 'text' &&
          <div className='col-xs-12'>
            {
              map(selectedTabConfig.fields, field => {
                const value = field.value || get(source, field.id);
                const label = field.label
                return <CustomText key={value || field.url} title={label} value={value} format={field.format} url={field.url} />
              })
            }
          </div>
        }
        {
          !isInvalidTabConfig && !includes(['about', 'text', 'versions', 'summary'], selectedTabConfig.type) &&
          <SourceHomeChildrenList
            source={source}
            match={match}
            location={location}
            versionedObjectURL={selectedTabConfig.uri || versionedObjectURL}
            defaultURI={selectedTabConfig.defaultURI || selectedTabConfig.uri}
            versions={versions}
            currentVersion={currentVersion}
            resource={selectedTabConfig.type}
            onCreateSimilarClick={onCreateSimilarClick}
            onCreateMappingClick={onCreateMappingFromSelectedConceptsClick}
            viewFilters={pickBy(selectedTabConfig.filters, isString)}
            extraControlFilters={pickBy(selectedTabConfig.filters, isObject)}
            viewFields={selectedTabConfig.fields}
            fixedFilters={{
              limit: selectedTabConfig.page_size,
              isList: selectedTabConfig.layout === LIST_LAYOUT_ID,
              isTable: !selectedTabConfig.layout || selectedTabConfig.layout === TABLE_LAYOUT_ID,
              sortParams: getSortParams()
            }}
            configQueryParams={selectedTabConfig.query_params}
            onSelect={onSelect}
            hierarchy={hierarchy}
            onHierarchyToggle={onHierarchyToggle}
            onFilterDrawerToggle={onFilterDrawerToggle}
          />
        }
      </div>
      <CommonFormDrawer
        style={{zIndex: '1202'}}
        isOpen={conceptForm}
        onClose={closeConceptForm}
        formComponent={
          <ConceptForm
            source={source}
            copyFrom={selectedChild}
            onCancel={closeConceptForm}
            reloadOnSuccess={tab==0}
            parentURL={versionedObjectURL}
            sourceVersionSummary={sourceVersionSummary}
          />
        }
      />
      <CommonFormDrawer
        style={{zIndex: '1202'}}
        isOpen={mappingForm}
        onClose={closeMappingForm}
        formComponent={
          <MappingForm
            source={source}
            copyFrom={selectedChild}
            onCancel={closeMappingForm}
            reloadOnSuccess={tab==1}
            parentURL={versionedObjectURL}
            selectedConcepts={selectedConcepts}
            sourceVersionSummary={sourceVersionSummary}
          />
        }
      />
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={versionForm}
        onClose={closeVersionForm}
        formComponent={
          <SourceVersionForm
            onCancel={closeVersionForm}
            reloadOnSuccess={tab==2}
            parentURL={versionedObjectURL}
            version={source}
          />
        }
      />
    </div>
  );
}

export default SourceHomeTabs;
