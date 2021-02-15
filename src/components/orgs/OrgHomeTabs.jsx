import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get, map, reject } from 'lodash';
import { ORANGE } from '../../common/constants';
import { currentUserHasAccess } from '../../common/utils';
import About from '../common/About';
import OrgHomeChildrenList from './OrgHomeChildrenList';
import NewResourceButton from '../common/NewResourceButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import SourceForm from '../sources/SourceForm';
import CollectionForm from '../collections/CollectionForm';
import ConfigSelect from '../common/ConfigSelect';
import MembersForm from './MembersForm'

const OrgHomeTabs = props => {
  const {
    tab, org, location, url, pins, showPin, onTabChange, onPinCreate, onPinDelete,
    selectedConfig, customConfigs, onConfigChange, aboutTab, showConfigSelection,
  } = props;

  const tabConfigs = aboutTab ? selectedConfig.config.tabs : reject(selectedConfig.config.tabs, {type: 'about'});
  const selectedTabConfig = tabConfigs[tab];
  const about = get(org, 'text')
  const [sourceForm, setSourceForm] = React.useState(false);
  const [collectionForm, setCollectionForm] = React.useState(false);
  const [membersForm, setMembersForm] = React.useState(false);
  const hasAccess = currentUserHasAccess()
  const onNewClick = resource => {
    if(resource === 'source')
      setSourceForm(true)
    if(resource === 'collection')
      setCollectionForm(true)
    if(resource === 'editMembership')
      setMembersForm(true)
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
            showConfigSelection &&
            <span style={{marginRight: '10px'}}>
              <ConfigSelect
                selected={selectedConfig}
                configs={customConfigs}
                onChange={onConfigChange}
                color={ORANGE}
                resourceURL={url}
              />
            </span>
          }
          <NewResourceButton resources={['source', 'collection', 'editMembership']} onClick={onNewClick} />
        </div>
      }
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px', width: '100%'}}>
        {
          selectedTabConfig.type === 'about' ?
          <About id={org.id} about={about} /> :
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
            fixedFilters={{limit: selectedTabConfig.page_size, isTable: selectedTabConfig.layout !== 'list' }}
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
      <CommonFormDrawer
        isOpen={membersForm}
        onClose={() => setMembersForm(false)}
        formComponent={
          <MembersForm onCancel={() => setMembersForm(false)} reloadOnSuccess={tab==2} parentURL={url} />
        }
      />
    </div>
  );
}

export default OrgHomeTabs;
