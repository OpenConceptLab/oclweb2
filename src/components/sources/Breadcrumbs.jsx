import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  CancelOutlined as CancelIcon,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { isEmpty, get, startCase } from 'lodash';
import { currentUserHasAccess } from '../../common/utils';
import { WHITE, ORANGE, GREEN, BLUE } from '../../common/constants';
import APIService from '../../services/APIService';
import OwnerButton from '../common/OwnerButton';
import SourceButton from '../common/SourceButton';
import CollectionButton from '../common/CollectionButton';
import ExpansionSelectorButton from '../common/ExpansionSelectorButton';
import ConceptButton from '../common/ConceptButton';
import MappingButton from '../common/MappingButton';
import ResourceVersionButton from '../common/VersionButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import SourceForm from './SourceForm';
import CollectionForm from '../collections/CollectionForm';
import ConceptContainerDelete from '../common/ConceptContainerDelete';
import VersionSelectorButton from '../common/VersionSelectorButton';
import ManageSourceChildButton from '../common/ManageSourceChildButton';
import ConceptForm from '../concepts/ConceptForm';
import MappingForm from '../mappings/MappingForm';

const Breadcrumbs = ({
  params, selectedResource, container, isVersionedObject, versionedObjectURL, versions, onSplitViewClose,
  isLoadingExpansions, expansions, expansion
}) => {
  const [conceptForm, setConceptForm] = React.useState(false);
  const [mappingForm, setMappingForm] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState(false);
  const [sourceForm, setSourceForm] = React.useState(false);
  const [collectionForm, setCollectionForm] = React.useState(false);
  const containerLabel = params.source ? 'Source' : 'Collection'
  const owner = params.org ? params.org : params.user
  const ownerType = params.org ? 'org' : 'user'
  const parent = params.source || params.collection
  const parentType = params.source ? 'source' : 'collection'
  const parentVersion = params.version || 'HEAD'
  const resource = params.concept || params.mapping
  const resourceType = params.concept ? 'concept' : (params.mapping ? 'mapping' : null)
  const resourceVersion = params.conceptVersion || params.mappingVersion
  const ownerURL = `#/${ownerType}s/${owner}/`;
  const parentURL = `${ownerURL}${parentType}s/${parent}/`;
  const parentVersionURL = parentVersion === 'HEAD' ? parentURL : `${parentURL}${parentVersion}/`;
  const resourceURL = `${parentVersionURL}${resourceType}s/${resource}/`
  const resourceVersionURL = `${resourceURL}${resourceVersion}/`
  const unselectedParentProps = {variant: 'outlined', style: {borderColor: GREEN, color: GREEN, boxShadow: 'none', textTransform: 'none', border: '1px solid', background: WHITE}}
  const parentProps = (parentVersion === 'HEAD' && !resource) ? {} : unselectedParentProps;
  const parentVersionProps = (expansion || (resource && selectedResource)) ? {...unselectedParentProps, className: ''} : {}
  const expansionProps = (resource && selectedResource) ? {...unselectedParentProps, className: ''} : {}
  const resourceProps = resourceVersion ? {variant: 'outlined', style: {borderColor: BLUE, color: BLUE, background: WHITE, border: '1px solid'}} : {}

  const downloadFileName = isVersionedObject ? `${container.type}-${container.short_code}` : `${container.type}-${container.short_code}-${container.id}`;
  const hasAccess = currentUserHasAccess();
  const deleteContainer = () => {
    APIService.new().overrideURL(container.url).delete().then(response => {
      if(get(response, 'status') === 204)
        alertifyjs.success(`${containerLabel} Deleted`, 1, () => window.location.hash = container.owner_url)
      else if(get(response, 'status') === 202)
        alertifyjs.success(`${containerLabel} Delete Accepted. This may take few minutes.`)
      else if(get(response, 'status') === 400)
        alertifyjs.error(get(response, 'data.detail', `${containerLabel} Delete Failed`))
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  const onRetire = () => {
    const prompt = alertifyjs.prompt()
    prompt.setContent('<form id="retireForm"> <p>Retire Reason</p> <textarea required id="comment" style="width: 100%;"></textarea> </form>')
    prompt.set('onok', () => {
      document.getElementById('retireForm').reportValidity();
      const comment = document.getElementById('comment').value
      if(!comment)
        return false
      retire(comment)
    })
    prompt.set('title', 'Retire Concept')
    prompt.show()
  }

  const onUnretire = () => {
    const prompt = alertifyjs
      .prompt()
    prompt.setContent('<form id="retireForm"> <p>Unretire Reason</p> <textarea required id="comment" style="width: 100%;"></textarea> </form>')
      .set('onok', () => {
        document.getElementById('retireForm').reportValidity();
        const comment = document.getElementById('comment').value
        if(!comment)
          return false
        unretire(comment)
      })
      .set('title', 'Unretire Concept')
      .show()
  }

  const retire = comment => {
    APIService.new().overrideURL(resourceURL).delete({comment: comment}).then(response => {
      if(get(response, 'status') === 204)
        alertifyjs.success(`${startCase(resource)} Retired`, 1, () => window.location.reload())
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  const unretire = comment => {
    APIService.new().overrideURL(resourceURL).appendToUrl('reactivate/').put({comment: comment}).then(response => {
      if(get(response, 'status') === 204)
        alertifyjs.success(`${startCase(resource)} Unretired`, 1, () => window.location.reload())
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  return (
    <header className='col-xs-12 no-side-padding'>
      <div className='col-xs-12 no-side-padding container'>
        <div className='col-xs-12'>
          <div className='col-xs-12 no-side-padding flex-vertical-center'>
            <span className='flex-vertical-center' style={{width: '100%'}}>
              <span className='container-breadcurmbs flex-vertical-center' style={{padding: '10px 10px 10px 0', background: WHITE}}>
                <OwnerButton uri={ownerURL} owner={owner} variant='outlined' style={{borderColor: ORANGE, color: ORANGE, boxShadow: 'none', textTransform: 'none', border: '1px solid'}} />
                <span className='separator'>/</span>
                {
                  params.source ?
                  <SourceButton
                    source={container}
                    label={parent}
                    href={parentURL}
                    onEditClick={() => params.source ? setSourceForm(true) : setCollectionForm(true)}
                    onDeleteClick={() => setDeleteDialog(true) }
                    downloadFileName={downloadFileName}
                    {...parentProps}
                  /> :
                  <CollectionButton
                    collection={container}
                    label={parent}
                    href={parentURL}
                    onEditClick={() => setCollectionForm(true)}
                    onDeleteClick={() => setDeleteDialog(true) }
                    downloadFileName={downloadFileName}
                    {...parentProps}
                  />
                }
                <span className='separator'>/</span>
                <VersionSelectorButton
                  selected={container}
                  versions={versions}
                  resource={parentType}
                  {...parentVersionProps}
                />
                {
                  params.collection && !isEmpty(expansions) && !isLoadingExpansions &&
                  <React.Fragment>
                    <span className='separator'>/</span>
                    <ExpansionSelectorButton
                      selected={expansion}
                      expansions={expansions}
                      version={container}
                      {...expansionProps}
                    />
                  </React.Fragment>
                }
              </span>
              {
                resource && selectedResource &&
                <span className='resource-breadcurmbs flex-vertical-center' style={{background: '#f1f1f1', padding: '10px', border: '1px solid #f1f1f1', flex: 1}}>
                  {
                    params.concept ?
                    <ConceptButton label={resource} href={params.source ? resourceURL : undefined} {...resourceProps} /> :
                    <MappingButton label={resource} href={params.source ? resourceURL : undefined} {...resourceProps} />
                  }
                  {
                    resourceVersion &&
                    <React.Fragment>
                      <span className='separator'>/</span>
                      <ResourceVersionButton label={resourceVersion} href={params.source ? resourceVersionURL : undefined} />
                    </React.Fragment>
                  }
                  <span className='flex-vertical-center' style={{marginLeft: '10px'}}>
                    <ManageSourceChildButton
                      resource={resourceType}
                      instance={selectedResource}
                      isVersionedObject={Boolean(!resourceVersion)}
                      currentURL={resourceVersion ? resourceVersionURL : resourceURL}
                      onEditClick={() => params.source ? (resourceType === 'concept' ? setConceptForm(true) : setMappingForm(true)) : null}
                      onRetire={() => params.source ? onRetire() : null}
                      onUnretire={() => params.source ? onUnretire() : null}
                    />
                  </span>

                </span>
              }
            </span>
            {
              resource && selectedResource &&
              <span style={{background: '#f1f1f1', border: '1px solid #f1f1f1', marginRight: '5px'}}>
                <IconButton size='small' color='secondary' onClick={onSplitViewClose}>
                  <CancelIcon fontSize='inherit' />
                </IconButton>
              </span>
            }
          </div>
        </div>
      </div>
      <CommonFormDrawer
        style={{zIndex: '1202'}}
        isOpen={sourceForm}
        onClose={() => setSourceForm(false)}
        formComponent={
          <SourceForm edit reloadOnSuccess onCancel={() => setSourceForm(false)} source={{...container, id: container.short_code}} parentURL={versionedObjectURL} />
        }
      />
      <CommonFormDrawer
        style={{zIndex: '1202'}}
        isOpen={collectionForm}
        onClose={() => setCollectionForm(false)}
        formComponent={
          <CollectionForm edit reloadOnSuccess onCancel={() => setCollectionForm(false)} collection={{...container, id: container.short_code}} parentURL={versionedObjectURL} />
        }
      />
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={conceptForm}
        onClose={() => setConceptForm(false)}
        formComponent={
          <ConceptForm edit reloadOnSuccess onCancel={() => setConceptForm(false)} concept={selectedResource} parentURL={resourceURL.replace('#', '')} />
        }
      />
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={mappingForm}
        onClose={() => setMappingForm(false)}
        formComponent={
          <MappingForm edit reloadOnSuccess onCancel={() => setMappingForm(false)} mapping={selectedResource} parentURL={resourceURL.replace('#', '')} />
        }
      />
      {
        hasAccess && !isEmpty(container) &&
        <ConceptContainerDelete open={deleteDialog} resource={{...container, id: container.short_code}} onClose={() => setDeleteDialog(false)} onDelete={deleteContainer} />
      }
    </header>
  )
}

export default Breadcrumbs;
