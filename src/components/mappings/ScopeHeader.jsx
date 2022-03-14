import React from 'react';
import alertifyjs from 'alertifyjs';
import { IconButton, Chip } from '@mui/material';
import {
  CancelOutlined as CancelIcon,
} from '@mui/icons-material';
import { get } from 'lodash';
import { DARKGRAY, BLUE } from '../../common/constants';
import APIService from '../../services/APIService';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import CommonFormDrawer from '../common/CommonFormDrawer';
import FromConceptLabel from './FromConceptLabel';
import ToConceptLabel from './ToConceptLabel';
import MappingIcon from './MappingIcon';
import MappingForm from './MappingForm';
import HomeActionButton from '../common/SourceChildHomeActionButton';
import ResourceTextBreadcrumbs from '../common/ResourceTextBreadcrumbs';

const LABEL_STYLES = {
  textAlign: 'center', marginTop: '4px', fontSize: '12px', color: DARKGRAY
};

const ScopeHeader = ({
  mapping, isVersionedObject, versionedObjectURL, currentURL, header, onClose, global, scoped
}) => {
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

  const conceptCompareURL = (mapping.from_concept_url && mapping.to_concept_url) ?
                            `/#/concepts/compare?lhs=${mapping.from_concept_url}&rhs=${mapping.to_concept_url}` :
                            null;

  return (
    <header className='home-header col-md-12'>
      <div className='col-md-12 no-side-padding container' style={{lineHeight: 'normal'}}>
        {
          (global || scoped === 'collection') && mapping &&
          <ResourceTextBreadcrumbs style={{marginBottom: '5px'}} resource={mapping} />
        }
        <span style={{marginLeft: '15px', display: 'block'}}>
          <MappingIcon shrink={false} style={{marginTop: '-20px'}} />
        </span>
        <div className='col-md-10 no-right-padding'>
          <div className='col-md-12 no-side-padding' style={{fontSize: '20px'}}>
            <span style={{color: BLUE}}>
              <b>{mapping.id}</b>
            </span>
            <span style={{marginLeft: '5px'}}>
              <b>{mapping.map_type}</b>
            </span>
            {
              mapping.retired &&
              <Chip className='retired-red' style={{marginLeft: '10px'}} size='small' label='Retired' />
            }
            {
              global &&
              <span style={{marginLeft: '15px'}}>
                <HomeActionButton
                  instance={mapping}
                  currentURL={currentURL}
                  isVersionedObject={isVersionedObject}
                  onEditClick={() => setMappingForm(true)}
                  onRetire={onRetire}
                  onUnretire={onUnretire}
                  conceptCompareURL={conceptCompareURL}
                  resource='mapping'
                />
              </span>
            }
          </div>
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
          </div>
          {
            mapping.external_id &&
            <div className='col-md-12 no-side-padding flex-vertical-center' style={{marginTop: '-6px'}}>
              <ExternalIdLabel externalId={mapping.external_id} iconSize='medium' />
            </div>
          }
        </div>
        {
          global && onClose &&
          <span className='col-md-1 no-side-padding' style={{marginLeft: '5px', display: 'block', textAlign: 'right'}}>
            <IconButton size='small' color='secondary' onClick={onClose}>
              <CancelIcon fontSize='inherit' />
            </IconButton>
          </span>
        }
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

export default ScopeHeader;
