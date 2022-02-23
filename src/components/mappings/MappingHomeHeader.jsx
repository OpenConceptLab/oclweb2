import React from 'react';
import alertifyjs from 'alertifyjs';
import { Tooltip, ButtonGroup, Button, Collapse } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  FileCopy as CopyIcon,
  CompareArrows as CompareArrowsIcon,
} from '@mui/icons-material';
import { get } from 'lodash';
import { DARKGRAY } from '../../common/constants';
import { currentUserHasAccess, isLoggedIn, copyURL, toFullAPIURL } from '../../common/utils';
import APIService from '../../services/APIService';
import OwnerButton from '../common/OwnerButton';
import SourceButton from '../common/SourceButton';
import MappingButton from '../common/MappingButton';
import VersionButton from '../common/VersionButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import CommonFormDrawer from '../common/CommonFormDrawer';
import DownloadButton from '../common/DownloadButton';
import AddToCollection from '../common/AddToCollection';
import CollapsibleDivider from '../common/CollapsibleDivider';
import FromConceptLabel from './FromConceptLabel';
import ToConceptLabel from './ToConceptLabel';
import MappingIcon from './MappingIcon';
import MappingForm from './MappingForm';

const LABEL_STYLES = {
  textAlign: 'center', marginTop: '4px', fontSize: '12px', color: DARKGRAY
};

const MappingHomeHeader = ({
  mapping, isVersionedObject, versionedObjectURL, currentURL, header, tab
}) => {
  const downloadFileName = isVersionedObject ?
                           `mapping-${mapping.id}` :
                           `mapping-${mapping.id}-version-${mapping.version}`;
  const isRetired = mapping.retired;
  const hasAccess = currentUserHasAccess();
  const isAuthenticated = isLoggedIn();
  const resourceRelativeURL = isVersionedObject ? mapping.url : mapping.version_url;
  const [openHeader, setOpenHeader] = React.useState((!tab || tab === 0) && header);
  const [mappingForm, setMappingForm] = React.useState(false);
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
    prompt.set('title', 'Retire Mapping')
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
      .set('title', 'Unretire Mapping')
      .show()
  }

  const retire = comment => {
    APIService.new().overrideURL(versionedObjectURL).delete({comment: comment}).then(response => {
      if(get(response, 'status') === 204)
        alertifyjs.success('Mapping Retired', 1, () => window.location.reload())
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  const unretire = comment => {
    APIService.new().overrideURL(versionedObjectURL).appendToUrl('reactivate/').put({comment: comment}).then(response => {
      if(get(response, 'status') === 204)
        alertifyjs.success('Mapping UnRetired', 1, () => window.location.reload())
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  const onIconClick = () => copyURL(toFullAPIURL(currentURL))
  const conceptCompareURL = (mapping.from_concept_url && mapping.to_concept_url) ?
                            `/concepts/compare?lhs=${mapping.from_concept_url}&rhs=${mapping.to_concept_url}` :
                            null;

  return (
    <header className='home-header col-md-12'>
      <div className='col-md-12 no-side-padding container' style={{paddingTop: '10px'}}>
        <MappingIcon shrink={!openHeader} />
        <div className='col-md-11' style={{width: '95%', marginBottom: '5px'}}>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <OwnerButton {...mapping} href={versionedObjectURL} />
            <span className='separator'>/</span>
            <SourceButton label={mapping.source} childURI={versionedObjectURL} />
            <span className='separator'>/</span>
            <MappingButton label={mapping.id} mapType={mapping.map_type} retired={isRetired} href={`#${versionedObjectURL}`} />
            {
              !isVersionedObject &&
              <React.Fragment>
                <span className='separator'>/</span>

                <VersionButton label={mapping.version} retired={isRetired} href={`#${currentURL}`} />
              </React.Fragment>
            }
            <span style={{marginLeft: '15px'}}>
              <ButtonGroup variant='text' size='large'>
                <Tooltip arrow title="Copy URL">
                  <Button onClick={onIconClick} color='secondary'>
                    <CopyIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
                {
                  hasAccess && isVersionedObject &&
                  <Tooltip arrow title='Edit Mapping'>
                    <Button onClick={() => setMappingForm(true)} color='secondary'>
                      <EditIcon fontSize='inherit' />
                    </Button>
                  </Tooltip>
                }
                {
                  hasAccess && isVersionedObject &&
                  (
                    isRetired ?
                    <Tooltip arrow title='Un-Retire Mapping'>
                      <Button onClick={onUnretire} color='secondary'>
                        <RestoreIcon fontSize='inherit' />
                      </Button>
                    </Tooltip> :
                    <Tooltip arrow title='Retire Mapping'>
                      <Button onClick={onRetire} color='secondary'>
                        <DeleteIcon fontSize='inherit' />
                      </Button>
                    </Tooltip>
                  )
                }
                {
                  isAuthenticated &&
                  <AddToCollection
                    references={[{...mapping, url: resourceRelativeURL}]}
                    iconButton
                  />
                }
                {
                  conceptCompareURL &&
                  <Tooltip arrow title='Compare Concepts'>
                    <Button onClick={() => window.location.hash = conceptCompareURL} color='secondary'>
                      <CompareArrowsIcon fontSize='inherit' />
                    </Button>
                  </Tooltip>
                }
                <DownloadButton resource={mapping} filename={downloadFileName} />
              </ButtonGroup>
            </span>
          </div>
          <Collapse in={openHeader} className='col-md-12 no-side-padding' style={{padding: '0px', display: `${openHeader ? 'block' : 'none'}`}}>
            <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
              <div className='col-sm-1 no-side-padding' style={LABEL_STYLES}>
                From:
              </div>
              <div className='col-sm-11 no-side-padding'>
                <FromConceptLabel {...mapping} />
              </div>
            </div>
            <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '5px'}}>
              <div className='col-sm-1 no-side-padding' style={LABEL_STYLES}>
                To:
              </div>
              <div className='col-sm-11 no-side-padding'>
                <ToConceptLabel {...mapping} />
              </div>
            </div>
            <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
              <span>
                <LastUpdatedOnLabel
                  date={mapping.updated_on}
                  by={mapping.updated_by}
                  iconSize='medium'
                  noContainerClass
                />
              </span>
              <span style={{marginLeft: '10px'}}>
                <LastUpdatedOnLabel
                  label='Created'
                  date={mapping.created_on}
                  by={mapping.created_by}
                  iconSize='medium'
                  noContainerClass
                />
              </span>
              {
                mapping.external_id &&
                <span style={{marginLeft: '10px', marginTop: '-8px'}}>
                  <ExternalIdLabel externalId={mapping.external_id} iconSize='medium' />
                </span>
              }
            </div>
          </Collapse>
        </div>
        <CollapsibleDivider open={openHeader} onClick={() => setOpenHeader(!openHeader)} light />
      </div>
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={mappingForm}
        onClose={() => setMappingForm(false)}
        formComponent={
          <MappingForm edit reloadOnSuccess onCancel={() => setMappingForm(false)} mapping={mapping} parentURL={versionedObjectURL} />
        }
      />
    </header>
  );
}

export default MappingHomeHeader;
