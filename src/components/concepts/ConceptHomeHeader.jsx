import React from 'react';
import alertifyjs from 'alertifyjs';
import { Tooltip, ButtonGroup, Button } from '@material-ui/core';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  FileCopy as CopyIcon,
} from '@material-ui/icons';
import { get } from 'lodash';
import { currentUserHasAccess, copyURL, toFullAPIURL } from '../../common/utils';
import APIService from '../../services/APIService';
import OwnerButton from '../common/OwnerButton';
import SourceButton from '../common/SourceButton';
import ConceptButton from '../common/ConceptButton';
import VersionButton from '../common/VersionButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import CustomAttributesPopup from '../common/CustomAttributesPopup';
import CommonFormDrawer from '../common/CommonFormDrawer';
import DownloadButton from '../common/DownloadButton';
import ConceptIcon from './ConceptIcon';
import ConceptForm from './ConceptForm';

const ConceptHomeHeader = ({
  concept, mappings, isVersionedObject, versionedObjectURL, currentURL
}) => {
  const downloadFileName = isVersionedObject ?
                           `concept-${concept.id}` :
                           `concept-${concept.id}-version-${concept.version}`;
  const isRetired = concept.retired;
  const hasAccess = currentUserHasAccess();
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

  const onIconClick = () => copyURL(toFullAPIURL(currentURL))

  return (
    <header className='home-header col-md-12'>
      <div className='col-md-12 no-side-padding container' style={{paddingTop: '10px'}}>
        <ConceptIcon />
        <div className='col-md-11' style={{width: '95%'}}>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <OwnerButton {...concept} href={versionedObjectURL} />
            <span className='separator'>/</span>
            <SourceButton label={concept.source} childURI={versionedObjectURL} />
            <span className='separator'>/</span>
            <ConceptButton label={concept.id} retired={isRetired} href={`#${versionedObjectURL}`} />
            {
              !isVersionedObject &&
              <React.Fragment>
                <span className='separator'>/</span>

                <VersionButton label={concept.version} retired={isRetired} href={`#${currentURL}`} />
              </React.Fragment>
            }
            <span style={{marginLeft: '15px'}}>
              <ButtonGroup variant='text' size='large'>
                <Tooltip title="Copy URL">
                  <Button onClick={onIconClick}>
                    <CopyIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
                {
                  hasAccess && isVersionedObject &&
                  <Tooltip title='Edit Concept'>
                    <Button onClick={() => setConceptForm(true)}>
                      <EditIcon fontSize='inherit' />
                    </Button>
                  </Tooltip>
                }
                {
                  hasAccess && isVersionedObject &&
                  (
                    isRetired ?
                    <Tooltip title='Un-Retire Concept'>
                      <Button onClick={onUnretire}>
                        <RestoreIcon fontSize='inherit' />
                      </Button>
                    </Tooltip> :
                    <Tooltip title='Retire Concept'>
                      <Button onClick={onRetire}>
                        <DeleteIcon fontSize='inherit' />
                      </Button>
                    </Tooltip>
                  )
                }
                <DownloadButton resource={{...concept, mappings: mappings}} filename={downloadFileName} />
              </ButtonGroup>
            </span>
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '5px'}}>
            <span style={{marginRight: '10px'}} className={isRetired ? 'retired': ''}>
              {concept.display_name}
            </span>
            <span className='gray-italics-small'>
              [{concept.display_locale}]
            </span>
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
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
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <span className='italic' style={{marginRight: '3px'}}>
              Custom Attributes:
            </span>
            <span>
              <CustomAttributesPopup attributes={concept.extras} />
            </span>
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center' style={{marginTop: '2px'}}>
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
        </div>
      </div>
      <CommonFormDrawer
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
