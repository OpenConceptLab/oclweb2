import React from 'react';
import { IconButton, Chip } from '@mui/material';
import {
  CancelOutlined as CancelIcon,
} from '@mui/icons-material';
import { DARKGRAY, BLUE } from '../../common/constants';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import CommonFormDrawer from '../common/CommonFormDrawer';
import FromConceptLabel from './FromConceptLabel';
import ToConceptLabel from './ToConceptLabel';
import MappingIcon from './MappingIcon';
import MappingForm from './MappingForm';
import ResourceTextBreadcrumbs from '../common/ResourceTextBreadcrumbs';

const LABEL_STYLES = {
  textAlign: 'center', marginTop: '4px', fontSize: '12px', color: DARKGRAY
};

const ScopeHeader = ({
  mapping, versionedObjectURL, header, onClose, global, scoped
}) => {
  const [mappingForm, setMappingForm] = React.useState(false);
  return (
    <header className='home-header col-md-12' style={{paddingTop: 0, paddingBottom: 0}}>
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
