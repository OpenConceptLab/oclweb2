import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get, reject, includes, map } from 'lodash';
import { GREEN } from '../../common/constants';
import { currentUserHasAccess } from '../../common/utils';
import ConceptContainerVersionList from '../common/ConceptContainerVersionList';
import CollectionHomeChildrenList from './CollectionHomeChildrenList';
import About from '../common/About';
import NewResourceButton from '../common/NewResourceButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import ConfigSelect from '../common/ConfigSelect';
import CollectionVersionForm from './CollectionVersionForm';
import ReferenceForm from './ReferenceForm';

const CollectionHomeTabs = props => {
  const {
    tab, collection, versions, location, versionedObjectURL, currentVersion,
    aboutTab, onVersionUpdate, selectedConfig, customConfigs, onConfigChange, showConfigSelection,
    onTabChange, isOCLDefaultConfigSelected
  } = props;
  const tabConfigs = aboutTab ? selectedConfig.config.tabs : reject(selectedConfig.config.tabs, {type: 'about'});
  const selectedTabConfig = tabConfigs[tab];
  const isVersionedObject = !currentVersion || currentVersion === 'HEAD';
  const hasAccess = currentUserHasAccess()
  const about = get(collection, 'text')
  const [versionForm, setVersionForm] = React.useState(false);
  const [referenceForm, setReferenceForm] = React.useState(false);
  const onNewClick = resource => {
    if(resource === 'version')
      setVersionForm(true)
    if(resource === 'references')
      setReferenceForm(true)
  }
  const currentResourceURL = isVersionedObject ? collection.url : collection.version_url
  const getTABHref = tabConfig => {
    let href = '';
    if(tabConfig.type === 'about')
      href = `#${currentResourceURL}about`
    if(tabConfig.type === 'references')
      href = `#${currentResourceURL}references`
    else if(tabConfig.href)
      href = `#${currentResourceURL}${tabConfig.href}`
    else {
      const urlAttr = tabConfig.type + '_url'
      href = `#${collection[urlAttr]}`
    }
    return href + location.search
  }

  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header col-md-8 no-side-padding' value={tab} onChange={onTabChange} aria-label="collection-home-tabs"  classes={{indicator: 'hidden'}}>
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
                resourceURL={collection.url}
              />
            </span>
          }
          <NewResourceButton resources={['references', 'version']} onClick={onNewClick} />
        </div>
      }
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px', width: '100%'}}>
        {
          selectedTabConfig.type === 'about' &&
          <About id={collection.id} about={about} />
        }
        {
          selectedTabConfig.type === 'versions' &&
          <ConceptContainerVersionList versions={versions} resource='collection' canEdit={hasAccess} onUpdate={onVersionUpdate} />
        }
        {
          includes(['concepts', 'mappings', 'references'], selectedTabConfig.type) &&
          <CollectionHomeChildrenList
            collection={collection}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource={selectedTabConfig.type}
            references={selectedTabConfig.type === 'references'}
            viewFilters={selectedTabConfig.filters}
            viewFields={selectedTabConfig.fields}
            fixedFilters={{limit: selectedTabConfig.page_size, isTable: selectedTabConfig.layout !== 'list' }}
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
          <CollectionVersionForm onCancel={() => setVersionForm(false)} reloadOnSuccess={tab==3} parentURL={versionedObjectURL} version={collection} />
        }
      />
    </div>
  );
}

export default CollectionHomeTabs;
