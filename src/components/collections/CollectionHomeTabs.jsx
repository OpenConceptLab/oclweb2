import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get } from 'lodash';
import { currentUserHasAccess } from '../../common/utils';
import ConceptContainerVersionList from '../common/ConceptContainerVersionList';
import CollectionHomeChildrenList from './CollectionHomeChildrenList';
import About from '../common/About';
import NewResourceButton from '../common/NewResourceButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import CollectionVersionForm from './CollectionVersionForm';
import ReferenceForm from './ReferenceForm';

const CollectionHomeTabs = props => {
  const {
    tab, collection, versions, location, versionedObjectURL, currentVersion,
    aboutTab, onVersionUpdate
  } = props;
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

  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header col-md-8 no-side-padding' value={tab} aria-label="concept-home-tabs"  classes={{indicator: 'hidden'}}>
        <Tab label="Concepts" component="a" href={`#${collection.concepts_url}`} />
        <Tab label="Mappings" component="a" href={`#${collection.mappings_url}`} />
        <Tab label="References" component="a" href={`#${currentResourceURL}references/`} />
        <Tab label="Versions" component="a" href={isVersionedObject ? `#${collection.versions_url}` : `#${currentResourceURL}versions/`} />
        {aboutTab && <Tab label="About" component="a" href={`#${currentResourceURL}about/`} />}
      </Tabs>
      {
        hasAccess && isVersionedObject &&
        <div className='col-md-4 no-right-padding' style={{textAlign: 'right'}}>
          <NewResourceButton resources={['references', 'version']} onClick={onNewClick} />
        </div>
      }
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px', width: '100%'}}>
        {
          tab === 0 &&
          <CollectionHomeChildrenList
            collection={collection}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource='concepts'
          />
        }
        {
          tab === 1 &&
          <CollectionHomeChildrenList
            collection={collection}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource='mappings'
          />
        }
        {
          tab === 2 &&
          <CollectionHomeChildrenList
            collection={collection}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource='references'
            references
          />
        }
        {
          tab === 3 &&
          <ConceptContainerVersionList
            versions={versions}
            resource='collection'
            canEdit={hasAccess}
            onUpdate={onVersionUpdate}
          />
        }
        {
          aboutTab && tab === 4 &&
          <About id={collection.id} about={about} />
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
