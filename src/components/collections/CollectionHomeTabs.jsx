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

const CollectionHomeTabs = props => {
  const {
    tab, collection, versions, expansions, match, location, versionedObjectURL, currentVersion,
    aboutTab, onVersionUpdate, selectedConfig, customConfigs, onConfigChange, showConfigSelection,
    onTabChange, isOCLDefaultConfigSelected, isLoadingVersions, expansion
  } = props;
  const tabConfigs = aboutTab ? selectedConfig.config.tabs : reject(selectedConfig.config.tabs, {type: 'about'});
  const selectedTabConfig = tabConfigs[tab];
  const isVersionedObject = !currentVersion || currentVersion === 'HEAD';
  const hasAccess = currentUserHasAccess()
  const about = get(collection, 'text')
  const [versionForm, setVersionForm] = React.useState(false);
  const [referenceForm, setReferenceForm] = React.useState(false);
  const [expansionForm, setExpansionForm] = React.useState(false);
  const [configFormWidth, setConfigFormWidth] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState();
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

  const currentResourceURL = isVersionedObject ? collection.url : (expansion.url || collection.version_url)
  const getTABHref = tabConfig => {
    let href = '';
    if(tabConfig.type === 'about')
      href = `#${currentResourceURL}about`
    else if(tabConfig.type === 'references')
      href = `#${currentResourceURL}references`
    else if(tabConfig.type === 'versions')
      href = `#${currentResourceURL}versions`
    else if(tabConfig.type === 'expansions')
      href = `#${currentResourceURL}expansions`
    else if(tabConfig.href)
      href = `#${currentResourceURL}${tabConfig.href}`
    else {
      const urlAttr = tabConfig.type + '_url'
      href = isEmpty(expansion) ? `#${collection[urlAttr]}` : `#${expansion.url}${tabConfig.type}/`
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
  const isInvalidTabConfig = !includes(['concepts', 'mappings', 'about', 'versions', 'text', 'references', 'expansions'], selectedTabConfig.type) && !selectedTabConfig.uri;
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
          <NewResourceButton resources={isVersionedObject ? ['references', 'version', 'expansion'] : ['expansion']} onClick={onNewClick} />
        </div>
      }
      <div className='sub-tab-container' style={{display: 'flex', height: 'auto', width: '100%'}}>
        {
          isInvalidTabConfig &&
          <div>Invalid Tab Configuration</div>
        }
        {
          !isInvalidTabConfig && selectedTabConfig.type === 'about' &&
          <About id={collection.id} about={about} />
        }
        {
          !isInvalidTabConfig && selectedTabConfig.type === 'versions' &&
          <VersionList versions={versions} resource='collection' canEdit={hasAccess} onUpdate={onVersionUpdate} isLoading={isLoadingVersions} onCreateExpansionClick={onCreateExpansionClick} />
        }
        {
          !isInvalidTabConfig && selectedTabConfig.type === 'text' &&
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
          !isInvalidTabConfig && !includes(['about', 'text', 'versions', 'expansions'], selectedTabConfig.type) &&
          <CollectionHomeChildrenList
            collection={collection}
            match={match}
            location={location}
            versionedObjectURL={selectedTabConfig.uri || versionedObjectURL}
            defaultURI={selectedTabConfig.defaultURI || selectedTabConfig.uri}
            versions={versions}
            expansions={expansions}
            expansion={expansion}
            currentVersion={currentVersion}
            resource={selectedTabConfig.type}
            references={selectedTabConfig.type === 'references'}
            viewFilters={pickBy(selectedTabConfig.filters, isString)}
            extraControlFilters={pickBy(selectedTabConfig.filters, isObject)}
            viewFields={selectedTabConfig.fields}
            fixedFilters={{limit: selectedTabConfig.page_size, isTable: (selectedTabConfig.layout || '').toLowerCase() !== 'list', sortParams: getSortParams() }}
          />
        }
    </div>
    <CommonFormDrawer
    isOpen={referenceForm}
        onClose={() => setReferenceForm(false)}
        size='large'
        formComponent={
          <ReferenceForm onCancel={() => setReferenceForm(false)} reloadOnSuccess={tab < 3} parentURL={versionedObjectURL} collection={collection} />
        }
      />
      <CommonFormDrawer
        isOpen={versionForm}
        onClose={() => setVersionForm(false)}
        formComponent={
          <CollectionVersionForm onCancel={() => setVersionForm(false)} reloadOnSuccess={tab==3} parentURL={versionedObjectURL} version={collection} resource="collection" />
        }
      />
      <CommonFormDrawer
        isOpen={expansionForm}
        onClose={() => setExpansionForm(false)}
        formComponent={
          <ExpansionForm onCancel={() => setExpansionForm(false)} reloadOnSuccess={tab==3} version={selectedVersion || collection} versions={versions} />
        }
      />
    </div>
  );
}

export default CollectionHomeTabs;
