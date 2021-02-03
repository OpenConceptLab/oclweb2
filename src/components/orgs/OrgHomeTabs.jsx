import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get, map, reject } from 'lodash';
import { ORANGE } from '../../common/constants';
import { currentUserHasAccess } from '../../common/utils';
import AboutAccordian from '../common/AboutAccordian';
import OrgHomeChildrenList from './OrgHomeChildrenList';
import NewResourceButton from '../common/NewResourceButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import SourceForm from '../sources/SourceForm';
import CollectionForm from '../collections/CollectionForm';
import ConfigSelect from '../common/ConfigSelect';

const OrgHomeTabs = props => {
  const {
    tab, org, location, url, pins, showPin, onTabChange, onPinCreate, onPinDelete,
    selectedConfig, customConfigs, onConfigChange, aboutTab,
  } = props;

  const tabConfigs = aboutTab ? selectedConfig.config.tabs : reject(selectedConfig.config.tabs, {type: 'about'});
  const selectedTabConfig = tabConfigs[tab];
  const about = get(org, 'text')
  const [sourceForm, setSourceForm] = React.useState(false);
  const [collectionForm, setCollectionForm] = React.useState(false);
  const hasAccess = currentUserHasAccess()
  const onNewClick = resource => {
    if(resource === 'source')
      setSourceForm(true)
    if(resource === 'collection')
      setCollectionForm(true)
  }

  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header col-md-8 no-side-padding' value={tab} onChange={onTabChange} aria-label="concept-home-tabs" classes={{indicator: 'hidden'}}>
        {
          map(tabConfigs, config => <Tab key={config.label} label={config.label} />)
        }
      </Tabs>
      {
        hasAccess &&
        <div className='col-md-4 no-right-padding' style={{textAlign: 'right'}}>
          {
            customConfigs.length > 1 &&
            <span style={{marginRight: '10px'}}>
              <ConfigSelect
                selected={selectedConfig}
                configs={customConfigs}
                onChange={onConfigChange}
                color={ORANGE}
              />
            </span>
          }
          <NewResourceButton resources={['source', 'collection']} onClick={onNewClick} />
        </div>
      }
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px', width: '100%'}}>
        {
          selectedTabConfig.type === 'about' ?
          <AboutAccordian id={org.id} about={about} /> :
          <OrgHomeChildrenList
            org={org}
            location={location}
            url={url}
            pins={pins}
            showPin={showPin}
            onPinCreate={onPinCreate}
            onPinDelete={onPinDelete}
            resource={selectedTabConfig.type}
            viewFilters={selectedTabConfig.filters}
            viewFields={selectedTabConfig.fields}
            fixedFilters={{limit: selectedTabConfig.page_size}}
          />
        }
      </div>
      <CommonFormDrawer
        isOpen={sourceForm}
        onClose={() => setSourceForm(false)}
        formComponent={
          <SourceForm onCancel={() => setSourceForm(false)} reloadOnSuccess={tab==0} parentURL={url} />
        }
      />
      <CommonFormDrawer
        isOpen={collectionForm}
        onClose={() => setCollectionForm(false)}
        formComponent={
          <CollectionForm onCancel={() => setCollectionForm(false)} reloadOnSuccess={tab==1} parentURL={url} />
        }
      />
    </div>
  );
}

export default OrgHomeTabs;
