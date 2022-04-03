import React from 'react';
import { Link } from 'react-router-dom';
import { IconButton, Chip, Tooltip } from '@mui/material';
import alertifyjs from 'alertifyjs';
import { get } from 'lodash';
import {
  CancelOutlined as CancelIcon,
} from '@mui/icons-material';
import APIService from '../../services/APIService';
import { DARKGRAY, BLUE, BLACK } from '../../common/constants';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import CommonFormDrawer from '../common/CommonFormDrawer';
import FromConceptLabel from './FromConceptLabel';
import ToConceptLabel from './ToConceptLabel';
import MappingIcon from './MappingIcon';
import MappingForm from './MappingForm';
import ResourceTextBreadcrumbs from '../common/ResourceTextBreadcrumbs';
import HomeActionButton from '../common/SourceChildHomeActionButton';

const LABEL_STYLES = {
  marginTop: '4px', fontSize: '12px', color: DARKGRAY, marginRight: '10px', width: '25px'
};

const ScopeHeader = ({
  mapping, isVersionedObject, versionedObjectURL, currentURL, header, onClose, global, scoped, showActions
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

  const resourceURL = (mapping.versioned_object_id.toString() === mapping.uuid || mapping.is_latest_version) ? mapping.url : mapping.version_url

  return (
    <header className='resource-header home-header col-xs-12' style={{paddingTop: '5px', paddingBottom: 0, position: 'fixed', zIndex: 1, paddingLeft: '5px'}}>
      <div className='col-md-12 no-side-padding container' style={{lineHeight: 'normal'}}>
        <div className="col-xs-12 no-side-padding">
          {
            (global || scoped === 'collection') && mapping &&
            <div className="col-xs-11 no-side-padding">
              <ResourceTextBreadcrumbs style={{marginBottom: '5px', marginLeft: '5px'}} resource={mapping} />
            </div>
          }
          {
            onClose &&
            <span className='col-xs-1 no-side-padding' style={{display: 'block', textAlign: 'right', position: 'fixed', right: '10px', marginTop: '2px'}}>
              <IconButton size='small' color='secondary' onClick={onClose}>
                <CancelIcon fontSize='inherit' />
              </IconButton>
            </span>
          }
        </div>
        <MappingIcon shrink={false} style={{marginTop: '-10px', marginLeft: '5px'}} />
        <div className='col-md-10 no-right-padding'>
          <div className='col-md-12 no-side-padding' style={{fontSize: '20px'}}>
            <Tooltip title="Navigate to this Mapping under its Source" arrow placement="left">
              <Link to={resourceURL} className="no-anchor-styles">
                <React.Fragment>
                  <span style={{color: BLUE}}>
                    <b>{mapping.id}</b>
                  </span>
                  <span style={{marginLeft: '5px', color: BLACK}}>
                    <b>{mapping.map_type}</b>
                  </span>
                </React.Fragment>
              </Link>
            </Tooltip>
            {
              mapping.retired &&
              <Chip className='retired-red' style={{marginLeft: '10px'}} size='small' label='Retired' />
            }
            {
              showActions &&
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
            <span style={LABEL_STYLES}>
              From:
            </span>
            <span>
              <FromConceptLabel {...mapping} />
            </span>
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '5px'}}>
            <span style={LABEL_STYLES}>
              To:
            </span>
            <span>
              <ToConceptLabel {...mapping} />
            </span>
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
