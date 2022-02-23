import React from 'react';
import alertifyjs from 'alertifyjs';
import { Tooltip, ButtonGroup, Button, Collapse } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  FileCopy as CopyIcon,
  FormatIndentIncrease as HierarchyIcon,
} from '@mui/icons-material';
import { get } from 'lodash';
import { currentUserHasAccess, isLoggedIn, copyURL, toFullAPIURL, isAdminUser } from '../../common/utils';
import APIService from '../../services/APIService';
import OwnerButton from '../common/OwnerButton';
import SourceButton from '../common/SourceButton';
import ConceptButton from '../common/ConceptButton';
import VersionButton from '../common/VersionButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import CommonFormDrawer from '../common/CommonFormDrawer';
import DownloadButton from '../common/DownloadButton';
import AddToCollection from '../common/AddToCollection';
import CollapsibleDivider from '../common/CollapsibleDivider';
import ConceptIcon from './ConceptIcon';
import ConceptForm from './ConceptForm';
import ConceptDisplayName from './ConceptDisplayName';

const ConceptHomeHeader = ({
  concept, mappings, isVersionedObject, versionedObjectURL, currentURL, hierarchy, onHierarchyClick,
  header, tab
}) => {
  const downloadFileName = isVersionedObject ?
                           `concept-${concept.id}` :
                           `concept-${concept.id}-version-${concept.version}`;
  const isRetired = concept.retired;
  const hasAccess = currentUserHasAccess();
  const isAuthenticated = isLoggedIn();
  const resourceRelativeURL = isVersionedObject ? concept.url : concept.version_url;
  const [openHeader, setOpenHeader] = React.useState((!tab || tab === 0) && header);
  const [conceptForm, setConceptForm] = React.useState(false);
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
    APIService.new().overrideURL(versionedObjectURL).delete({comment: comment}).then(response => {
      if(get(response, 'status') === 204)
        alertifyjs.success('Concept Retired', 1, () => window.location.reload())
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  const unretire = comment => {
    APIService.new().overrideURL(versionedObjectURL).appendToUrl('reactivate/').put({comment: comment}).then(response => {
      if(get(response, 'status') === 204)
        alertifyjs.success('Concept UnRetired', 1, () => window.location.reload())
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  const onIconClick = () => copyURL(toFullAPIURL(encodeURI(currentURL)))
  return (
    <header className='home-header col-xs-12'>
      <div className='col-xs-12 no-side-padding container' style={{paddingTop: '10px'}}>
        <ConceptIcon shrink={!openHeader} />
        <div className='col-xs-11' style={{width: '95%', marginBottom: '5px'}}>
          <div className='col-xs-12 no-side-padding flex-vertical-center'>
            <OwnerButton {...concept} href={versionedObjectURL} />
            <span className='separator'>/</span>
            <SourceButton label={concept.source} childURI={versionedObjectURL} />
            <span className='separator'>/</span>
            <ConceptButton label={concept.id} retired={isRetired} href={`#${encodeURI(versionedObjectURL)}`} />
            {
              !isVersionedObject &&
              <React.Fragment>
                <span className='separator'>/</span>

                <VersionButton label={concept.version} retired={isRetired} href={`#${encodeURI(currentURL)}`} />
              </React.Fragment>
            }
            <span style={{marginLeft: '15px'}}>
              <ButtonGroup variant='text' size='large'>
                <Tooltip arrow title="Copy URL">
                  <Button onClick={onIconClick} color='secondary' >
                    <CopyIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
                {
                  hasAccess && isVersionedObject &&
                  <Tooltip arrow title='Edit Concept'>
                    <Button onClick={() => setConceptForm(true)} color='secondary'>
                      <EditIcon fontSize='inherit' />
                    </Button>
                  </Tooltip>
                }
                {
                  hasAccess && isVersionedObject &&
                  (
                    isRetired ?
                    <Tooltip arrow title='Un-Retire Concept'>
                      <Button onClick={onUnretire} color='secondary'>
                        <RestoreIcon fontSize='inherit' />
                      </Button>
                    </Tooltip> :
                    <Tooltip arrow title='Retire Concept'>
                      <Button onClick={onRetire} color='secondary'>
                        <DeleteIcon fontSize='inherit' />
                      </Button>
                    </Tooltip>
                  )
                }
                {
                  isAuthenticated &&
                  <AddToCollection
                    references={[{...concept, url: resourceRelativeURL}]}
                    iconButton
                  />
                }
                {
                  isAdminUser() &&
                  <Tooltip arrow title={hierarchy ? 'Hide Hierarchy' : 'Show Hierarchy (Beta)'}>
                    <Button onClick={onHierarchyClick} color={hierarchy ? 'primary' : 'secondary'}>
                      <HierarchyIcon fontSize='inherit' />
                    </Button>
                  </Tooltip>
                }
                <DownloadButton resource={{...concept, mappings: mappings}} filename={downloadFileName} queryParams={{includeInverseMappings: true, includeHierarchyPath: true, includeParentConceptURLs: true}} />
              </ButtonGroup>
            </span>
          </div>
          <div className='col-xs-12 no-side-padding flex-vertical-center' style={{paddingTop: '5px'}}>
            <ConceptDisplayName concept={concept} style={{marginRight: '10px'}} />
          </div>
          <Collapse in={openHeader} className='col-xs-12 no-side-padding' style={{padding: '0px', display: `${openHeader ? 'block' : 'none'}`}}>
            <div className='col-xs-12 no-side-padding flex-vertical-center'>
              <span className='italic' style={{marginRight: '3px'}}>
                Class:
              </span>
              <span>
                {concept.concept_class},
              </span>
              <span className='italic' style={{marginLeft: '5px', marginRight: '3px'}}>
                Datatype:
              </span>
              <span>
                {concept.datatype}
              </span>
            </div>
            <div className='col-xs-12 no-side-padding flex-vertical-center' style={{marginTop: '2px'}}>
              <span>
                <LastUpdatedOnLabel
                  date={concept.updated_on}
                  by={concept.updated_by}
                  iconSize='medium'
                  noContainerClass
                />
              </span>
              <span style={{marginLeft: '10px'}}>
                <LastUpdatedOnLabel
                  label='Created'
                  date={concept.created_on}
                  by={concept.created_by}
                  iconSize='medium'
                  noContainerClass
                />
              </span>
              {
                concept.external_id &&
                <span style={{marginLeft: '10px', marginTop: '-8px'}}>
                  <ExternalIdLabel externalId={concept.external_id} iconSize='medium' />
                </span>
              }
            </div>
          </Collapse>
        </div>
        <CollapsibleDivider open={openHeader} onClick={() => setOpenHeader(!openHeader)} light />
      </div>
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={conceptForm}
        onClose={() => setConceptForm(false)}
        formComponent={
          <ConceptForm edit reloadOnSuccess onCancel={() => setConceptForm(false)} concept={concept} parentURL={versionedObjectURL} />
        }
      />
    </header>
  )
}

export default ConceptHomeHeader;
