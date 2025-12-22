import React from 'react';
import { get, reject, includes, map, pickBy, isString, isObject, isEmpty } from 'lodash';
import { Tabs, Tab } from '@mui/material';
import { GREEN } from '../../common/constants';
import { currentUserHasAccess } from '../../common/utils';
import CollectionHomeChildrenList from './CollectionHomeChildrenList';
import About from '../common/About';
import CustomText from '../common/CustomText';
import NewResourceButton from '../common/NewResourceButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import ConfigSelect from '../common/ConfigSelect';
import DynamicConfigResourceIcon from '../common/DynamicConfigResourceIcon'
import CollectionVersionForm from './CollectionVersionForm';
import ReferenceForm from './ReferenceForm';
import ExpansionForm from './ExpansionForm';
import VersionList from './VersionList';
import SourceSummary from '../sources/SourceSummary';

const CollectionHomeTabs = props => {
  const {
    tab, collection, versions, expansions, match, location, versionedObjectURL, currentVersion,
    aboutTab, onVersionUpdate, selectedConfig, customConfigs, onConfigChange, showConfigSelection,
    onTabChange, isOCLDefaultConfigSelected, expansion, isLoadingExpansions, onSelect,
    onFilterDrawerToggle, collectionVersionSummary, collectionURLs
  } = props;
  const tabConfigs = (aboutTab ? get(selectedConfig, 'config.tabs') : reject((get(selectedConfig, 'config.tabs') || {}), {type: 'about'})) || {};
  const selectedTabConfig = tabConfigs[tab];
  const isVersionedObject = !currentVersion || currentVersion === 'HEAD';
  const hasAccess = currentUserHasAccess()
  const about = get(collection, 'text')
  const [versionForm, setVersionForm] = React.useState(false);
  const [referenceForm, setReferenceForm] = React.useState(false);
  const [expansionForm, setExpansionForm] = React.useState(false);
  const [configFormWidth, setConfigFormWidth] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState();
  const [selectedExpansion, setSelectedExpansion] = React.useState(null)

  const onNewClick = resource => {
    if(resource === 'version')
      setVersionForm(true)
    if(resource === 'references')
      setReferenceForm(true)
    if(resource === 'expansion')
      setExpansionForm(true)
  }

  const onCreateExpansionClick = version => {
    setSelectedVersion(version)
    setExpansionForm(true)
  }

  const onCreateSimilarExpansionClick = (version, expansion) => {
    setSelectedVersion(version)
    setSelectedExpansion(expansion)
    setExpansionForm(true)
  }

  const currentResourceURL = isVersionedObject ? collection?.url : (expansion?.url || collection?.version_url)
  const getTABHref = tabConfig => {
    let href = '';
    if(tabConfig?.type === 'about')
      href = `#${currentResourceURL}about`
    else if(tabConfig?.type === 'references')
      href = `#${currentResourceURL}references`
    else if(tabConfig?.type === 'versions')
      href = `#${currentResourceURL}versions`
    else if(tabConfig?.type === 'summary')
      href = `#${currentResourceURL}summary`
    else if(tabConfig?.type === 'expansions')
      href = `#${currentResourceURL}expansions`
    else if(tabConfig?.href)
      href = `#${currentResourceURL}${tabConfig.href}`
    else if(collection?.id || expansion?.url) {
      const urlAttr = tabConfig?.type + '_url'
      href = isEmpty(expansion) ? `#${collection[urlAttr]}` : `#${expansion.url}${tabConfig?.type}/`
    }
    return href + location.search
  }

  const getSortParams = () => {
    if(selectedTabConfig) {
      if(selectedTabConfig.sortAsc)
        return {sortAsc: selectedTabConfig.sortAsc}
      if(selectedTabConfig.sortDesc)
        return {sortDesc: selectedTabConfig.sortDesc}
    }
  }

  const width = configFormWidth ? "calc(100% - " + (configFormWidth - 15) + "px)" : '100%';
  const isInvalidTabConfig = selectedTabConfig && !includes(['concepts', 'mappings', 'about', 'versions', 'text', 'references', 'expansions', 'summary'], selectedTabConfig.type) && !selectedTabConfig.uri;
  return (
    <div className='col-md-12 sub-tab' style={{width: width}}>
      <Tabs className='sub-tab-header col-md-11 no-side-padding' value={tab} onChange={onTabChange} aria-label="collection-home-tabs"  classes={{indicator: 'hidden'}}>
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
              else
                return (<Tab key={config.label} label={label} style={{textTransform: 'capitalize'}} />)
            }
          )
        }
      </Tabs>
      {
        hasAccess &&
        <div className='col-md-1 no-right-padding flex-vertical-center' style={{justifyContent: 'flex-end'}}>
          {
            isVersionedObject && showConfigSelection &&
            <span style={{marginRight: '10px'}}>
              <ConfigSelect
                selected={selectedConfig}
                configs={customConfigs}
                onChange={onConfigChange}
                color={GREEN}
                resourceURL={collection.url}
                onWidthChange={setConfigFormWidth}
                resource='collections'
              />
            </span>
          }
          <NewResourceButton resources={isVersionedObject ? ['references', 'version', 'expansion'] : ['expansion', 'version']} onClick={onNewClick} />
        </div>
      }
      <div className='sub-tab-container' style={{display: 'flex', height: 'auto', width: '100%'}}>
        {
          isInvalidTabConfig &&
          <div>Invalid Tab Configuration</div>
        }
        {
          !isInvalidTabConfig && selectedTabConfig?.type === 'about' &&
          <About id={collection.id} about={about} />
        }
        {
          !isInvalidTabConfig && selectedTabConfig?.type === 'versions' &&
            <VersionList resource='collection' canEdit={hasAccess} onUpdate={onVersionUpdate} onCreateExpansionClick={onCreateExpansionClick} onCreateSimilarExpansionClick={onCreateSimilarExpansionClick} collection={collection} />
        }
        {
          !isInvalidTabConfig && selectedTabConfig?.type === 'summary' &&
            <SourceSummary summary={collectionVersionSummary} source={collection} includeReferences />
        }
        {
          !isInvalidTabConfig && selectedTabConfig?.type === 'text' &&
          <div className='col-md-12'>
            {
              map(selectedTabConfig.fields, field => {
                const value = field.value || get(collection, field.id);
                const label = field.label
                return <CustomText key={value || field.url} title={label} value={value} format={field.format} url={field.url} />
              })
            }
          </div>
        }
        {
          !isInvalidTabConfig && !includes(['about', 'text', 'versions', 'expansions', 'summary'], selectedTabConfig?.type) && !isLoadingExpansions &&
          <CollectionHomeChildrenList
            isLoadingExpansions={isLoadingExpansions}
            collection={collection}
            match={match}
            location={location}
            versionedObjectURL={selectedTabConfig.uri || versionedObjectURL}
            defaultURI={selectedTabConfig.defaultURI || selectedTabConfig.uri}
            expansions={expansions}
            expansion={expansion}
            currentVersion={currentVersion}
            resource={selectedTabConfig?.type}
            references={selectedTabConfig?.type === 'references'}
            viewFilters={pickBy(selectedTabConfig.filters, isString)}
            extraControlFilters={pickBy(selectedTabConfig.filters, isObject)}
            viewFields={selectedTabConfig.fields}
            fixedFilters={{limit: selectedTabConfig.page_size, isTable: (selectedTabConfig.layout || '').toLowerCase() !== 'list', sortParams: getSortParams() }}
            onSelect={onSelect}
            onFilterDrawerToggle={onFilterDrawerToggle}
            collectionURLs={collectionURLs}
          />
        }
      </div>
      <CommonFormDrawer
        style={{zIndex: 1202}}
        size='large'
        isOpen={referenceForm}
        onClose={() => setReferenceForm(false)}
        formComponent={
          <ReferenceForm onCancel={() => setReferenceForm(false)} reloadOnSuccess={tab < 3} parentURL={versionedObjectURL} collection={collection} />
        }
      />
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={versionForm}
        onClose={() => setVersionForm(false)}
        formComponent={
          <CollectionVersionForm onCancel={() => setVersionForm(false)} reloadOnSuccess={tab==3} parentURL={versionedObjectURL} version={collection} resource="collection" />
        }
      />
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={expansionForm}
        onClose={() => setExpansionForm(false)}
        formComponent={
          <ExpansionForm onCancel={() => setExpansionForm(false)} reloadOnSuccess={tab==3} version={selectedVersion || collection} versions={versions} copyFrom={selectedExpansion} />
        }
      />
    </div>
  );
}

export default CollectionHomeTabs;
