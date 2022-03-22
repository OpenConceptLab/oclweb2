import React from 'react';
import { IconButton, Chip } from '@mui/material';
import {
  CancelOutlined as CancelIcon,
} from '@mui/icons-material';
import { BLUE } from '../../common/constants';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import CommonFormDrawer from '../common/CommonFormDrawer';
import ConceptIcon from './ConceptIcon';
import ConceptForm from './ConceptForm';
import ResourceTextBreadcrumbs from '../common/ResourceTextBreadcrumbs';

const ScopeHeader = ({
  concept, versionedObjectURL, header, onClose, global, scoped
}) => {
  const [conceptForm, setConceptForm] = React.useState(false);
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
