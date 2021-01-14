import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get } from 'lodash';
import { currentUserHasAccess } from '../../common/utils';
import AboutAccordian from '../common/AboutAccordian';
import OrgHomeChildrenList from './OrgHomeChildrenList';
import NewResourceButton from '../common/NewResourceButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import SourceForm from '../sources/SourceForm';
import CollectionForm from '../collections/CollectionForm';

const OrgHomeTabs = props => {
  const {
    tab, org, location, url, pins, showPin, onTabChange, onPinCreate, onPinDelete, aboutTab
  } = props;
  const about = get(org, 'extras.about')
  const [sourceForm, setSourceForm] = React.useState(false);
  const [collectionForm, setCollectionForm] = React.useState(false);

  const onNewClick = resource => {
    if(resource === 'source')
      setSourceForm(true)
    if(resource === 'collection')
      setCollectionForm(true)
  }

  const hasAccess = currentUserHasAccess()
  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header col-md-8 no-side-padding' value={tab} onChange={onTabChange} aria-label="concept-home-tabs" classes={{indicator: 'hidden'}}>
        <Tab label="Sources" />
        <Tab label="Collections" />
        <Tab label="Members" />
        {aboutTab && <Tab label="About" />}
      </Tabs>
      {
        hasAccess &&
        <div className='col-md-4 no-right-padding' style={{textAlign: 'right'}}>
          <NewResourceButton resources={['source', 'collection']} onClick={onNewClick} />
        </div>
      }
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px', width: '100%'}}>
        {
          tab === 0 &&
          <OrgHomeChildrenList
            org={org}
            location={location}
            url={url}
            pins={pins}
            showPin={showPin}
            onPinCreate={onPinCreate}
            onPinDelete={onPinDelete}
            resource='sources'
          />
        }
        {
          tab === 1 &&
          <OrgHomeChildrenList
            org={org}
            location={location}
            url={url}
            pins={pins}
            showPin={showPin}
            onPinCreate={onPinCreate}
            onPinDelete={onPinDelete}
            resource='collections'
          />
        }
        {
          tab === 2 &&
          <OrgHomeChildrenList
            org={org}
            location={location}
            url={url}
            resource='users'
            urlPath='members'
          />
        }
        {
          aboutTab && tab === 3 &&
          <AboutAccordian id={org.id} about={about} />
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
