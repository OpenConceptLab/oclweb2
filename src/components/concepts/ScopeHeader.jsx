import React from 'react';
import alertifyjs from 'alertifyjs';
import { IconButton, Chip } from '@mui/material';
import {
  CancelOutlined as CancelIcon,
} from '@mui/icons-material';
import { get } from 'lodash';
import APIService from '../../services/APIService';
import { BLUE } from '../../common/constants';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import CommonFormDrawer from '../common/CommonFormDrawer';
import ConceptIcon from './ConceptIcon';
import ConceptForm from './ConceptForm';
import ResourceTextBreadcrumbs from '../common/ResourceTextBreadcrumbs';
import HomeActionButton from '../common/SourceChildHomeActionButton';

const ScopeHeader = ({
  concept, versionedObjectURL, header, onClose, global, scoped, showActions, isVersionedObject, mappings,
  currentURL
}) => {
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
  return (
    <header className='home-header col-md-12' style={{paddingTop: 0, paddingBottom: 0}}>
      <div className='col-md-12 no-side-padding container' style={{lineHeight: 'normal'}}>
        {
          (global || scoped === 'collection') && concept &&
          <ResourceTextBreadcrumbs style={{marginBottom: '5px'}} resource={concept} />
        }
        <span style={{marginLeft: '15px', display: 'block'}}>
          <ConceptIcon shrink={false} style={{marginTop: '-10px'}} />
        </span>
        <div className='col-xs-10 no-right-padding'>
          <div className='col-xs-12 no-side-padding' style={{fontSize: '20px'}}>
            <span style={{color: BLUE}}>
              <b>{concept.id}</b>
            </span>
            <span style={{marginLeft: '5px'}}>
              <b>{concept.display_name}</b>
            </span>
            {
              concept.retired &&
              <Chip className='retired-red' style={{marginLeft: '10px'}} size='small' label='Retired' />
            }
            {
              showActions &&
              <span style={{marginLeft: '15px'}}>
                <HomeActionButton
                  instance={concept}
                  currentURL={currentURL}
                  isVersionedObject={isVersionedObject}
                  onEditClick={() => setConceptForm(true)}
                  onRetire={onRetire}
                  onUnretire={onUnretire}
                  mappings={mappings}
                  resource='concept'
                />
              </span>
            }
          </div>
          <div className='col-md-12 no-side-padding' style={{marginLeft: '4px'}}>
            <div className='col-md-12 no-side-padding flex-vertical-center'>
              <span className='italic' style={{marginRight: '5px', color: '#707070'}}>
                Class:
              </span>
              <span>
                {concept.concept_class}
              </span>
              <span className='italic' style={{marginLeft: '15px', marginRight: '5px', color: '#707070'}}>
                Datatype:
              </span>
              <span>
                {concept.datatype}
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
            </div>
            {
              concept.external_id &&
              <div className='col-md-12 no-side-padding flex-vertical-center' style={{marginTop: '-6px'}}>
                <ExternalIdLabel externalId={concept.external_id} iconSize='medium' />
              </div>
            }
          </div>
        </div>
        {
          onClose &&
          <span className='col-md-1 no-side-padding' style={{display: 'block', textAlign: 'right'}}>
            <IconButton size='small' color='secondary' onClick={onClose}>
              <CancelIcon fontSize='inherit' />
            </IconButton>
          </span>
        }
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

export default ScopeHeader;
