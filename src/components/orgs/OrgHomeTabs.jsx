import React from 'react';
import { Tabs, Tab } from '@mui/material';
import { get, map, reject, pickBy, isString, isObject, includes } from 'lodash';
import { ORANGE } from '../../common/constants';
import { currentUserHasAccess } from '../../common/utils';
import About from '../common/About';
import CustomText from '../common/CustomText';
import OrgHomeChildrenList from './OrgHomeChildrenList';
import NewResourceButton from '../common/NewResourceButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import SourceForm from '../sources/SourceForm';
import CollectionForm from '../collections/CollectionForm';
import ConfigSelect from '../common/ConfigSelect';
import MembersForm from './MembersForm'

const OrgHomeTabs = props => {
  const {
    tab, org, match, location, url, pins, showPin, onTabChange, onPinCreate, onPinDelete,
    selectedConfig, customConfigs, onConfigChange, aboutTab, showConfigSelection,
  } = props;

  const tabConfigs = aboutTab ? selectedConfig.config.tabs : reject(selectedConfig.config.tabs, {type: 'about'});
  const selectedTabConfig = tabConfigs[tab];
  const about = get(org, 'text')
  const [sourceForm, setSourceForm] = React.useState(false);
  const [collectionForm, setCollectionForm] = React.useState(false);
  const [membersForm, setMembersForm] = React.useState(false);
  const [configFormWidth, setConfigFormWidth] = React.useState(false);
  const hasAccess = currentUserHasAccess()
  const onNewClick = resource => {
    if(resource === 'source')
      setSourceForm(true)
    if(resource === 'collection')
      setCollectionForm(true)
    if(resource === 'editMembership')
      setMembersForm(true)
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
  const isInvalidTabConfig = !includes(['sources', 'collections', 'about', 'users', 'text'], selectedTabConfig.type) && !selectedTabConfig.uri;
  return (
    <div className='col-md-12 sub-tab' style={{width: width}}>
      <Tabs className='sub-tab-header col-md-11 no-side-padding' value={tab} onChange={onTabChange} aria-label="concept-home-tabs" classes={{indicator: 'hidden'}}>
        {
          map(tabConfigs, config => <Tab key={config.label} label={config.label} style={{textTransform: 'capitalize'}} />)
        }
      </Tabs>
      {
        hasAccess &&
        <div className='col-md-1 no-right-padding flex-vertical-center' style={{justifyContent: 'flex-end'}}>
          {
            showConfigSelection &&
            <span style={{marginRight: '10px'}}>
              <ConfigSelect
                selected={selectedConfig}
                configs={customConfigs}
                onChange={onConfigChange}
                color={ORANGE}
                resourceURL={url}
                onWidthChange={setConfigFormWidth}
                resource='orgs'
              />
            </span>
          }
          <NewResourceButton resources={['source', 'collection', 'editMembership']} onClick={onNewClick} />
        </div>
      }
      <div className='sub-tab-container' style={{display: 'flex', height: 'auto', width: '100%'}}>
        {
          isInvalidTabConfig &&
          <div>Invalid Tab Configuration</div>
        }
        {
          !isInvalidTabConfig && selectedTabConfig.type === 'about' &&
          <About id={org.id} about={about} />
        }
        {
          !isInvalidTabConfig && selectedTabConfig.type === 'text' &&
          <div className='col-md-12'>
            {
              map(selectedTabConfig.fields, field => {
                const value = field.value || get(org, field.id);
                const label = field.label
                return <CustomText key={value || field.url} title={label} value={value} format={field.format} url={field.url} />
              })
            }
          </div>
        }
        {
          !isInvalidTabConfig && !includes(['about', 'text'], selectedTabConfig.type) &&
          <OrgHomeChildrenList
            org={org}
            location={location}
            match={match}
            url={selectedTabConfig.uri || url}
            pins={pins}
            showPin={showPin}
            onPinCreate={onPinCreate}
            onPinDelete={onPinDelete}
            resource={selectedTabConfig.type}
            viewFilters={pickBy(selectedTabConfig.filters, isString)}
            extraControlFilters={pickBy(selectedTabConfig.filters, isObject)}
            viewFields={selectedTabConfig.fields}
            fixedFilters={{limit: selectedTabConfig.page_size, isTable: (selectedTabConfig.layout || '').toLowerCase() !== 'list', sortParams: getSortParams() }}
            configQueryParams={selectedTabConfig.query_params}
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
